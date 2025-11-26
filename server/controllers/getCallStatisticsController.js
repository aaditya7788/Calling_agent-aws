import { getCallHistoryByGoogleId } from '../services/callHistoryService.js';
import { getCampaignStatistics } from '../services/campaignStatsService.js';

export const getCallStatistics = async (req, res) => {
  try {
    const { googleId } = req.params;

    if (!googleId) {
      return res.status(400).json({ error: 'googleId is required to retrieve call statistics.' });
    }

    // Get all call history for the user
    const history = await getCallHistoryByGoogleId(googleId);

    // Get the current date and set the start of the day
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const startOfDayTimestamp = startOfDay.getTime();

    // Calculate call statistics
    const totalCalls = history.length;
    const todaysCalls = history.filter(call => call.timestamp >= startOfDayTimestamp).length;

    // Get campaign statistics
    const campaignStats = await getCampaignStatistics(googleId);

    res.status(200).json({
      totalCalls,
      todaysCalls,
      ...campaignStats
    });
  } catch (error) {
    console.error("❌ Error retrieving call statistics:", error);
    res.status(500).json({ error: 'Failed to retrieve call statistics.' });
  }
};