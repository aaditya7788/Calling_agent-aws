import {
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  RespondToAuthChallengeCommand,
  GetUserCommand,
  UpdateUserAttributesCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  ResendConfirmationCodeCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { cognitoClient, cognitoConfig } from "../config/cognito.js";
import crypto from 'crypto';

// Generate SECRET_HASH for Cognito (if client secret is configured)
function generateSecretHash(username, clientId, clientSecret) {
  if (!clientSecret) return undefined;
  return crypto
    .createHmac('SHA256', clientSecret)
    .update(username + clientId)
    .digest('base64');
}

/**
 * Register a new user with email and password
 */
export async function registerUser({ email, password, firstName, lastName }) {
  try {
    const params = {
      ClientId: cognitoConfig.ClientId,
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'given_name', Value: firstName },
        { Name: 'family_name', Value: lastName }
      ]
    };

    const command = new SignUpCommand(params);
    const response = await cognitoClient.send(command);

    console.log('✅ User registered successfully:', email);
    return {
      success: true,
      userSub: response.UserSub,
      codeDeliveryDetails: response.CodeDeliveryDetails
    };
  } catch (error) {
    console.error('❌ Registration error:', error);
    throw error;
  }
}

/**
 * Verify email with OTP
 */
export async function verifyEmail({ email, code }) {
  try {
    const params = {
      ClientId: cognitoConfig.ClientId,
      Username: email,
      ConfirmationCode: code
    };

    const command = new ConfirmSignUpCommand(params);
    await cognitoClient.send(command);

    console.log('✅ Email verified successfully:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Email verification error:', error);
    throw error;
  }
}

/**
 * Resend verification code
 */
export async function resendConfirmationCode({ email }) {
  try {
    const params = {
      ClientId: cognitoConfig.ClientId,
      Username: email
    };

    const command = new ResendConfirmationCodeCommand(params);
    const response = await cognitoClient.send(command);

    console.log('✅ Verification code resent:', email);
    return {
      success: true,
      codeDeliveryDetails: response.CodeDeliveryDetails
    };
  } catch (error) {
    console.error('❌ Resend code error:', error);
    throw error;
  }
}

/**
 * Login with email and password
 */
export async function loginUser({ email, password }) {
  try {
    const params = {
      AuthFlow: 'USER_PASSWORD_AUTH',
      ClientId: cognitoConfig.ClientId,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password
      }
    };

    const command = new InitiateAuthCommand(params);
    const response = await cognitoClient.send(command);

    console.log('✅ User logged in successfully:', email);
    return {
      success: true,
      accessToken: response.AuthenticationResult?.AccessToken,
      idToken: response.AuthenticationResult?.IdToken,
      refreshToken: response.AuthenticationResult?.RefreshToken,
      expiresIn: response.AuthenticationResult?.ExpiresIn
    };
  } catch (error) {
    console.error('❌ Login error:', error);
    throw error;
  }
}

/**
 * Get user profile using access token
 */
export async function getUserProfile(accessToken) {
  try {
    const params = {
      AccessToken: accessToken
    };

    const command = new GetUserCommand(params);
    const response = await cognitoClient.send(command);

    // Parse user attributes
    const attributes = {};
    response.UserAttributes?.forEach(attr => {
      attributes[attr.Name] = attr.Value;
    });

    return {
      username: response.Username,
      email: attributes.email,
      firstName: attributes.given_name,
      lastName: attributes.family_name,
      emailVerified: attributes.email_verified === 'true',
      sub: attributes.sub
    };
  } catch (error) {
    console.error('❌ Get user profile error:', error);
    throw error;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile({ accessToken, firstName, lastName }) {
  try {
    const attributes = [];
    
    if (firstName) {
      attributes.push({ Name: 'given_name', Value: firstName });
    }
    if (lastName) {
      attributes.push({ Name: 'family_name', Value: lastName });
    }

    const params = {
      AccessToken: accessToken,
      UserAttributes: attributes
    };

    const command = new UpdateUserAttributesCommand(params);
    await cognitoClient.send(command);

    console.log('✅ User profile updated successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Update profile error:', error);
    throw error;
  }
}

/**
 * Forgot password - Send OTP
 */
export async function forgotPassword({ email }) {
  try {
    const params = {
      ClientId: cognitoConfig.ClientId,
      Username: email
    };

    const command = new ForgotPasswordCommand(params);
    const response = await cognitoClient.send(command);

    console.log('✅ Password reset OTP sent:', email);
    return {
      success: true,
      codeDeliveryDetails: response.CodeDeliveryDetails
    };
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    throw error;
  }
}

/**
 * Reset password with OTP
 */
export async function resetPassword({ email, code, newPassword }) {
  try {
    const params = {
      ClientId: cognitoConfig.ClientId,
      Username: email,
      ConfirmationCode: code,
      Password: newPassword
    };

    const command = new ConfirmForgotPasswordCommand(params);
    await cognitoClient.send(command);

    console.log('✅ Password reset successfully:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ Reset password error:', error);
    throw error;
  }
}

/**
 * Refresh access token
 */
export async function refreshAccessToken(refreshToken) {
  try {
    const params = {
      AuthFlow: 'REFRESH_TOKEN_AUTH',
      ClientId: cognitoConfig.ClientId,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken
      }
    };

    const command = new InitiateAuthCommand(params);
    const response = await cognitoClient.send(command);

    return {
      success: true,
      accessToken: response.AuthenticationResult?.AccessToken,
      idToken: response.AuthenticationResult?.IdToken,
      expiresIn: response.AuthenticationResult?.ExpiresIn
    };
  } catch (error) {
    console.error('❌ Refresh token error:', error);
    throw error;
  }
}
