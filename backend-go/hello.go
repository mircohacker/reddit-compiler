package main

import (
	"context"
	"encoding/json"
	"fmt"
	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/aws/aws-lambda-go/lambdacontext"
)

type Result struct {
	StatusCode      int     `json:"statusCode"`
	Body            string  `json:"body"`
	IsBase64Encoded bool    `json:"isBase64Encoded"`
	Headers         Headers `json:"headers"`
}
type Headers struct {
	ContentType string `json:"Content-Type"`
}

func HandleRequest(ctx context.Context, payload events.APIGatewayProxyRequest) (Result, error) {
	lc, _ := lambdacontext.FromContext(ctx)
	bytes, _ := json.Marshal(lc)
	fmt.Println(string(bytes))
	i, _ := json.Marshal(payload)
	fmt.Println(string(i))

	result := Result{
		StatusCode:      200,
		Body:            "",
		IsBase64Encoded: false,
		Headers: Headers{
			ContentType: "application/json; charset=UTF-8",
		},
	}
	return result, nil
}

func main() {
	lambda.Start(HandleRequest)
}
