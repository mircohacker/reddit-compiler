import * as cdk from '@aws-cdk/core';
import {CfnOutput, Construct} from '@aws-cdk/core';
import * as ecs from "@aws-cdk/aws-ecs";
import {Peer, Port, SecurityGroup, SubnetType, Vpc} from "@aws-cdk/aws-ec2";
import {RetentionDays} from "@aws-cdk/aws-logs";
import * as apigatewayv2 from "@aws-cdk/aws-apigatewayv2";
import {HttpMethod, HttpProxyIntegration} from "@aws-cdk/aws-apigatewayv2";
import {PolicyStatement} from "@aws-cdk/aws-iam";

export interface SingleContainerApiProps {
    imageName: string,
    region: string
}

export class SingleContainerApi extends Construct {
    constructor(scope: cdk.Construct, id: string, props: SingleContainerApiProps) {
        super(scope, id);
        const vpc = new Vpc(this, 'vpc', {
            natGateways: 0,
            subnetConfiguration: [
                {
                    name: 'public',
                    subnetType: SubnetType.PUBLIC
                }
            ]
        })

        const httpApi = new apigatewayv2.HttpApi(this, 'apiGW', {
            apiName: id + '-apiGW',
            createDefaultStage: true,
            defaultIntegration: new HttpProxyIntegration({
                method: HttpMethod.ANY,
                url: 'https://www.httpbin.org/anything/?message=this-should-get-ovberwritten-by-the-first-starting-container'
            })
        })

        const cluster = new ecs.Cluster(this, 'cluster', {
            vpc
        })
        // create a task definition with CloudWatch Logs
        const logging = new ecs.AwsLogDriver({
            streamPrefix: id,
            logRetention: RetentionDays.ONE_WEEK
        })

        const taskDef = new ecs.FargateTaskDefinition(this, "AppTaskDefinition", {
            memoryLimitMiB: 512,
            cpu: 256,
        })

        const manipulateApiGatewayStatement = new PolicyStatement();
        manipulateApiGatewayStatement.addActions('apigateway:GET', 'apigateway:PATCH')
        manipulateApiGatewayStatement.addResources(`arn:aws:apigateway:${props.region}::/apis/${httpApi.httpApiId}`,
            `arn:aws:apigateway:${props.region}::/apis/${httpApi.httpApiId}/*`)

        taskDef.addToTaskRolePolicy(manipulateApiGatewayStatement)

        taskDef.addContainer("app", {
            image: ecs.ContainerImage.fromRegistry(props.imageName),
            logging,
        })
        taskDef.addContainer("sidecar-api-gw-update", {
            image: ecs.ContainerImage.fromRegistry('mircohaug/aws-api-gateway-update-helper'),
            logging,
            environment: {
                API_GATEWAY_ID: httpApi.httpApiId,
            },
        })
        const securityGroup = new SecurityGroup(this, 'fargateSecurityGroup', {
            vpc,
        });
        securityGroup.addIngressRule(Peer.anyIpv4(), Port.tcp(80))
        const service = new ecs.FargateService(this, "FargateService", {
            assignPublicIp: true,
            cluster,
            taskDefinition: taskDef,
            securityGroups: [
                securityGroup
            ],
        });

        new CfnOutput(this, 'staticEndpoint', {
            description: 'Endpoint of the api gateway',
            value: httpApi.url + '',
        })
    }

}