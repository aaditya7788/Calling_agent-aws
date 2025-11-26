import {
  createCampaign,
  getCampaignsByUserId,
  getCampaignById,
  updateCampaignStatus,
  deleteCampaign
} from '../services/campaignService.js';

/**
 * Create a new campaign
 */
export const createCampaignController = async (req, res) => {
  try {
    const { googleId, campaignName, goal, personality, script, language, voice, contacts } = req.body;

    if (!googleId || !campaignName || !contacts || contacts.length === 0) {
      return res.status(400).json({ 
        error: 'Google ID, campaign name, and at least one contact are required' 
      });
    }

    const campaign = await createCampaign({
      googleId,
      campaignName,
      goal,
      personality,
      script,
      language,
      voice,
      contacts
    });

    res.status(201).json({
      success: true,
      message: 'Campaign created successfully',
      data: campaign
    });
  } catch (error) {
    console.error('❌ Create campaign error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to create campaign' 
    });
  }
};

/**
 * Get all campaigns for a user
 */
export const getUserCampaigns = async (req, res) => {
  try {
    const { googleId } = req.params;

    if (!googleId) {
      return res.status(400).json({ error: 'Google ID is required' });
    }

    const campaigns = await getCampaignsByUserId(googleId);

    res.status(200).json({
      success: true,
      data: campaigns
    });
  } catch (error) {
    console.error('❌ Get campaigns error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch campaigns' 
    });
  }
};

/**
 * Get a specific campaign
 */
export const getCampaignController = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.status(200).json({
      success: true,
      data: campaign
    });
  } catch (error) {
    console.error('❌ Get campaign error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to fetch campaign' 
    });
  }
};

/**
 * Update campaign status
 */
export const updateCampaignStatusController = async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { status, completedCalls } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const updatedCampaign = await updateCampaignStatus(campaignId, status, completedCalls);

    res.status(200).json({
      success: true,
      message: 'Campaign status updated',
      data: updatedCampaign
    });
  } catch (error) {
    console.error('❌ Update campaign error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to update campaign' 
    });
  }
};

/**
 * Delete a campaign
 */
export const deleteCampaignController = async (req, res) => {
  try {
    const { campaignId } = req.params;

    await deleteCampaign(campaignId);

    res.status(200).json({
      success: true,
      message: 'Campaign deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete campaign error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to delete campaign' 
    });
  }
};
