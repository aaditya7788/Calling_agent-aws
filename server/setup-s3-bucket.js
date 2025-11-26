import { S3Client, CreateBucketCommand, PutBucketCorsCommand } from "@aws-sdk/client-s3";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from "./key.js";

const BUCKET_NAME = 'calling-agent-transcribe-temp';

async function setupS3Bucket() {
  try {
    const s3Client = new S3Client({
      region: AWS_REGION,
      credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY
      }
    });

    console.log(`🪣 Creating S3 bucket: ${BUCKET_NAME}`);
    
    // Create bucket
    try {
      await s3Client.send(new CreateBucketCommand({
        Bucket: BUCKET_NAME,
        CreateBucketConfiguration: {
          LocationConstraint: AWS_REGION
        }
      }));
      console.log('✅ S3 bucket created successfully');
    } catch (error) {
      if (error.name === 'BucketAlreadyOwnedByYou') {
        console.log('ℹ️ Bucket already exists');
      } else {
        throw error;
      }
    }

    // Set CORS policy
    await s3Client.send(new PutBucketCorsCommand({
      Bucket: BUCKET_NAME,
      CORSConfiguration: {
        CORSRules: [
          {
            AllowedHeaders: ['*'],
            AllowedMethods: ['GET', 'PUT', 'POST'],
            AllowedOrigins: ['*'],
            ExposeHeaders: []
          }
        ]
      }
    }));
    console.log('✅ CORS policy set');

    console.log(`\n✨ Setup complete! Add this to your .env file:\n`);
    console.log(`AWS_S3_BUCKET=${BUCKET_NAME}\n`);

  } catch (error) {
    console.error('❌ Error setting up S3 bucket:', error);
    process.exit(1);
  }
}

setupS3Bucket();
