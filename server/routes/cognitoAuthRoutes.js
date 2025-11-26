import express from 'express';
import {
  register,
  verifyEmailOTP,
  login,
  getProfile,
  updateProfile,
  forgotPasswordRequest,
  resetPasswordWithOTP,
  resendCode
} from '../controllers/cognitoAuthController.js';

const router = express.Router();

// Registration and verification
router.post('/auth/register', register);
router.post('/auth/verify-email', verifyEmailOTP);
router.post('/auth/resend-code', resendCode);

// Login
router.post('/auth/login', login);

// Profile management (requires authentication)
router.get('/auth/profile', getProfile);
router.put('/auth/profile', updateProfile);

// Password reset
router.post('/auth/forgot-password', forgotPasswordRequest);
router.post('/auth/reset-password', resetPasswordWithOTP);

export default router;
