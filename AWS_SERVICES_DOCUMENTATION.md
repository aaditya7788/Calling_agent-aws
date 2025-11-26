# AWS Services Documentation - Calling Agent

## Overview
This document provides a comprehensive summary of all AWS services used in the Calling Agent application, including their purpose, configuration, and usage.

---

## 1. AWS DynamoDB 💾

### **Purpose**
NoSQL database service for storing application data with high performance and scalability.

### **Usage in Project**

#### **Tables Created:**

1. **CallingAgent-Users**
   - **Primary Key:** `googleId` (String)
   - **Purpose:** Store user authentication data from Google OAuth
   - **Attributes:**
     - `googleId`: Unique Google user identifier
     - `email`: User email address
     - `name`: User's full name
     - `createdAt`: Account creation timestamp
   - **Location:** User authentication and profile management

2. **CallingAgent-CallHistory**
   - **Primary Key:** `historyId` (String)
   - **Purpose:** Store history of all calls made through the platform
   - **Attributes:**
     - `historyId`: Unique call identifier
     - `googleId`: User who initiated the call
     - `contactName`: Name of the person called
     - `phoneNumber`: Phone number called
     - `goal`: Purpose of the call
     - `aiPersonality`: AI personality used
     - `voiceChoice`: Voice selected for TTS
     - `script`: Call script/content
     - `timestamp`: When the call was made
   - **Location:** Call history tracking and analytics

3. **CallingAgent-Campaigns**
   - **Primary Key:** `campaignId` (String)
   - **Purpose:** Store campaign data for bulk calling
   - **Attributes:**
     - `campaignId`: Unique campaign identifier
     - `googleId`: Campaign owner
     - `campaignName`: Name of the campaign
     - `goal`: Campaign objective
     - `personality`: AI personality
     - `script`: Campaign script/message
     - `language`: Language (English US/Indian/Hindi)
     - `voice`: Voice selection
     - `contacts`: Array of contacts (name, phoneNumber)
     - `totalContacts`: Total number of contacts
     - `completedCalls`: Number of completed calls
     - `successfulCalls`: Successful call count
     - `failedCalls`: Failed call count
     - `status`: pending/running/paused/completed
     - `createdAt`: Campaign creation time
   - **Location:** Campaign management system

### **Configuration**
- **Region:** `ap-south-1` (Mumbai, India)
- **Billing Mode:** Pay-per-request (no provisioned capacity)
- **Files Used:**
  - `server/config/dynamodb.js` - DynamoDB client initialization
  - `server/scripts/setup-dynamodb.js` - Table creation script
  - `server/models/userModel.js` - User CRUD operations
  - `server/models/callHistoryModel.js` - Call history operations
  - `server/services/campaignService.js` - Campaign operations

### **Why This Service?**
- Serverless and scalable
- Low latency for read/write operations
- No need to manage database servers
- Pay only for what you use
- Perfect for user data and call history

---

## 2. AWS Polly 🗣️

### **Purpose**
Text-to-Speech (TTS) service that converts text into lifelike speech using deep learning.

### **Usage in Project**

#### **Voices Used:**

**English (US) - Neural Engine:**
- Joanna (Female)
- Matthew (Male)
- Ivy (Female)
- Justin (Male)
- Kendra (Female)
- Kimberly (Female)
- Salli (Female)
- Joey (Male)

**English (Indian) - Standard Engine:**
- Aditi (Female)
- Raveena (Female)

**Hindi - Neural Engine:**
- Kajal (Female)

### **Features Implemented**
- **Neural Engine:** High-quality, natural-sounding voices
- **Standard Engine:** Fallback for voices without neural support
- **Multi-language Support:** English (US), English (Indian), Hindi
- **Real-time Generation:** Audio generated on-demand for each call
- **MP3 Output:** Compressed audio for efficient bandwidth usage

### **Configuration**
- **Region:** `ap-south-1` (Mumbai, India)
- **Output Format:** MP3
- **Sample Rate:** Default (24kHz for neural, 22.05kHz for standard)
- **Files Used:**
  - `server/ai/tts.js` - Main TTS generation logic
  - `server/ai/ttsForSpeech.js` - Alternative TTS implementation
  - `server/twilio/campaignVoiceHandler.js` - Campaign TTS generation

### **Audio Storage**
- Generated audio saved to: `server/public/audio.mp3`
- Served via Express static middleware
- Accessible via: `${PUBLIC_URL}/audio/audio.mp3`

### **Why This Service?**
- High-quality, natural voices
- Multiple language support including Hindi
- Neural engine for realistic pronunciation
- Cost-effective for on-demand TTS
- Seamless integration with Twilio

---

## 3. AWS Bedrock (AI) 🤖

### **Purpose**
Foundation model service providing access to advanced AI models for conversational AI.

### **Usage in Project**

#### **Model Used:**
- **Model ID:** `anthropic.claude-3-5-sonnet-20240620-v1:0`
- **Type:** Claude 3.5 Sonnet (Anthropic)
- **Purpose:** Generate intelligent, context-aware responses during calls

### **Features**
- **Conversational AI:** Real-time response generation
- **Personality Customization:** Adapts to selected AI personality (Friendly, Professional, Witty, Empathetic)
- **Context Awareness:** Understands conversation history
- **Goal-oriented:** Focuses on achieving call objective

### **Implementation**
```javascript
Input:
- User's goal for the call
- AI personality type
- Conversation history
- User's latest input

Output:
- Contextual AI response
- Natural conversation flow
```

### **Configuration**
- **Region:** `ap-south-1` (Mumbai, India)
- **Max Tokens:** 1024
- **Temperature:** 1.0 (balanced creativity)
- **Files Used:**
  - `server/ai/gemini.js` - AI response generation
  - `server/twilio/twilioVoiceLoop.js` - Conversation management

### **Why This Service?**
- State-of-the-art language model
- Natural conversation abilities
- Personality customization
- Low latency responses
- Perfect for interactive calls

---

## 4. AWS Transcribe 🎤

### **Purpose**
Automatic speech recognition (ASR) service that converts speech to text.

### **Usage in Project**

#### **Features:**
- **Real-time Transcription:** Converts user voice to text during calls
- **Multi-language Support:** English and Hindi
- **High Accuracy:** Optimized for phone call audio
- **Automatic Punctuation:** Adds punctuation to transcribed text

### **Configuration**
- **Region:** `ap-south-1` (Mumbai, India)
- **Language Code:** `en-US` (English), `hi-IN` (Hindi)
- **Media Format:** WAV (from Twilio recordings)
- **Sample Rate:** 8000 Hz (phone quality)
- **Files Used:**
  - `server/ai/stt.js` - Speech-to-text conversion
  - `server/twilio/twilioVoiceLoop.js` - Call flow integration

### **Workflow**
1. User speaks during call
2. Twilio records audio
3. Audio sent to AWS Transcribe
4. Transcribe returns text
5. Text sent to Bedrock for AI response
6. Response converted to speech via Polly
7. Speech played back to user

### **Why This Service?**
- Accurate speech recognition
- Phone audio optimization
- Multi-language support
- Fast processing
- Essential for interactive calls

---

## 5. AWS Translate 🌐

### **Purpose**
Neural machine translation service for translating text between languages.

### **Usage in Project**

#### **Translation Pairs:**
- **English → Hindi:** For campaign messages
- **Auto-detect source language**

### **Features**
- **Neural Translation:** High-quality, context-aware translations
- **Real-time:** Instant translation during campaign execution
- **Automatic Language Detection**
- **Fallback Support:** Google Translate as backup

### **Implementation**
```javascript
Input: "Hi! This is a Black Friday sale..."
Output: "हाय! यह ब्लैक फ्राइडे सेल है..."
```

### **Configuration**
- **Region:** `ap-south-1` (Mumbai, India)
- **Source Language:** `en` (English)
- **Target Language:** `hi` (Hindi)
- **Files Used:**
  - `server/ai/translate.js` - Translation logic
  - `server/twilio/campaignVoiceHandler.js` - Campaign translation

### **Workflow for Hindi Campaigns:**
1. User writes script in English
2. System detects language selection (Hindi)
3. AWS Translate converts to Hindi
4. Hindi text sent to Polly
5. Polly generates Hindi audio
6. Audio played in call

### **Why This Service?**
- Accurate neural translations
- Preserves context and meaning
- Enables multilingual campaigns
- No need for manual translation
- Cost-effective

---

## 6. AWS Cognito 🔐

### **Purpose**
User authentication and authorization service with OAuth 2.0 support.

### **Usage in Project**

#### **Features:**
- **Google OAuth Integration:** Social login via Google
- **User Pool Management:** Store and manage user identities
- **Token Management:** JWT tokens for session management
- **Secure Authentication:** Industry-standard security

### **Configuration**
- **Region:** `ap-south-1` (Mumbai, India)
- **User Pool:** For application users
- **Identity Providers:** Google
- **App Client:** Frontend application
- **OAuth Scopes:** openid, email, profile
- **Files Used:**
  - `server/config/cognito.js` - Cognito client
  - `server/controllers/authController.js` - Auth logic
  - `server/routes/authRoutes.js` - Auth endpoints
  - `frontend/src/store/auth_save.js` - Frontend auth state

### **Authentication Flow:**
1. User clicks "Sign in with Google"
2. Redirected to Google OAuth
3. Google returns authorization code
4. Backend exchanges code for tokens
5. User data stored in DynamoDB
6. Session maintained with JWT

### **Why This Service?**
- Fully managed authentication
- Google OAuth integration
- Secure token management
- Scalable user management
- Easy integration

---

## 7. AWS IAM (Identity and Access Management) 👤

### **Purpose**
Manage access to AWS services and resources securely.

### **Usage in Project**

#### **IAM User:**
- **Username:** `calling-agent`
- **Access Type:** Programmatic access
- **Credentials:** Access Key ID + Secret Access Key

#### **Policies Attached:**
1. **AmazonDynamoDBFullAccess**
   - Full access to DynamoDB tables
   - Create, read, update, delete operations

2. **AmazonPollyFullAccess**
   - Text-to-speech generation
   - Voice synthesis

3. **AmazonBedrockFullAccess**
   - AI model access
   - Claude 3.5 Sonnet usage

4. **AmazonTranscribeFullAccess**
   - Speech-to-text conversion
   - Audio transcription

5. **TranslateFullAccess**
   - Text translation
   - English to Hindi conversion

6. **AmazonCognitoReadOnly**
   - Read user pool data
   - Verify tokens

### **Security Best Practices:**
- Credentials stored in `server/key.js` (NOT committed to git)
- Access keys rotated periodically
- Principle of least privilege
- No root account usage

### **Files Using IAM Credentials:**
- `server/key.js` - Credential storage
- All AWS service integrations import from here

---

## AWS Services Summary Table

| Service | Purpose | Region | Cost Model | Files Used |
|---------|---------|--------|-----------|------------|
| **DynamoDB** | Database | ap-south-1 | Pay-per-request | config/dynamodb.js, models/* |
| **Polly** | Text-to-Speech | ap-south-1 | Per character | ai/tts.js, twilio/* |
| **Bedrock** | AI Responses | ap-south-1 | Per token | ai/gemini.js |
| **Transcribe** | Speech-to-Text | ap-south-1 | Per second | ai/stt.js |
| **Translate** | Translation | ap-south-1 | Per character | ai/translate.js |
| **Cognito** | Authentication | ap-south-1 | Per MAU | config/cognito.js, controllers/authController.js |
| **IAM** | Access Control | Global | Free | key.js |

---

## Architecture Flow

```
User Login
    ↓
AWS Cognito (Google OAuth)
    ↓
User Data → DynamoDB (Users Table)
    ↓
Make Call
    ↓
User Voice → AWS Transcribe → Text
    ↓
Text → AWS Bedrock (Claude) → AI Response
    ↓
AI Response → AWS Polly → Speech Audio
    ↓
Audio → Twilio → User Hears Response
    ↓
Call Data → DynamoDB (CallHistory Table)

Campaign Flow:
    ↓
Create Campaign → DynamoDB (Campaigns Table)
    ↓
English Script → AWS Translate → Hindi Text
    ↓
Hindi Text → AWS Polly → Hindi Audio
    ↓
Audio → Twilio → Bulk Calls
    ↓
Stats → DynamoDB (Update Campaign)
```

---

## Cost Optimization

### **DynamoDB:**
- Use pay-per-request (no idle costs)
- No need for provisioned capacity

### **Polly:**
- Cache generated audio when possible
- Use standard voices for non-critical calls

### **Bedrock:**
- Optimize prompt length
- Limit max tokens to 1024

### **Transcribe:**
- Only transcribe when needed
- Use appropriate sample rates

### **Translate:**
- Cache common translations
- Fallback to Google Translate (free tier)

---

## Environment Variables

All AWS services require these environment variables:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=ap-south-1
COGNITO_CLIENT_ID=your_cognito_client_id
COGNITO_REGION=ap-south-1
```

**Location:** `server/key.js`

---

## Deployment Considerations

### **For Production:**

1. **Use AWS Systems Manager Parameter Store** for secrets
2. **Enable CloudWatch Logs** for monitoring
3. **Set up AWS X-Ray** for tracing
4. **Use AWS Lambda** for serverless functions (optional)
5. **Deploy to Elastic Beanstalk** or **ECS** for backend
6. **Use CloudFront + S3** for frontend hosting
7. **Enable AWS WAF** for security

### **Monitoring:**
- CloudWatch metrics for all services
- DynamoDB: Read/Write capacity metrics
- Polly: Character count
- Bedrock: Token usage
- Transcribe: Audio duration

---

## Backup and Recovery

### **DynamoDB:**
- Enable Point-in-Time Recovery (PITR)
- Set up on-demand backups
- Cross-region replication (optional)

### **Audio Files:**
- Store in S3 with versioning
- Lifecycle policies for old files
- Glacier for archival

---

## Future AWS Services to Consider

1. **AWS Lambda** - Serverless functions for background tasks
2. **Amazon S3** - Audio file storage instead of local
3. **AWS CloudFront** - CDN for static assets
4. **Amazon SQS** - Queue for campaign call processing
5. **AWS Step Functions** - Campaign workflow orchestration
6. **Amazon EventBridge** - Scheduled campaign execution
7. **AWS CloudWatch** - Comprehensive monitoring
8. **AWS Secrets Manager** - Better secret management
9. **Amazon API Gateway** - API management and rate limiting
10. **AWS Amplify** - Frontend hosting and deployment

---

## Support and Documentation

- **AWS Documentation:** https://docs.aws.amazon.com/
- **DynamoDB:** https://docs.aws.amazon.com/dynamodb/
- **Polly:** https://docs.aws.amazon.com/polly/
- **Bedrock:** https://docs.aws.amazon.com/bedrock/
- **Transcribe:** https://docs.aws.amazon.com/transcribe/
- **Translate:** https://docs.aws.amazon.com/translate/
- **Cognito:** https://docs.aws.amazon.com/cognito/

---

**Last Updated:** November 9, 2025  
**Project:** AI Calling Agent  
**Developer:** Aaditya Sahani
