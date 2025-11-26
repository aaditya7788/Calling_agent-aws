# AWS Cognito Authentication Setup Guide

## Overview
This guide will help you set up AWS Cognito for email/password authentication with OTP verification.

## Prerequisites
- AWS Account with IAM user configured
- AWS CLI or IAM permissions for Cognito

## Step 1: Add Cognito Permissions

### Add to IAM User Policy:
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "cognito-idp:CreateUserPool",
                "cognito-idp:CreateUserPoolClient",
                "cognito-idp:DescribeUserPool",
                "cognito-idp:AdminCreateUser",
                "cognito-idp:AdminSetUserPassword",
                "cognito-idp:SignUp",
                "cognito-idp:ConfirmSignUp",
                "cognito-idp:InitiateAuth",
                "cognito-idp:RespondToAuthChallenge",
                "cognito-idp:GetUser",
                "cognito-idp:UpdateUserAttributes",
                "cognito-idp:ForgotPassword",
                "cognito-idp:ConfirmForgotPassword"
            ],
            "Resource": "*"
        }
    ]
}
```

## Step 2: Run Setup Script

```bash
node scripts/setup-cognito.js
```

This will create:
- User Pool with email verification
- User Pool Client for web authentication
- Password policy (min 8 chars, uppercase, lowercase, numbers)

## Step 3: Update .env File

Add the output from the setup script to your `.env`:

```env
COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxx
```

## API Endpoints

### 1. Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Registration successful. Please check your email for verification code.",
  "data": {
    "email": "user@example.com",
    "codeDeliveryDetails": {
      "Destination": "u***@e***",
      "DeliveryMedium": "EMAIL"
    }
  }
}
```

### 2. Verify Email with OTP
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully. You can now login."
}
```

### 3. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "sub-from-cognito",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "name": "John Doe"
    },
    "tokens": {
      "accessToken": "eyJraWQiOiJ...",
      "idToken": "eyJraWQiOiJ...",
      "refreshToken": "eyJjdHkiOiJ...",
      "expiresIn": 3600
    }
  }
}
```

### 4. Get Profile (Requires Authentication)
```http
GET /api/auth/profile
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "username": "user@example.com",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "emailVerified": true,
    "sub": "user-sub-id"
  }
}
```

### 5. Update Profile
```http
PUT /api/auth/profile
Authorization: Bearer <accessToken>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### 6. Forgot Password (Request OTP)
```http
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset code sent to your email",
  "data": {
    "Destination": "u***@e***",
    "DeliveryMedium": "EMAIL"
  }
}
```

### 7. Reset Password with OTP
```http
POST /api/auth/reset-password
Content-Type: application/json

{
  "email": "user@example.com",
  "code": "123456",
  "newPassword": "NewPassword123"
}
```

## User Flow

### Registration Flow:
1. User fills registration form (email, password, firstName, lastName)
2. POST /api/auth/register
3. User receives OTP via email
4. User enters OTP
5. POST /api/auth/verify-email
6. Account verified, user can login

### Login Flow:
1. User enters email and password
2. POST /api/auth/login
3. Receive tokens (accessToken, idToken, refreshToken)
4. Store tokens in localStorage/sessionStorage
5. Use accessToken for authenticated requests

### Password Reset Flow:
1. User clicks "Forgot Password"
2. POST /api/auth/forgot-password
3. User receives OTP via email
4. User enters OTP and new password
5. POST /api/auth/reset-password
6. User can login with new password

## Security Features

✅ Email verification required
✅ Strong password policy (8+ chars, upper, lower, numbers)
✅ OTP-based email verification
✅ Secure password reset
✅ JWT token-based authentication
✅ User data stored in DynamoDB

## Testing

Use Postman or curl to test the endpoints:

```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234","firstName":"Test","lastName":"User"}'

# Verify
curl -X POST http://localhost:8080/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","code":"123456"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test1234"}'
```

## Notes

- Tokens expire after 1 hour (3600 seconds)
- Use refreshToken to get new accessToken when expired
- accessToken must be included in Authorization header for protected routes
- User profile automatically synced between Cognito and DynamoDB
