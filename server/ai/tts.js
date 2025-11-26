import { createWriteStream } from "fs";
import fs from "fs";
import { Readable } from "stream";
import { finished } from "stream/promises";
import path from "path";
import dotenv from 'dotenv';
import { PollyClient, SynthesizeSpeechCommand } from "@aws-sdk/client-polly";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from "../key.js";

dotenv.config();

// Voice to Language mapping
const voiceLanguageMap = {
  // English (US) - Neural supported
  "Joanna": { languageCode: "en-US", engine: "neural" },
  "Matthew": { languageCode: "en-US", engine: "neural" },
  "Ivy": { languageCode: "en-US", engine: "neural" },
  "Justin": { languageCode: "en-US", engine: "neural" },
  "Kendra": { languageCode: "en-US", engine: "neural" },
  "Kimberly": { languageCode: "en-US", engine: "neural" },
  "Salli": { languageCode: "en-US", engine: "neural" },
  "Joey": { languageCode: "en-US", engine: "neural" },
  
  // English (Indian) - Standard only
  "Aditi": { languageCode: "en-IN", engine: "standard" },
  "Raveena": { languageCode: "en-IN", engine: "standard" },
  
  // Hindi - Neural supported
  "Kajal": { languageCode: "hi-IN", engine: "neural" },
};

/**
 * Generate TTS audio file using AWS Polly.
 * @param {string} text - The text to convert to speech.
 * @param {string} voice - Voice ID (e.g., "Joanna", "Matthew", "Kajal"). Defaults to "Joanna".
 * @param {string} name - Optional file name (e.g., "speech"). Defaults to "audio".
 */
export async function generateTTS(text, voice = "Joanna", name = "audio") {
  try {
    const region = AWS_REGION || "ap-south-1";
    const voiceId = voice || "Joanna";

    // Get language and engine for the voice
    const voiceConfig = voiceLanguageMap[voiceId] || { 
      languageCode: "en-US", 
      engine: "neural" 
    };

    console.log(`🎙️ Generating TTS: Voice=${voiceId}, Language=${voiceConfig.languageCode}, Engine=${voiceConfig.engine}`);

    // Create Polly client with keys from key.js
    const polly = new PollyClient({ 
      region, 
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }  
    });

    // Synthesize speech with primary engine
    let command = new SynthesizeSpeechCommand({
      Text: text,
      OutputFormat: "mp3",
      VoiceId: voiceId,
      Engine: voiceConfig.engine,
      LanguageCode: voiceConfig.languageCode,
    });

    let response;
    try {
      response = await polly.send(command);
    } catch (engineError) {
      // If neural engine fails, fallback to standard
      if (engineError.message?.includes('does not support the selected engine') && voiceConfig.engine === 'neural') {
        console.log(`⚠️ Neural engine not supported for ${voiceId}, falling back to standard engine`);
        command = new SynthesizeSpeechCommand({
          Text: text,
          OutputFormat: "mp3",
          VoiceId: voiceId,
          Engine: "standard",
          LanguageCode: voiceConfig.languageCode,
        });
        response = await polly.send(command);
      } else {
        throw engineError;
      }
    }

    if (!response.AudioStream) {
      throw new Error("No audio stream returned from Polly");
    }

    const audioDir = path.resolve("public");
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    const filename = `${name}.mp3`;
    const filePath = path.join(audioDir, filename);

    // Handle AWS SDK v3 stream
    if (typeof response.AudioStream.transformToByteArray === "function") {
      const bytes = await response.AudioStream.transformToByteArray();
      fs.writeFileSync(filePath, Buffer.from(bytes));
    } else if (typeof response.AudioStream.pipe === "function") {
      const fileStream = createWriteStream(filePath, { flags: "w" });
      response.AudioStream.pipe(fileStream);
      await finished(fileStream);
    } else {
      const chunks = [];
      for await (const chunk of response.AudioStream) {
        chunks.push(Buffer.from(chunk));
      }
      fs.writeFileSync(filePath, Buffer.concat(chunks));
    }

    console.log(`✅ TTS audio saved to public/${filename}`);
    return filePath;
  } catch (error) {
    console.error("❌ Error generating TTS:", error.message || error);
    
    // Don't crash the app, just log the error
    if (error.code === 'ENOTFOUND') {
      console.error("💡 Network error: Cannot reach AWS Polly");
    } else if (error.message?.includes('security token') || error.message?.includes('credentials')) {
      console.error("💡 AWS credentials are invalid. Update AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY in .env");
    }
    
    throw error;
  }
}