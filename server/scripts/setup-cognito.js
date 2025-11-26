import {
  CognitoIdentityProviderClient,
  CreateUserPoolCommand,
  CreateUserPoolClientCommand,
  DescribeUserPoolCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from "../key.js";

const client = new CognitoIdentityProviderClient({
  region: AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  }
});

async function setupCognitoUserPool() {
  console.log('🚀 Setting up AWS Cognito User Pool...\n');

  try {
    // Create User Pool
    console.log('📦 Creating User Pool...');
    const createPoolCommand = new CreateUserPoolCommand({
      PoolName: 'CallingAgentUserPool',
      Policies: {
        PasswordPolicy: {
          MinimumLength: 8,
          RequireUppercase: true,
          RequireLowercase: true,
          RequireNumbers: true,
          RequireSymbols: false
        }
      },
      AutoVerifiedAttributes: ['email'],
      UsernameAttributes: ['email'],
      UsernameConfiguration: {
        CaseSensitive: false
      },
      Schema: [
        {
          Name: 'email',
          AttributeDataType: 'String',
          Required: true,
          Mutable: true
        },
        {
          Name: 'given_name',
          AttributeDataType: 'String',
          Required: true,
          Mutable: true
        },
        {
          Name: 'family_name',
          AttributeDataType: 'String',
          Required: true,
          Mutable: true
        }
      ],
      EmailConfiguration: {
        EmailSendingAccount: 'COGNITO_DEFAULT'
      },
      VerificationMessageTemplate: {
        DefaultEmailOption: 'CONFIRM_WITH_CODE',
        EmailSubject: 'Your Calling Agent verification code',
        EmailMessage: 'Your verification code is {####}'
      }
    });

    const poolResponse = await client.send(createPoolCommand);
    const userPoolId = poolResponse.UserPool.Id;
    console.log('✅ User Pool created:', userPoolId);

    // Create User Pool Client
    console.log('\n📦 Creating User Pool Client...');
    const createClientCommand = new CreateUserPoolClientCommand({
      UserPoolId: userPoolId,
      ClientName: 'CallingAgentWebClient',
      ExplicitAuthFlows: [
        'ALLOW_USER_PASSWORD_AUTH',
        'ALLOW_REFRESH_TOKEN_AUTH',
        'ALLOW_USER_SRP_AUTH'
      ],
      PreventUserExistenceErrors: 'ENABLED',
      ReadAttributes: ['email', 'given_name', 'family_name'],
      WriteAttributes: ['email', 'given_name', 'family_name']
    });

    const clientResponse = await client.send(createClientCommand);
    const clientId = clientResponse.UserPoolClient.ClientId;
    console.log('✅ User Pool Client created:', clientId);

    console.log('\n' + '='.repeat(60));
    console.log('✅ Cognito Setup Complete!');
    console.log('='.repeat(60));
    console.log('\n📝 Add these to your .env file:\n');
    console.log(`COGNITO_USER_POOL_ID=${userPoolId}`);
    console.log(`COGNITO_CLIENT_ID=${clientId}`);
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    if (error.name === 'ResourceExistsException') {
      console.error('❌ User pool already exists. Please use the existing pool or delete it first.');
    } else {
      console.error('❌ Error setting up Cognito:', error.message);
    }
  }
}

setupCognitoUserPool();
