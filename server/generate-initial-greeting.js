/**
 * Generate initial greeting audio for Twilio calls
 * Run this once: node generate-initial-greeting.js
 */

import { generateTTS } from './ai/tts.js';

const greetingText = "Hello! I'm Callo, ready to help. What's on your mind?";

console.log("🎙️  Generating initial greeting audio...");
console.log("📝 Text:", greetingText);

generateTTS(greetingText, "Joanna", "audio")
  .then(() => {
    console.log("✅ Initial greeting audio created successfully!");
    console.log("📁 File: public/audio.mp3");
    console.log("🌐 Will be served at: /audio/audio.mp3");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Failed to generate greeting:", error.message);
    process.exit(1);
  });
