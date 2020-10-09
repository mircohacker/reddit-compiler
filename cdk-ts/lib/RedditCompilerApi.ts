import * as cdk from '@aws-cdk/core';
import {CfnParameter, Stack} from '@aws-cdk/core';
import {SingleContainerApi} from "./SingleContainerApi";

export class RedditCompilerApi extends Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const imageName = new CfnParameter(this, "imageName", {
            type: "String",
            default: 'mircohaug/reddit-compiler-backend',
            description: "The name of the image to be deployed"
        });

        new SingleContainerApi(this, id + '-api', {
            imageName: imageName.valueAsString,
            region: this.region
        });
    }

}