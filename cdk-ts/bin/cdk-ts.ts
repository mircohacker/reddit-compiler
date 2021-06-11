#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import {RedditCompilerApi} from "../lib/RedditCompilerApi";
import {LambdaBackedApiGw} from "../lib/LambdaBackedApiGw";

const app = new cdk.App();

// new RedditCompilerApi(app, 'reddit-compiler-api');
 new LambdaBackedApiGw(app,"LambdaBackedApiGw")