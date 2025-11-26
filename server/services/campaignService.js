import { PutCommand, ScanCommand, GetCommand, DeleteCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB } from "../config/dynamodb.js";

const CAMPAIGN_TABLE = 'CallingAgent-Campaigns';

/**
 * Create a new campaign
 */
export async function createCampaign({ googleId, campaignName, goal, personality, script, language, voice, contacts }) {
  const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = Date.now();

  const campaign = {
    campaignId,
    googleId,
    campaignName,
    goal,
    personality,
    script,
    language,
    voice,
    contacts, // Array of { name, phoneNumber }
    totalContacts: contacts.length,
    completedCalls: 0,
    successfulCalls: 0,
    failedCalls: 0,
    status: 'pending', // pending, running, completed, paused
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const params = {
    TableName: CAMPAIGN_TABLE,
    Item: campaign
  };

  await dynamoDB.send(new PutCommand(params));
  console.log('✅ Campaign created:', campaignId);
  return campaign;
}

/**
 * Get all campaigns for a user
 */
export async function getCampaignsByUserId(googleId) {
  const params = {
    TableName: CAMPAIGN_TABLE,
    FilterExpression: 'googleId = :googleId',
    ExpressionAttributeValues: {
      ':googleId': googleId
    }
  };

  const result = await dynamoDB.send(new ScanCommand(params));
  return result.Items || [];
}

/**
 * Get a specific campaign
 */
export async function getCampaignById(campaignId) {
  const params = {
    TableName: CAMPAIGN_TABLE,
    Key: { campaignId }
  };

  const result = await dynamoDB.send(new GetCommand(params));
  return result.Item;
}

/**
 * Update campaign status
 */
export async function updateCampaignStatus(campaignId, status, completedCalls = null, successfulCalls = null, failedCalls = null) {
  let updateExpression = 'SET #status = :status, updatedAt = :updatedAt';
  const expressionAttributeValues = { 
    ':status': status, 
    ':updatedAt': Date.now() 
  };

  if (completedCalls !== null) {
    updateExpression += ', completedCalls = :completedCalls';
    expressionAttributeValues[':completedCalls'] = completedCalls;
  }

  if (successfulCalls !== null) {
    updateExpression += ', successfulCalls = :successfulCalls';
    expressionAttributeValues[':successfulCalls'] = successfulCalls;
  }

  if (failedCalls !== null) {
    updateExpression += ', failedCalls = :failedCalls';
    expressionAttributeValues[':failedCalls'] = failedCalls;
  }

  const params = {
    TableName: CAMPAIGN_TABLE,
    Key: { campaignId },
    UpdateExpression: updateExpression,
    ExpressionAttributeNames: {
      '#status': 'status'
    },
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };

  const result = await dynamoDB.send(new UpdateCommand(params));
  return result.Attributes;
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(campaignId) {
  const params = {
    TableName: CAMPAIGN_TABLE,
    Key: { campaignId }
  };

  await dynamoDB.send(new DeleteCommand(params));
  console.log('✅ Campaign deleted:', campaignId);
}
