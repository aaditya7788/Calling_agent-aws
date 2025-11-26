import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB, TABLES } from "../config/dynamodb.js";

/**
 * Save call history to DynamoDB
 */
export async function saveCallHistory(callHistory) {
  try {
    const item = {
      ...callHistory,
      timestamp: Date.now(), // Use numeric timestamp for sorting
      createdAt: new Date().toISOString()
    };

    await dynamoDB.send(new PutCommand({
      TableName: TABLES.CALL_HISTORY,
      Item: item
    }));

    console.log("📁 Call history saved successfully");
    return item.timestamp;
  } catch (error) {
    console.error("❌ Error saving call history:", error);
    throw error;
  }
}

/**
 * Get call history for a user
 */
export async function getCallHistoryByGoogleId(googleId) {
  try {
    const result = await dynamoDB.send(new QueryCommand({
      TableName: TABLES.CALL_HISTORY,
      KeyConditionExpression: 'googleId = :googleId',
      ExpressionAttributeValues: {
        ':googleId': googleId
      },
      ScanIndexForward: false // Sort by timestamp descending (most recent first)
    }));

    return result.Items || [];
  } catch (error) {
    console.error("❌ Error retrieving call history:", error);
    throw error;
  }
}

/**
 * Get call statistics for a user
 */
export async function getCallStatistics(googleId) {
  try {
    const history = await getCallHistoryByGoogleId(googleId);
    
    return {
      totalCalls: history.length,
      recentCalls: history.slice(0, 10),
      callsByGoal: history.reduce((acc, call) => {
        acc[call.goal] = (acc[call.goal] || 0) + 1;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error("❌ Error calculating statistics:", error);
    throw error;
  }
}
