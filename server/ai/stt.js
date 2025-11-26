import { 
  TranscribeClient, 
  StartTranscriptionJobCommand,
  GetTranscriptionJobCommand,
  DeleteTranscriptionJobCommand 
} from "@aws-sdk/client-transcribe";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from "../key.js";
import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// AWS S3 bucket name for storing audio files temporarily
const S3_BUCKET = process.env.AWS_S3_BUCKET || 'calling-agent-transcribe-temp';

/**
 * Transcribe audio using AWS Transcribe
 * @param {string} audioFilePath - Local path or URL to the audio file
 * @param {string} language - Language for transcription: 'english' or 'hindi'. Defaults to 'english'
 */
export async function transcribeAudio(audioFilePath, language = 'english') {
  try {
    const region = AWS_REGION || 'ap-south-1';
    
    // Map language to AWS Transcribe language codes
    const languageCodeMap = {
      'english': 'en-US',
      'hindi': 'hi-IN',
    };
    const languageCode = languageCodeMap[language.toLowerCase()] || 'en-US';
    
    console.log(`🎤 Starting AWS Transcribe: Language=${language} (${languageCode})`);

    // Initialize AWS clients
    const transcribeClient = new TranscribeClient({
      region,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });

    // Step 1: Download audio from URL and upload directly to S3
    console.log('📥 Fetching audio from URL...');
    const response = await fetch(audioFilePath);
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Step 2: Upload directly to S3
    const s3Key = `transcribe/audio-${Date.now()}.mp3`;
    
    await s3Client.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: 'audio/mpeg'
    }));
    console.log('☁️ Audio uploaded to S3:', s3Key);

    // Step 3: Start transcription job
    const jobName = `transcribe-job-${Date.now()}`;
    const mediaFileUri = `s3://${S3_BUCKET}/${s3Key}`;

    await transcribeClient.send(new StartTranscriptionJobCommand({
      TranscriptionJobName: jobName,
      LanguageCode: languageCode,
      MediaFormat: 'mp3',
      Media: {
        MediaFileUri: mediaFileUri
      }
    }));
    console.log('🔄 Transcription job started:', jobName);

    // Step 4: Poll for completion
    let transcriptionJob;
    let attempts = 0;
    const maxAttempts = 60; // 60 attempts × 2 seconds = 2 minutes max

    while (attempts < maxAttempts) {
      const response = await transcribeClient.send(
        new GetTranscriptionJobCommand({ TranscriptionJobName: jobName })
      );
      transcriptionJob = response.TranscriptionJob;

      if (transcriptionJob.TranscriptionJobStatus === 'COMPLETED') {
        console.log('✅ Transcription completed');
        break;
      } else if (transcriptionJob.TranscriptionJobStatus === 'FAILED') {
        throw new Error(`Transcription failed: ${transcriptionJob.FailureReason}`);
      }

      attempts++;
      console.log(`⏳ Waiting for transcription... (${attempts}/${maxAttempts})`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    }

    if (transcriptionJob.TranscriptionJobStatus !== 'COMPLETED') {
      throw new Error('Transcription timed out');
    }

    // Step 5: Get transcript
    const transcriptUrl = transcriptionJob.Transcript.TranscriptFileUri;
    const transcriptResponse = await fetch(transcriptUrl);
    const transcriptData = await transcriptResponse.json();
    const transcribedText = transcriptData.results.transcripts[0].transcript;

    console.log(`🎤 Transcribed (${language}):`, transcribedText);

    // Step 6: Cleanup - delete transcription job
    await transcribeClient.send(
      new DeleteTranscriptionJobCommand({ TranscriptionJobName: jobName })
    );
    console.log('🧹 Transcription job deleted');

    return transcribedText;
  } catch (error) {
    console.error('❌ AWS Transcribe Error:', error.message || error);
    throw error;
  }
}

// Example usage:
// transcribeAudio('https://output.lemonfox.ai/wikipedia_ai.mp3')
//   .then((text) => console.log('Transcription:', text))
//   .catch((err) => console.error('Error:', err));