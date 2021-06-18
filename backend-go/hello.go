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
		_, err := getInitialPost(urlParam)
		if err != nil {
			return LambdaResult{}, err
		}
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

	client := &http.Client{}
	req, err := http.NewRequest("GET", urlParam+".json", nil)
	if err != nil {
		return defaultResult, err
	}

	req.Header.Add("User-Agent", `mirco Test the shit out of this go`)
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
