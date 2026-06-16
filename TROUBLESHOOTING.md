# Troubleshooting Call Initiation Errors

## Issue: "Call initiation failed" error

### Root Causes & Solutions:

#### 1. **Invalid Gemini API Token** ✅ FIXED
- **Problem**: Extra space in `GEMINI_TOKEN` in `.env`
- **Solution**: Remove leading/trailing spaces from API keys
- **Fixed in**: `server/.env`

#### 2. **Server Not Restarted** ⚠️ ACTION NEEDED
- **Problem**: Server still using old `.env` values
- **Solution**: Restart your production server to load the fixed `GEMINI_TOKEN`
  ```bash
  # If Docker:
  docker restart <container-id>
  
  # If systemd:
  sudo systemctl restart calling-agent
  
  # If PM2:
  pm2 restart app
  ```

#### 3. **Unregistered Phone Number**
- **Problem**: Twilio free tier requires verified recipient numbers
- **Solution**: Register the phone number in [Twilio Console](https://console.twilio.com/us/account/phone-numbers/verified)
  - Go to: Account → Phone Numbers → Verified Caller IDs
  - Add: +918108571125 (or your test number)

#### 4. **Missing/Invalid Twilio Credentials**
- **Check in `server/.env`**:
  - `TWILIO_SID`: Should be `AC...` (Account SID)
  - `TWILIO_AUTH`: Should be your Auth Token
  - `TWILIO_PHONE`: Should be your Twilio phone number

#### 5. **PUBLIC_URL Incorrect or Unreachable**
- **Current**: `PUBLIC_URL=https://agent.aaditya78.dev` ✅ WORKING
- **Test**: `curl https://agent.aaditya78.dev/health`

### Quick Test After Fixes:

```bash
curl -X POST https://agent.aaditya78.dev/api/call \
  -H "Content-Type: application/json" \
  -d '{
    "googleId": "test-id",
    "contactName": "Test",
    "phoneNumber": "+918108571125",
    "goal": "Test",
    "aiPersonality": "Professional",
    "voiceChoice": "Kajal"
  }'
```

Expected response:
```json
{
  "message": "Call to Test started successfully.",
  "sid": "CA...",
  "audioUrl": "https://agent.aaditya78.dev/audio/speech.mp3"
}
```
