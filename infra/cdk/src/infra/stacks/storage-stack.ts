import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, EventType, HttpMethods } from 'aws-cdk-lib/aws-s3';
import { LambdaDestination } from 'aws-cdk-lib/aws-s3-notifications';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
import path from 'path';

interface StoragesStackProps extends cdk.StackProps {
    stage: "dev" | "prod";
    bucketAllowedOrigins: string[];
    db_url: string;
    db_name: string;
}


export class StorageStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: StoragesStackProps) {
        super(scope, id, props);

        const isProd = props.stage === 'prod' ? true : false
        const bucketConfiguration = {
            autoDeleteObjects: isProd ? false : true,
            removalPolicy: isProd ? cdk.RemovalPolicy.RETAIN : cdk.RemovalPolicy.DESTROY,
        }

        const bucket = new Bucket(this, 'S3UploaderBucket', {
            autoDeleteObjects: bucketConfiguration.autoDeleteObjects,
            removalPolicy: bucketConfiguration.removalPolicy,
            cors: [{
                allowedMethods: [HttpMethods.PUT, HttpMethods.GET],
                allowedOrigins: props.bucketAllowedOrigins,
                allowedHeaders: ['*']
            }],
            enforceSSL: true,
            versioned: true
        });

        const validateFileLambda = new NodejsFunction(this, 'S3UploaderValidateFileHandler', {
            functionName: `S3UploaderValidateFile-${props.stage}`,
            runtime: Runtime.NODEJS_24_X,
            entry: path.join(__dirname, '..', '..', 'lambdas', 'validate-file.ts'),
            handler: 'handler',
            timeout: cdk.Duration.seconds(20),
            environment: {
                DB_URL: props.db_url,
                DB_NAME: props.db_name
            },
            bundling: {
                nodeModules: ['mongodb'],
                commandHooks: {
                    beforeBundling() {
                        return []
                    },
                    beforeInstall() {
                        return []
                    },
                    afterBundling(_, outputDir) {
                        return [
                            `rm -rf ${outputDir}/.pnpm-store`,
                            `rm -f ${outputDir}/pnpm-lock.yaml`,
                            `rm -f ${outputDir}/pnpm-workspace.yaml`,
                            `rm -f ${outputDir}/package.json`
                        ]
                    }
                }
            },
        })

        bucket.grants.readWrite(validateFileLambda);

        bucket.addEventNotification(
            EventType.OBJECT_CREATED,
            new LambdaDestination(validateFileLambda)
        )
    }
}
