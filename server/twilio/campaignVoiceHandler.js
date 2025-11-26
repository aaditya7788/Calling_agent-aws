import dotenv from 'dotenv';
import { autoTranslate } from '../ai/translate.js';
import { generateTTS } from '../ai/tts.js';
dotenv.config();

const PUBLIC_URL = process.env.PUBLIC_URL;

/**
 * Handle one-sided campaign calls (promotional/announcement)
 * The call plays the message and ends without waiting for user response
 */
export const handleCampaignStart = async (req, res) => {
  try {
    const callSid = req.query.callSid || req.body.CallSid;
    const message = req.query.message || 'This is a promotional call.';
    const voiceChoice = req.query.voice || 'Joanna';
    const language = req.query.language || 'en-US';

    console.log(`📞 Campaign Call Start - SID: ${callSid}`);
    console.log(`📝 Original Message: ${message.substring(0, 100)}...`);
    console.log(`🎤 Voice: ${voiceChoice}, Language: ${language}`);

    // Auto-translate message if needed (English to Hindi)
    let translatedMessage = message;
    try {
      translatedMessage = await autoTranslate(message, language);
      console.log(`🌐 Translated Message: ${translatedMessage.substring(0, 100)}...`);
    } catch (error) {
      console.error(`⚠️ Translation failed, using original message:`, error.message);
    }

    // XML escape function to prevent breaking TwiML
    const escapeXml = (unsafe) => {
      return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    // Map Polly voice to Twilio voice
    // Note: Not all voices support all languages
    const twilioVoiceMap = {
      'Joanna': 'Polly.Joanna',
      'Matthew': 'Polly.Matthew',
      'Salli': 'Polly.Salli',
      'Kendra': 'Polly.Kendra',
      'Raveena': 'Polly.Raveena',
      'Aditi': 'Polly.Aditi',
      'Kajal': 'Polly.Kajal',
      'Aria': 'Polly.Aria',
      'Ayanda': 'Polly.Ayanda',
      'Niamh': 'Polly.Niamh'
    };

    let twilioVoice = twilioVoiceMap[voiceChoice] || 'Polly.Joanna';
    let actualLanguage = language;
    let actualVoiceChoice = voiceChoice;
    
    // Detect if message is in English or Hindi after translation
    const isEnglishText = /^[\x00-\x7F\s]+$/.test(translatedMessage);
    
    // For Hindi language
    if (language === 'hi-IN') {
      // Use Hindi-capable voices (Aditi, Kajal, Raveena)
      if (voiceChoice !== 'Aditi' && voiceChoice !== 'Kajal' && voiceChoice !== 'Raveena') {
        console.log(`⚠️ Switching to Aditi for Hindi support.`);
        twilioVoice = 'Polly.Aditi';
        actualVoiceChoice = 'Aditi';
      }
      
      // If message is still in English (translation failed), use Indian English
      if (isEnglishText) {
        console.log(`⚠️ Message is in English, using en-IN with Indian accent`);
        actualLanguage = 'en-IN';
      } else {
        console.log(`✅ Message is in Hindi, using hi-IN`);
        actualLanguage = 'hi-IN';
      }
    }

    // Generate TTS audio file using AWS Polly for the main message
    console.log(`🎙️ Generating TTS audio for campaign message...`);
    await generateTTS(translatedMessage, actualVoiceChoice);  // Don't pass language as 3rd param

    // Use <Play> for the main message and immediately hangup
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Play>${PUBLIC_URL}/audio/audio.mp3</Play>
  <Hangup/>
</Response>`;
    
    console.log('✅ Campaign TwiML sent with voice:', twilioVoice);
    res.type('text/xml');
    res.send(twiml);
  } catch (error) {
    console.error('❌ Campaign call error:', error);
    
    // Fallback TwiML
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">We apologize, but there was an error. Goodbye.</Say>
  <Hangup/>
</Response>`;
    res.type('text/xml');
    res.send(errorTwiml);
  }
};
