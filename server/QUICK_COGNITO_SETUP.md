# Quick Setup Steps for AWS Cognito

## Step 1: Add IAM Permissions (REQUIRED)

Go to AWS IAM Console and add these permissions to your `calling-agent` user:

### Option A: Attach Managed Policy (Easiest)
1. Go to: https://console.aws.amazon.com/iam/
2. Users → `calling-agent`
3. Add permissions → Attach policies directly
4. Search and attach: **AmazonCognitoPowerUser**

### Option B: Custom Policy (Minimal Permissions)
Add this inline policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:*"
            ],
            "Resource": "*"
        }
    ]
}
```

## Step 2: Create Cognito User Pool

Run this command:

```bash
node scripts/setup-cognito.js
```

This will output something like:
```
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
```

## Step 3: Add to .env File

Copy the output and add to your `.env` file:

```env
# AWS Cognito Configuration
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
```

## Step 4: Start Server

```bash
npm run dev
```

## That's it! 🎉

Your authentication system is ready to use with:
- Email/Password registration
- OTP email verification
- Login with tokens
- Password reset
- User profiles

## Test with API

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234",
    "firstName": "Test",
    "lastName": "User"
  }'

# Check your email for OTP, then verify
curl -X POST http://localhost:8080/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "code": "123456"
  }'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test1234"
  }'
```
