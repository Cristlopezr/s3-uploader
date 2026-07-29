#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { StorageStack } from './stacks/storage-stack';


const app = new cdk.App();
new StorageStack(app, 'StorageStack', {
    allowedOrigins: ['http://localhost:5173']
});
