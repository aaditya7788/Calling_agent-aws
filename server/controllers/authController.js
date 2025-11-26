// File: controllers/authController.js
import { findOrCreateUser } from '../services/userService.js';

export const registerOrLoginUser = async (req, res) => {
  const { sub: googleId, name, email, picture } = req.body;

  try {
    const { user, isNew } = await findOrCreateUser({ googleId, name, email, picture });

    if (isNew) {
      console.log('✅ New user created');
    } else {
      console.log('🔁 Existing user logged in');
    }

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error('❌ Error saving user:', err);
    res.status(500).json({ error: 'Server error' });
  }
};
