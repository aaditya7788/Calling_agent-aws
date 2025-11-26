import { getCallHistoryByGoogleId } from '../services/callHistoryService.js';

export const getCallHistory = async (req, res) => {
  try {
    const { googleId } = req.params;

    if (!googleId) {
      return res.status(400).json({ error: 'googleId is required to retrieve call history.' });
    }

    const history = await getCallHistoryByGoogleId(googleId);
    
    if (!history.length) {
      return res.status(404).json({ message: 'No call history found for the provided googleId.' });
    }

    res.status(200).json({ history });
  } catch (error) {
    console.error("❌ Error retrieving call history:", error);
    res.status(500).json({ error: 'Failed to retrieve call history.' });
  }
};

