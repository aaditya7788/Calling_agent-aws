import { gemini } from "./gemini.js";       // Your Gemini function
import { generateTTS } from "./ai/tts.js";  // Your TTS function

export async function ttsForSpeech(prompt) {
  try {
    // Step 1: Get Gemini response
    const reply = await gemini(prompt);

    // Step 2: Generate TTS from the Gemini reply
    await generateTTS(reply);

    // Step 3: Return the text reply (optional: add file URL)
    return {
      text: reply,
      audioUrl: "/speech.mp3", // If served from public folder
    };
  } catch (err) {
    console.error("❌ Error in ttsForSpeech:", err);
    return {
      text: "Sorry, something went wrong.",
      audioUrl: null,
    };
  }
}
