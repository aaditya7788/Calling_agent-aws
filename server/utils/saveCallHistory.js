import { saveCallHistory as saveToDynamoDB } from '../services/callHistoryService.js';

export const saveCallHistory = async (callHistory) => {
  try {
    const timestamp = await saveToDynamoDB(callHistory);
    console.log("📁 Call history saved successfully:", timestamp);
    return timestamp;
  } catch (error) {
    console.error("❌ Error saving call history:", error);
    throw error;
  }
};