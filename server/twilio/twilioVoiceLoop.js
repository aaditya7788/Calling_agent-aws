import { gemini, clearConversation } from '../ai/gemini.js';
import { generateTTS } from '../ai/tts.js';
import { transcribeAudio } from '../ai/stt.js'; // LemonFox STT
// import { PUBLIC_URL } from '../keys.js';
// import { TWILIO_SID, TWILIO_AUTH } from '../keys.js';
import { getCallMetadata } from '../utils/callMetadataStore.js';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH;
const TWILIO_PHONE = process.env.TWILIO_PHONE;
const PUBLIC_URL = process.env.PUBLIC_URL;

console.log(`🌐 Public URL: ${PUBLIC_URL}/audio/audio.mp3`);

const conversation = [];
export const handleStart = (req, res) => {
  const twiml = `
    <Response>
      <Play>${PUBLIC_URL}/audio/audio.mp3</Play>
      <Redirect method="POST">${PUBLIC_URL}/twilio/voice</Redirect>
    </Response>
  `;
  res.type('text/xml');
  res.send(twiml);
};


export const handleVoice = (req, res) => {
  const twiml = `
    <Response>
      <Record 
        action="/twilio/respond" 
        method="POST"
        maxLength="10"
        timeout="3"
        trim="trim-silence"
        playBeep="true"
        recordingStatusCallback="/twilio/recording-status"
        recordingStatusCallbackMethod="POST"
      />
    </Response>
  `;
  res.type('text/xml');
  res.send(twiml);
};

export const handleRespond = async (req, res) => {
  const recordingUrl = req.body.RecordingUrl;
  const callSid = req.body.CallSid;
  const metadata = getCallMetadata(callSid);
  const voiceChoice = metadata?.voiceChoice || "Joanna";
  
  // Detect language based on voice
  const hindiVoices = ["Kajal"];
  const sttLanguage = hindiVoices.includes(voiceChoice) ? "hindi" : "english";
  
  console.log("🎤 Voice:", voiceChoice, "| STT Language:", sttLanguage);
  
  if (!recordingUrl) {
    console.log("❌ No recording received.");
    return res.send(`
      <Response>
        <Say>I didn't get your voice. Let's try again.</Say>
        <Redirect>${PUBLIC_URL}/twilio/voice</Redirect>
      </Response>
    `);
  }

  try {
    const audioUrl = `${recordingUrl}.mp3`;
    const audioDir = path.join('public');
    const savePath = path.join(audioDir, 'audio.mp3');

    console.log("🔗 Twilio Recording URL:", audioUrl);

    // 👉 Wait 5 seconds before fetching recording to ensure it's fully processed
    console.log("⏳ Waiting for Twilio to process recording...");
    await new Promise(resolve => setTimeout(resolve, 5000));

    // ✅ Ensure directory exists
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
      console.log("📁 Created audio directory.");
    }

    // ✅ Download the audio using Basic Auth
    const response = await axios.get(audioUrl, {
      responseType: 'stream',
      auth: {
        username: TWILIO_SID,
        password: TWILIO_AUTH,
      },
    });

    // ✅ Save audio to disk
    const writer = fs.createWriteStream(savePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log("✅ Audio saved to:", savePath);
        resolve();
      });
      writer.on('error', (err) => {
        console.error("❌ Error writing audio file:", err);
        reject(err);
      });
    });

    // ✅ Transcribe audio using LemonFox with correct language
    const userText = await transcribeAudio(`${PUBLIC_URL}/audio/audio.mp3`, sttLanguage);
    console.log("🗣 User said:", userText);

    // ✅ Check if transcription is empty or too short
    if (!userText || userText.trim().length === 0) {
      console.log("⚠️ Empty transcription - asking user to repeat");
      const retryMessage = sttLanguage === "hindi" 
        ? "मुझे आपकी बात सुनाई नहीं दी। कृपया दोबारा बोलें।"
        : "I didn't catch that. Could you please repeat?";
      
      await generateTTS(retryMessage, voiceChoice);
      
      const twiml = `
        <Response>
          <Play>${PUBLIC_URL}/audio/audio.mp3</Play>
          <Redirect>${PUBLIC_URL}/twilio/voice</Redirect>
        </Response>
      `;
      res.type('text/xml');
      return res.send(twiml);
    }

    // ✅ Generate AI response (use callSid as session ID for conversation context)
    const aiReply = await gemini(userText, callSid);
    conversation.push({ user: userText, bot: aiReply });

    // ✅ Convert AI reply to speech
    await generateTTS(aiReply, voiceChoice); // saves to public/audio/audio.mp3

    // ✅ Check if AI reply should end the call (English or Hindi)
    const lowerReply = aiReply.toLowerCase().replace(/[.,!?]/g, '');
    const shouldEndCall = lowerReply.includes("thank you for your time") || 
                         lowerReply.includes("आपके समय के लिए धन्यवाद") ||
                         lowerReply.includes("धन्यवाद");

    let twiml;
if (shouldEndCall) {
  console.log("📞 Ending call as per AI instruction.");
  twiml = `
    <Response>
      <Play>${PUBLIC_URL}/audio/audio.mp3</Play>
      <Hangup/>
    </Response>
  `;
} else {
  twiml = `
    <Response>
      <Play>${PUBLIC_URL}/audio/audio.mp3</Play>
      <Redirect>${PUBLIC_URL}/twilio/voice</Redirect>
    </Response>
  `;
}

res.type('text/xml');
res.send(twiml);

  } catch (err) {
    console.error("❌ Error in handleRespond:", err);
    res.send(`
      <Response>
        <Say>Something went wrong. Let's try again.</Say>
        <Redirect>${PUBLIC_URL}/twilio/voice</Redirect>
      </Response>
    `);
  }
};

export const handleEnd = (req, res) => {
  const callSid = req.body.CallSid;
  
  // Clear conversation for this call
  if (callSid) {
    console.log(`🧹 Clearing conversation for call: ${callSid}`);
    clearConversation(callSid);
  }
  
  const twiml = `
    <Response>
      <play>${PUBLIC_URL}/audio/audio.mp3</Play>
      <Hangup />
    </Response>
  `;
  res.type('text/xml');
  res.send(twiml);
};