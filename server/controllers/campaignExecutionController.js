import { getCampaignById, updateCampaignStatus } from '../services/campaignService.js';
import twilio from 'twilio';
import { generateTTS } from '../ai/tts.js';
import dotenv from 'dotenv';
dotenv.config();

const TWILIO_SID = process.env.TWILIO_SID;
const TWILIO_AUTH = process.env.TWILIO_AUTH;
const TWILIO_PHONE = process.env.TWILIO_PHONE;
const PUBLIC_URL = process.env.PUBLIC_URL;

const twilioClient = twilio(TWILIO_SID, TWILIO_AUTH);

/**
 * Execute a campaign - make calls to all contacts
 */
export const executeCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status === 'running') {
      return res.status(400).json({ error: 'Campaign is already running' });
    }

    if (campaign.status === 'completed') {
      return res.status(400).json({ error: 'Campaign is already completed' });
    }

    // Update status to running
    await updateCampaignStatus(campaignId, 'running', 0);

    // Start making calls in the background
    makeCallsForCampaign(campaign).catch(err => {
      console.error('Error executing campaign:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Campaign execution started',
      data: { campaignId, totalContacts: campaign.contacts.length }
    });
  } catch (error) {
    console.error('❌ Execute campaign error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to execute campaign' 
    });
  }
};

/**
 * Make calls to all contacts in the campaign
 */
async function makeCallsForCampaign(campaign) {
  const { campaignId, goal, personality, script, voice, language, contacts } = campaign;
  let completedCalls = 0;
  let successfulCalls = 0;
  let failedCalls = 0;

  console.log(`📞 Starting campaign: ${campaign.campaignName}`);
  console.log(`📊 Total contacts: ${contacts.length}`);

  // Prepare the promotional message
  const promotionalMessage = script || `Hi! This is ${goal || 'a promotional call'}. Thank you for your time.`;

  // Map language to voice language code
  const languageMap = {
    'English (US)': 'en-US',
    'English (Indian)': 'en-IN',
    'Hindi': 'hi-IN'
  };
  const voiceLanguage = languageMap[language] || 'en-US';

  for (let i = 0; i < contacts.length; i++) {
    const contact = contacts[i];
    
    try {
      console.log(`📞 Calling ${i + 1}/${contacts.length}: ${contact.name} at ${contact.phoneNumber}`);

      // Generate personalized message
      const personalizedMessage = promotionalMessage.replace(/\{name\}/g, contact.name);

      // Make the one-sided call using Twilio
      // Message, voice, and language will be passed to the handler
      const call = await twilioClient.calls.create({
        from: TWILIO_PHONE,
        to: contact.phoneNumber,
        url: `${PUBLIC_URL}/twilio/campaign-call?callSid=${campaignId}_${i}&message=${encodeURIComponent(personalizedMessage)}&voice=${voice}&language=${voiceLanguage}`,
        method: 'POST',
        statusCallback: `${PUBLIC_URL}/twilio/call-status`,
        statusCallbackMethod: 'POST',
        statusCallbackEvent: ['completed']
      });

      console.log(`✅ Call ${i + 1} initiated: ${contact.name} - Call SID: ${call.sid}`);
      successfulCalls++;
      completedCalls++;

    } catch (error) {
      console.error(`❌ Error calling ${contact.name}:`, error.message);
      failedCalls++;
      completedCalls++;
    }

    // Update campaign progress
    await updateCampaignStatus(campaignId, 'running', completedCalls, successfulCalls, failedCalls);

    // Add delay between calls (5 seconds)
    if (i < contacts.length - 1) {
      console.log('⏳ Waiting 5 seconds before next call...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }

  // Mark campaign as completed
  await updateCampaignStatus(campaignId, 'completed', completedCalls, successfulCalls, failedCalls);
  console.log(`✅ Campaign completed: ${campaign.campaignName}`);
  console.log(`📊 Stats - Total: ${completedCalls}, Success: ${successfulCalls}, Failed: ${failedCalls}`);
}

/**
 * Pause a running campaign
 */
export const pauseCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'running') {
      return res.status(400).json({ error: 'Campaign is not running' });
    }

    await updateCampaignStatus(campaignId, 'paused');

    res.status(200).json({
      success: true,
      message: 'Campaign paused successfully'
    });
  } catch (error) {
    console.error('❌ Pause campaign error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to pause campaign' 
    });
  }
};

/**
 * Resume a paused campaign
 */
export const resumeCampaign = async (req, res) => {
  try {
    const { campaignId } = req.params;

    const campaign = await getCampaignById(campaignId);

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    if (campaign.status !== 'paused') {
      return res.status(400).json({ error: 'Campaign is not paused' });
    }

    // Update status to running
    await updateCampaignStatus(campaignId, 'running');

    // Resume making calls
    makeCallsForCampaign(campaign).catch(err => {
      console.error('Error resuming campaign:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Campaign resumed successfully'
    });
  } catch (error) {
    console.error('❌ Resume campaign error:', error);
    res.status(500).json({ 
      error: error.message || 'Failed to resume campaign' 
    });
  }
};
