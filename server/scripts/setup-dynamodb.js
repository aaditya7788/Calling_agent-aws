import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from "../key.js";

const client = new DynamoDBClient({
  region: AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

async function createTableIfNotExists(tableName, keySchema, attributeDefinitions) {
  try {
    // Check if table exists
    await client.send(new DescribeTableCommand({ TableName: tableName }));
    console.log(`✅ Table ${tableName} already exists`);
  } catch (error) {
    if (error.name === 'ResourceNotFoundException') {
      // Create table
      console.log(`📦 Creating table: ${tableName}...`);
      await client.send(new CreateTableCommand({
        TableName: tableName,
        KeySchema: keySchema,
        AttributeDefinitions: attributeDefinitions,
        BillingMode: 'PAY_PER_REQUEST' // On-demand billing
      }));
      console.log(`✅ Table ${tableName} created successfully`);
    } else {
      throw error;
    }
  }
}

async function setupDynamoDBTables() {
  console.log('🚀 Setting up DynamoDB tables...\n');

  try {
    // Create Users table
    await createTableIfNotExists(
      'CallingAgent-Users',
      [{ AttributeName: 'googleId', KeyType: 'HASH' }],
      [{ AttributeName: 'googleId', AttributeType: 'S' }]
    );

    // Create CallHistory table
    await createTableIfNotExists(
      'CallingAgent-CallHistory',
      [
        { AttributeName: 'googleId', KeyType: 'HASH' },
        { AttributeName: 'timestamp', KeyType: 'RANGE' }
      ],
      [
        { AttributeName: 'googleId', AttributeType: 'S' },
        { AttributeName: 'timestamp', AttributeType: 'N' }
      ]
    );

    // Create Campaigns table
    await createTableIfNotExists(
      'CallingAgent-Campaigns',
      [{ AttributeName: 'campaignId', KeyType: 'HASH' }],
      [{ AttributeName: 'campaignId', AttributeType: 'S' }]
    );

    console.log('\n✅ All DynamoDB tables are ready!');
  } catch (error) {
    console.error('❌ Error setting up DynamoDB tables:', error);
  }
}

setupDynamoDBTables();
