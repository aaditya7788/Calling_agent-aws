import express from 'express';
import {
  createCampaignController,
  getUserCampaigns,
  getCampaignController,
  updateCampaignStatusController,
  deleteCampaignController
} from '../controllers/campaignController.js';
import {
  executeCampaign,
  pauseCampaign,
  resumeCampaign
} from '../controllers/campaignExecutionController.js';

const router = express.Router();

// Create a new campaign
router.post('/campaign/create', createCampaignController);

// Get all campaigns for a user
router.get('/campaign/user/:googleId', getUserCampaigns);

// Get a specific campaign
router.get('/campaign/:campaignId', getCampaignController);

// Update campaign status
router.put('/campaign/:campaignId/status', updateCampaignStatusController);

// Execute campaign (start making calls)
router.post('/campaign/:campaignId/execute', executeCampaign);

// Pause campaign
router.post('/campaign/:campaignId/pause', pauseCampaign);

// Resume campaign
router.post('/campaign/:campaignId/resume', resumeCampaign);

// Delete a campaign
router.delete('/campaign/:campaignId', deleteCampaignController);

export default router;
