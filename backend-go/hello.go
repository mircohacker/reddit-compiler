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
	"net/http"
	"net/url"
	"strings"
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
		urlParam := payload.PathParameters["url"]
		post, err := getInitialPost(urlParam)
		if err != nil {
			return LambdaResult{}, err
		}
		listPostsOfAuthor(post.Author, post.Subreddit, post.Title)
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

func listPostsOfAuthor(author string, subreddit string, searchTerm string) ([]SinglePost, error) {
	searchBaseUrl, _ := url.Parse("http://www.reddit.com/search.json")
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
	req, err := http.NewRequest("GET", rawSearchUrl, nil)
	if err != nil {
		return []SinglePost{}, err
	}
	response, err := client.Do(req)
	if err != nil {
		return []SinglePost{}, err
	}

	body, err := ioutil.ReadAll(response.Body)
	var parsedResult Listing
	err = json.Unmarshal(body, &parsedResult)
	println(len(parsedResult.Data.Children))
	var searchResultPost []SinglePost
	for _, child := range parsedResult.Data.Children {
		searchResultPost = append(searchResultPost, child.Data)
	}
	return searchResultPost, nil
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
	var parsedResult RedditResult
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
