import * as cdk from '@aws-cdk/core';
import {CfnOutput, RemovalPolicy, Stack} from '@aws-cdk/core';
import {LambdaRestApi} from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as ecr from "@aws-cdk/aws-ecr";
import {Handler} from "@aws-cdk/aws-lambda";
import * as path from "path";

export class LambdaBackedApiGw extends Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const backend = new lambda.DockerImageFunction(this, "id", {
            code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname,'..','..','backend-go'))
        });
        let restApi = new LambdaRestApi(this, 'myapi', {
            handler: backend,
        });

        new CfnOutput(this, 'staticEndpoint', {
            description: 'Endpoint of the api gateway',
            value: restApi.url + '',
        })
    }
}