import express from 'express';
import { registerOrLoginUser } from '../controllers/authController.js';

const router = express.Router();

router.post('/auth/google', registerOrLoginUser);

export default router;
