import {
  registerUser,
  verifyEmail,
  loginUser,
  getUserProfile,
  updateUserProfile,
  forgotPassword,
  resetPassword,
  resendConfirmationCode
} from '../services/cognitoService.js';
import { findOrCreateUser, updateUser } from '../services/userService.js';

/**
 * Register new user
 */
export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ 
        error: 'Email, password, first name, and last name are required' 
      });
    }

    // Register user in Cognito
    const result = await registerUser({ email, password, firstName, lastName });

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email for verification code.',
      data: {
        email,
        codeDeliveryDetails: result.codeDeliveryDetails
      }
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    res.status(500).json({ 
      error: error.message || 'Registration failed' 
    });
  }
};

/**
 * Verify email with OTP
 */
export const verifyEmailOTP = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and verification code are required' });
    }

    await verifyEmail({ email, code });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully. You can now login.'
    });
  } catch (error) {
    console.error('❌ Verify email error:', error);
    res.status(500).json({ 
      error: error.message || 'Email verification failed' 
    });
  }
};

/**
 * Resend verification code
 */
export const resendCode = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await resendConfirmationCode({ email });

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      data: result.codeDeliveryDetails
    });
  } catch (error) {
    console.error('❌ Resend code error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to resend verification code' 
    });
  }
};

/**
 * Login user
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Authenticate with Cognito
    const authResult = await loginUser({ email, password });

    // Get user profile from Cognito
    const userProfile = await getUserProfile(authResult.accessToken);

    // Save/update user in DynamoDB
    const { user } = await findOrCreateUser({
      googleId: userProfile.sub, // Use Cognito sub as unique ID
      name: `${userProfile.firstName} ${userProfile.lastName}`,
      email: userProfile.email,
      picture: '' // No picture from Cognito, can be added later
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.googleId,
          email: user.email,
          firstName: userProfile.firstName,
          lastName: userProfile.lastName,
          name: user.name
        },
        tokens: {
          accessToken: authResult.accessToken,
          idToken: authResult.idToken,
          refreshToken: authResult.refreshToken,
          expiresIn: authResult.expiresIn
        }
      }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(401).json({ 
      error: error.message || 'Login failed' 
    });
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');

    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const userProfile = await getUserProfile(accessToken);

    res.status(200).json({
      success: true,
      data: userProfile
    });
  } catch (error) {
    console.error('❌ Get profile error:', error);
    res.status(401).json({ 
      error: error.message || 'Failed to get profile' 
    });
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
  try {
    const accessToken = req.headers.authorization?.replace('Bearer ', '');
    const { firstName, lastName } = req.body;

    if (!accessToken) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Update in Cognito
    await updateUserProfile({ accessToken, firstName, lastName });

    // Get updated profile
    const userProfile = await getUserProfile(accessToken);

    // Update in DynamoDB
    await updateUser(userProfile.sub, {
      name: `${firstName} ${lastName}`
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: userProfile
    });
  } catch (error) {
    console.error('❌ Update profile error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update profile' 
    });
  }
};

/**
 * Forgot password - Send OTP
 */
export const forgotPasswordRequest = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const result = await forgotPassword({ email });

    res.status(200).json({
      success: true,
      message: 'Password reset code sent to your email',
      data: result.codeDeliveryDetails
    });
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to send reset code' 
    });
  }
};

/**
 * Reset password with OTP
 */
export const resetPasswordWithOTP = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        error: 'Email, verification code, and new password are required' 
      });
    }

    await resetPassword({ email, code, newPassword });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('❌ Reset password error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to reset password' 
    });
  }
};
