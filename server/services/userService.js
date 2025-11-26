import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDB, TABLES } from "../config/dynamodb.js";

/**
 * Find or create a user in DynamoDB
 */
export async function findOrCreateUser({ googleId, name, email, picture }) {
  try {
    // Try to get existing user
    const getResult = await dynamoDB.send(new GetCommand({
      TableName: TABLES.USERS,
      Key: { googleId }
    }));

    if (getResult.Item) {
      console.log('🔁 Existing user found');
      return { user: getResult.Item, isNew: false };
    }

    // Create new user
    const newUser = {
      googleId,
      name,
      email,
      picture,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await dynamoDB.send(new PutCommand({
      TableName: TABLES.USERS,
      Item: newUser,
      ConditionExpression: 'attribute_not_exists(googleId)' // Ensure uniqueness
    }));

    console.log('✅ New user created');
    return { user: newUser, isNew: true };
  } catch (error) {
    if (error.name === 'ConditionalCheckFailedException') {
      // Race condition - user was just created, fetch again
      const getResult = await dynamoDB.send(new GetCommand({
        TableName: TABLES.USERS,
        Key: { googleId }
      }));
      return { user: getResult.Item, isNew: false };
    }
    throw error;
  }
}

/**
 * Get user by googleId
 */
export async function getUserByGoogleId(googleId) {
  const result = await dynamoDB.send(new GetCommand({
    TableName: TABLES.USERS,
    Key: { googleId }
  }));
  return result.Item || null;
}

/**
 * Update user information
 */
export async function updateUser(googleId, updates) {
  const updateExpression = [];
  const expressionAttributeNames = {};
  const expressionAttributeValues = {};

  Object.keys(updates).forEach((key, index) => {
    const placeholder = `#attr${index}`;
    const valuePlaceholder = `:val${index}`;
    updateExpression.push(`${placeholder} = ${valuePlaceholder}`);
    expressionAttributeNames[placeholder] = key;
    expressionAttributeValues[valuePlaceholder] = updates[key];
  });

  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();
  updateExpression.push('#updatedAt = :updatedAt');

  const result = await dynamoDB.send(new UpdateCommand({
    TableName: TABLES.USERS,
    Key: { googleId },
    UpdateExpression: `SET ${updateExpression.join(', ')}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  }));

  return result.Attributes;
}
