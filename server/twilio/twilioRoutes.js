import express from 'express';
import { handleStart, handleVoice, handleRespond } from './twilioVoiceLoop.js';
import { handleCampaignStart } from './campaignVoiceHandler.js';

const router = express.Router();

// Regular interactive call routes
router.post('/start', handleStart);
router.post('/voice', handleVoice);
router.post('/respond', handleRespond);

// One-sided campaign call route
router.post('/campaign-call', handleCampaignStart);

export default router;