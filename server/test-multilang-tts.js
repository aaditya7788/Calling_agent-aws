import { generateTTS } from './ai/tts.js';

// Test different voices and languages
async function testMultiLanguageTTS() {
  console.log("🧪 Testing Multi-Language TTS...\n");

  try {
    // Test English (US) - Neural
    console.log("1️⃣ Testing English (US) - Joanna (Neural)");
    await generateTTS("Hello! My name is Joanna. I will read any text you type here.", "Joanna", "test-joanna");
    
    // Test English (US) - Neural Male
    console.log("\n2️⃣ Testing English (US) - Matthew (Neural)");
    await generateTTS("Hello! My name is Matthew. I'm a male voice from the United States.", "Matthew", "test-matthew");
    
    // Test English (Indian) - Standard
    console.log("\n3️⃣ Testing English (Indian) - Aditi (Standard)");
    await generateTTS("Hello! My name is Aditi. I can read any text you type here.", "Aditi", "test-aditi");
    
    // Test Hindi - Standard
    console.log("\n4️⃣ Testing Hindi - Kajal (Standard)");
    await generateTTS("नमस्ते! मेरा नाम काजल है. मैं आपके द्वारा यहाँ टाइप किए गए किसी भी टेक्स्ट को पढ़ सकती हूँ।", "Kajal", "test-kajal");
    
    console.log("\n✅ All TTS tests completed successfully!");
    console.log("📁 Check the public/ folder for generated audio files:");
    console.log("   - test-joanna.mp3 (English US - Neural)");
    console.log("   - test-matthew.mp3 (English US - Neural)");
    console.log("   - test-aditi.mp3 (English Indian - Standard)");
    console.log("   - test-kajal.mp3 (Hindi - Standard)");
    
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    process.exit(1);
  }
}

testMultiLanguageTTS();
