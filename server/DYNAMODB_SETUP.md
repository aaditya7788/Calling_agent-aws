# DynamoDB Setup Instructions

## AWS IAM Permissions Required

You need to add DynamoDB permissions to your IAM user `calling-agent`.

### Option 1: Add AWS Managed Policy (Easiest)
1. Go to AWS IAM Console: https://console.aws.amazon.com/iam/
2. Click on "Users" → "calling-agent"
3. Click "Add permissions" → "Attach policies directly"
4. Search for and attach: **AmazonDynamoDBFullAccess**
5. Click "Add permissions"

### Option 2: Add Custom Inline Policy (More Secure)
If you want minimal permissions, add this custom policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:CreateTable",
                "dynamodb:DescribeTable",
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan",
                "dynamodb:BatchGetItem",
                "dynamodb:BatchWriteItem"
            ],
            "Resource": [
                "arn:aws:dynamodb:ap-south-1:480073428333:table/CallingAgent-Users",
                "arn:aws:dynamodb:ap-south-1:480073428333:table/CallingAgent-CallHistory"
            ]
        }
    ]
}
```

## After Adding Permissions

1. Run the setup script to create tables:
   ```bash
   node scripts/setup-dynamodb.js
   ```

2. Start your server:
   ```bash
   npm run dev
   ```

## Tables That Will Be Created

### 1. CallingAgent-Users
- **Primary Key**: googleId (String)
- **Attributes**: name, email, picture, createdAt, updatedAt
- **Purpose**: Store user authentication data

### 2. CallingAgent-CallHistory
- **Partition Key**: googleId (String)
- **Sort Key**: timestamp (Number)
- **Attributes**: contactName, phoneNumber, goal, aiPersonality, voiceChoice, script, callSid
- **Purpose**: Store call history for each user

## Migration from MongoDB

All your existing MongoDB code has been replaced with DynamoDB:
- ✅ User authentication (authController.js)
- ✅ Call history storage (saveCallHistory.js)
- ✅ Call history retrieval (getCallHistoryController.js)
- ✅ Call statistics (getCallStatisticsController.js)

## Testing

After setup, test the endpoints:
1. POST `/api/registerOrLogin` - User authentication
2. GET `/api/call/history/:googleId` - Get call history
3. GET `/api/call/statistics/:googleId` - Get call statistics
