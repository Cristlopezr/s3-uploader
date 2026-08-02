#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { StorageStack } from './stacks/storage-stack';
import { envs } from './config/envs';

const app = new cdk.App();
new StorageStack(app, `StorageStack-${envs.stage}`, {
    bucketAllowedOrigins: envs.bucketAllowedOrigins,
    stage: envs.stage,
    db_url: envs.dbUrl,
    db_name: envs.dbName
});
