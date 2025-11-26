import { ScanCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "../config/dynamodb.js";

const CAMPAIGN_TABLE = 'CallingAgent-Campaigns';

/**
 * Get campaign statistics for a user
 */
export async function getCampaignStatistics(googleId) {
  const params = {
    TableName: CAMPAIGN_TABLE,
    FilterExpression: 'googleId = :googleId',
    ExpressionAttributeValues: {
      ':googleId': googleId
    }
  };

  const result = await dynamoDB.send(new ScanCommand(params));
  const campaigns = result.Items || [];

  // Calculate statistics
  const totalCampaigns = campaigns.length;
  const totalCalls = campaigns.reduce((sum, c) => sum + (c.completedCalls || 0), 0);
  const successfulCalls = campaigns.reduce((sum, c) => sum + (c.successfulCalls || 0), 0);
  const failedCalls = campaigns.reduce((sum, c) => sum + (c.failedCalls || 0), 0);
  
  const activeCampaigns = campaigns.filter(c => c.status === 'running').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
  const pendingCampaigns = campaigns.filter(c => c.status === 'pending').length;

  return {
    totalCampaigns,
    totalCalls,
    successfulCalls,
    failedCalls,
    activeCampaigns,
    completedCampaigns,
    pendingCampaigns
  };
}
