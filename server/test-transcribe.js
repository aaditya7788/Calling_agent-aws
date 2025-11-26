import { transcribeAudio } from './ai/stt.js';
import { generateTTS } from './ai/tts.js';
import path from 'path';

async function testTranscribe() {
  console.log('🧪 Testing AWS Transcribe STT...\n');

  try {
    // First, generate a test audio file
    console.log('1️⃣ Generating test audio in English...');
    await generateTTS('Hello, this is a test of AWS Transcribe. Can you hear me clearly?', 'Joanna', 'test-english');
    
    console.log('\n2️⃣ Generating test audio in Hindi...');
    await generateTTS('नमस्ते, यह AWS Transcribe का परीक्षण है। क्या आप मुझे स्पष्ट रूप से सुन सकते हैं?', 'Kajal', 'test-hindi');
    
    // Test English transcription
    console.log('\n3️⃣ Transcribing English audio...');
    const publicUrl = process.env.PUBLIC_URL || 'http://localhost:8080';
    const englishText = await transcribeAudio(`${publicUrl}/audio/test-english.mp3`, 'english');
    console.log('✅ English Result:', englishText);
    
    // Test Hindi transcription
    console.log('\n4️⃣ Transcribing Hindi audio...');
    const hindiText = await transcribeAudio(`${publicUrl}/audio/test-hindi.mp3`, 'hindi');
    console.log('✅ Hindi Result:', hindiText);
    
    console.log('\n✨ All tests passed! AWS Transcribe is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

testTranscribe();
