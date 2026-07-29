import { Bucket, HttpMethods } from 'aws-cdk-lib/aws-s3';
import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

interface StoragesStackProps extends cdk.StackProps {
    allowedOrigins: string[];
}


export class StorageStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: StoragesStackProps) {
        super(scope, id, props);

        new Bucket(this, 'S3UploaderBucket', {
            autoDeleteObjects: true,
            removalPolicy: cdk.RemovalPolicy.DESTROY,
            cors: [{
                allowedMethods: [HttpMethods.PUT, HttpMethods.GET],
                allowedOrigins: props.allowedOrigins,
                allowedHeaders: ['*']
            }],
            enforceSSL: true,
            versioned: true
        });
    }
}
