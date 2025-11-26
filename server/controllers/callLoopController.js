// import { TWILIO_SID, TWILIO_PHONE, TWILIO_AUTH, PUBLIC_URL } from '../keys.js';
import twilio from 'twilio';
import { generateTTS } from '../ai/tts.js';
import { gemini } from '../ai/gemini.js';
import { saveCallMetadata } from '../utils/callMetadataStore.js';
import { saveCallHistory } from '../utils/saveCallHistory.js';
import dotenv from 'dotenv';
dotenv.config();

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH;
const TWILIO_PHONE = process.env.TWILIO_PHONE;
const PUBLIC_URL = process.env.PUBLIC_URL;

const client = twilio(TWILIO_SID, TWILIO_AUTH);

export const triggerCall = async (req, res) => {
  try {
    const {
      googleId,
      contactName,
      phoneNumber,
      goal,
      aiPersonality,
      customScript,
      voiceChoice = "Joanna", // Default to valid Polly voice
    } = req.body;

    if (!googleId || !contactName || !phoneNumber || !goal || !aiPersonality || !voiceChoice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Detect language based on voice
    const hindiVoices = ["Kajal"];
    const indianEnglishVoices = ["Aditi", "Raveena"];
    const isHindi = hindiVoices.includes(voiceChoice);
    const isIndianEnglish = indianEnglishVoices.includes(voiceChoice);

    // Construct language-appropriate prompt
    let finalScript;
    
    if (isHindi) {
      // Hindi script instructions - ALWAYS respond in Hindi
      finalScript = customScript?.trim().length > 0
        ? `आप ${contactName} से हिंदी में बात करने जा रहे हैं, ${goal} के बारे में चर्चा करने के लिए ${aiPersonality} लहजे में। महत्वपूर्ण: हमेशा हिंदी में जवाब दें, चाहे प्रश्न या स्क्रिप्ट किसी भी भाषा में हो। अपने बारे में कुछ भी कहने की जरूरत नहीं है, बस विषय पर ध्यान दें। बिना इमोजी के। 

आपकी स्क्रिप्ट (इसे ठीक से फॉलो करें):
${customScript}

नियम:
1. केवल स्क्रिप्ट और ${goal} के बारे में बात करें
2. हर जवाब 150 अक्षर से कम रखें
3. स्क्रिप्ट में दी गई जानकारी को चरण-दर-चरण समझाएं
4. जब उपयोगकर्ता "ठीक है", "जी", "समझ गया" कहे, तो "आपके समय के लिए धन्यवाद" कहें
5. स्क्रिप्ट से बाहर के प्रश्नों को टाल दें`
        : `आप ${contactName} से हिंदी में बात करने जा रहे हैं, ${goal} के बारे में चर्चा करने के लिए ${aiPersonality} लहजे में। महत्वपूर्ण: हमेशा हिंदी में ही जवाब दें। अपने बारे में कुछ भी कहने की जरूरत नहीं है, बस विषय पर ध्यान दें। बिना इमोजी के। 

नियम:
1. केवल ${goal} के बारे में बात करें
2. हर जवाब 150 अक्षर से कम रखें
3. जब उपयोगकर्ता "ठीक है", "जी", "समझ गया" कहे, तो "आपके समय के लिए धन्यवाद" कहें
4. अन्य प्रश्नों को टाल दें`;
    } else {
      // English script instructions (works for both US and Indian English)
      const languageNote = isIndianEnglish ? "Use Indian English expressions and context." : "";
      finalScript = customScript?.trim().length > 0
        ? `You are calling ${contactName} to discuss ${goal} in a ${aiPersonality} tone. ${languageNote} Don't introduce yourself, just focus on the topic. No emojis.

Your script (follow this exactly):
${customScript}

Rules:
1. Only discuss the script and ${goal}
2. Keep every response under 150 characters
3. Explain script information step-by-step
4. When user says "okay", "got it", "no questions", say "thank you for your time"
5. Deflect questions outside the script`
        : `You are calling ${contactName} to discuss ${goal} in a ${aiPersonality} tone. ${languageNote} Don't introduce yourself, just focus on the topic. No emojis.

Rules:
1. Only discuss ${goal}
2. Keep every response under 150 characters
3. When user says "okay", "got it", "no questions", say "thank you for your time"
4. Deflect other questions`;
    }

    console.log("📝 Final Script:", finalScript);
    console.log("🎤 Voice Choice:", voiceChoice);
    console.log("🌍 Language:", isHindi ? "Hindi" : isIndianEnglish ? "Indian English" : "US English");

    // Start Twilio call first to get callSid
    const call = await client.calls.create({
      url: `${PUBLIC_URL}/twilio/start`, // TwiML handler endpoint
      to: phoneNumber,
      from: TWILIO_PHONE,
    });

    console.log("📞 Call initiated with SID:", call.sid);

    // Generate AI response and TTS audio using callSid
    // Pass true as third parameter to indicate this is a system prompt
    let response;
    try {
      response = await gemini(finalScript, call.sid, true);
    } catch (error) {
      console.error("❌ Error generating AI response:", error);
      return res.status(500).json({ error: "Failed to generate AI response" });
    }

    try {
      await generateTTS(response, voiceChoice);
    } catch (error) {
      console.error("❌ Error generating TTS:", error);
      return res.status(500).json({ error: "Failed to generate TTS audio" });
    }

    // Save call history with script only
    const callHistory = {
      googleId,
      contactName,
      phoneNumber,
      goal,
      aiPersonality,
      voiceChoice,
      language,
      script: finalScript, // Save only the script
      callSid: call.sid,
      timestamp: new Date(),
    };

    console.log(callHistory);

    try {
      response = await saveCallHistory(callHistory);
      console.log("📁 Call history saved successfully:", response);
    } catch (error) {
      console.error("❌ Error saving call history:", error);
    }

    // Save call metadata
    saveCallMetadata(call.sid, { voiceChoice });

    console.log(`📞 Call to ${phoneNumber} started. SID: ${call.sid}`);
    res.status(200).json({
      message: `Call to ${contactName} started successfully.`,
      sid: call.sid,
      audioUrl: `${PUBLIC_URL}/audio/speech.mp3`, // Optional: Include the audio URL
    });

  } catch (error) {
    console.error('❌ triggerCall error:', error);
    res.status(500).json({ error: 'Call initiation failed' });
  }
};