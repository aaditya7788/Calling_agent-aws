import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from "../key.js";

// Create DynamoDB client
const client = new DynamoDBClient({
  region: AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

// Create DynamoDB Document client for easier operations
export const dynamoDB = DynamoDBDocumentClient.from(client);

// Table names
export const TABLES = {
  USERS: 'CallingAgent-Users',
  CALL_HISTORY: 'CallingAgent-CallHistory'
};

console.log('✅ DynamoDB Client Initialized');
