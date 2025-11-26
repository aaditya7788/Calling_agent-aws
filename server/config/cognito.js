import { CognitoIdentityProviderClient } from "@aws-sdk/client-cognito-identity-provider";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from "../key.js";
import dotenv from 'dotenv';

dotenv.config();

// Cognito configuration
export const cognitoConfig = {
  UserPoolId: process.env.COGNITO_USER_POOL_ID,
  ClientId: process.env.COGNITO_CLIENT_ID,
  Region: AWS_REGION || 'us-east-1'
};

// Cognito client
export const cognitoClient = new CognitoIdentityProviderClient({
  region: cognitoConfig.Region,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

console.log('✅ Cognito Client Initialized');
