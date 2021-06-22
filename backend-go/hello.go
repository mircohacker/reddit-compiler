package main

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-lambda-go/lambdacontext"
	"io/ioutil"
	"math"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type LambdaResult struct {
	StatusCode      int     `json:"statusCode"`
	Body            string  `json:"body"`
	IsBase64Encoded bool    `json:"isBase64Encoded"`
	Headers         Headers `json:"headers"`
}
type Headers struct {
	ContentType string `json:"Content-Type"`
}

var client = http.Client{Transport: NewAddHeaderTransport(nil)}

func HandleRequest(ctx context.Context, payload events.APIGatewayProxyRequest) (LambdaResult, error) {
	var retBody interface{}
	lc, _ := lambdacontext.FromContext(ctx)
	bytes, _ := json.Marshal(lc)
	fmt.Println(string(bytes))
	i, _ := json.Marshal(payload)
	fmt.Println(string(i))

	fmt.Println(payload.Path)

	switch payload.Path {
	case "/ping":
		retBody = map[string]string{
			"ping": "pong",
		}
	case "/chapters":
		var err error
		urlParam := payload.PathParameters["url"]
		//searchTermLength, err3 := strconv.ParseInt(payload.PathParameters["search_term_length"], 10, 32)
		//if err3 != nil {
		//	return LambdaResult{}, err3
		//}
		//allReddit, err4 := strconv.ParseBool(payload.PathParameters["allReddit"])
		//if err4 != nil {
		//	return LambdaResult{}, err4
		//}
		//chaptersDto, err := handleChaptersCall(urlParam, searchTermLength,allReddit)
		var chaptersDto SearchChaptersResultDto
		if chaptersDto, err = handleChaptersCall(urlParam); err != nil {
			return LambdaResult{}, err
		}
		if retBody, err = json.Marshal(chaptersDto); err != nil {
			return LambdaResult{}, err
		}
	case "/epub":
		ids := payload.MultiValueQueryStringParameters["ids[]"]
		createEpubFromIds(ids)
	default:
		retBody = ""

	}

	retJson, _ := json.Marshal(retBody)
	result := LambdaResult{
		StatusCode:      200,
		Body:            string(retJson),
		IsBase64Encoded: false,
		Headers: Headers{
			ContentType: "application/json; charset=UTF-8",
		},
	}
	return result, nil
}

func createEpubFromIds(ids []string) {
	getPostsFromIds(ids)
}

func getPostsFromIds(ids []string) []SinglePost {
	stringPath := strings.Join(ids, ",")
	getByIdUrl := fmt.Sprintf("https://www.reddit.com/by_id/%s.json", stringPath)
	return extractPostsFromRedditUrl(getByIdUrl)
}

func extractPostsFromRedditUrl(redditUrl string) []SinglePost {
	req, err := http.NewRequest("GET", redditUrl, nil)
	if err != nil {
		panic(err)
	}
	response, err := client.Do(req)
	if err != nil {
		panic(err)
	}

	body, err := ioutil.ReadAll(response.Body)
	var parsedResult RedditResultListing
	err = json.Unmarshal(body, &parsedResult)
	println(len(parsedResult.Data.Children))
	var postsById []SinglePost
	for _, child := range parsedResult.Data.Children {
		postsById = append(postsById, child.Data)
	}
	return postsById
}

func handleChaptersCall(urlParam string) (SearchChaptersResultDto, error) {
	initialPost, err := getInitialPost(urlParam)
	if err != nil {
		return SearchChaptersResultDto{}, err
	}
	searchTerm := strings.Join(strings.Fields(initialPost.Title)[:2], " ")
	postsOfAuthor, err := listPostsOfAuthor(initialPost.Author, initialPost.Subreddit, searchTerm)
	var chaptersDto SearchChaptersResultDto
	chaptersDto.Author = initialPost.Author
	chaptersDto.SearchTerm = searchTerm
	if err != nil {
		return SearchChaptersResultDto{}, err
	}
	for _, singlePost := range postsOfAuthor {
		sec, dec := math.Modf(singlePost.CreatedUtc)
		chaptersDto.Chapters = append(chaptersDto.Chapters, ChaptersDto{
			ID:           singlePost.ID,
			Title:        singlePost.Title,
			Snippet:      singlePost.SelftextHTML[:2500] + "...",
			Date:         time.Unix(int64(sec), int64(dec*(1e9))),
			OriginalLink: singlePost.URL,
		})
	}
	return chaptersDto, nil
}

func listPostsOfAuthor(author string, subreddit string, searchTerm string) ([]SinglePost, error) {
	searchBaseUrl, _ := url.Parse("https://www.reddit.com/search.json")
	q := searchBaseUrl.Query()
	q.Set("sort", "new")
	q.Set("limit", "100")
	q.Set("include_over_18", "on")
	searchBaseUrl.RawQuery = q.Encode()

	// Set this part directly because reddit's search api does not accept encoded pluses
	searchBaseUrl.RawQuery = searchBaseUrl.RawQuery + fmt.Sprintf("&q=author:%s+subreddit:%s+%s", url.QueryEscape(author), url.QueryEscape(subreddit), url.QueryEscape(searchTerm))
	rawSearchUrl := searchBaseUrl.String()
	//TODO pagination
	println(rawSearchUrl)
	return extractPostsFromRedditUrl(rawSearchUrl), nil
}

var redditHosts = []string{"reddit.com", "redd.it"}

func Any(vs []string, f func(string) bool) bool {
	for _, v := range vs {
		if f(v) {
			return true
		}
	}
	return false
}

func getInitialPost(urlParam string) (SinglePost, error) {
	parsedUrl, err := url.Parse(urlParam)
	defaultResult := SinglePost{}
	if err != nil {
		return defaultResult, err
	}

	if !(Any(redditHosts, func(host string) bool {
		return strings.HasSuffix(parsedUrl.Host, host)
	})) {
		return defaultResult, errors.New("not correct host")
	}

	req, err := http.NewRequest("GET", urlParam+".json", nil)
	if err != nil {
		return defaultResult, err
	}
	response, err := client.Do(req)
	if err != nil {
		return defaultResult, err
	}
	defer response.Body.Close()

	body, err := ioutil.ReadAll(response.Body)
	var parsedResult RedditResultSinglePost
	err = json.Unmarshal([]byte(body), &parsedResult)
	if err != nil {
		return defaultResult, err
	}

	thisPost := parsedResult[0].Data.Children[0].Data
	return thisPost, nil
}

func main() {
	lambda.Start(HandleRequest)
}
