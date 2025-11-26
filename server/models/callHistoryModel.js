import mongoose from 'mongoose';

const callHistorySchema = new mongoose.Schema({
  googleId: { type: String, required: true }, // User's Google ID
  contactName: { type: String, required: true }, // Contact name
  phoneNumber: { type: String, required: true }, // Phone number
  goal: { type: String, required: true }, // Goal of the call
  aiPersonality: { type: String, required: true }, // AI personality
  voiceChoice: { type: String, required: true }, // Voice choice
  language: { type: String, default: 'English (US)' }, // Language used for the call
  script: { type: String, required: true }, // Script used for the call
  callSid: { type: String, required: true }, // Twilio Call SID
  timestamp: { type: Date, default: Date.now }, // Timestamp of the call
});

const CallHistory = mongoose.model('CallHistory', callHistorySchema);

export default CallHistory;