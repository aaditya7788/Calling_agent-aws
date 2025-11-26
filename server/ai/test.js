import dotenv from "dotenv";
import { STSClient, GetCallerIdentityCommand } from "@aws-sdk/client-sts";
import { fileURLToPath } from "url";
dotenv.config();

async function validateAwsCreds() {
  const region = process.env.AWS_REGION || "ap-south-1";
  const client = new STSClient({ region });
  try {
    const res = await client.send(new GetCallerIdentityCommand({}));
    console.log("✅ AWS credentials valid");
    console.log("Account:", res.Account);
    console.log("ARN:", res.Arn);
    process.exit(0);
  } catch (err) {
    console.error("❌ AWS credential validation failed:", err.name || err.code || err.message);
    process.exit(1);
  }
}

const __filename = fileURLToPath(import.meta.url);
if (process.argv[1] === __filename) {
  validateAwsCreds();
}

export { validateAwsCreds };