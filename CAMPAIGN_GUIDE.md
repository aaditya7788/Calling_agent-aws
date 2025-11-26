# Campaign Feature - CSV Upload Guide

## Overview
The Campaign feature allows you to create bulk calling campaigns by uploading a CSV file containing contact information.

## CSV File Format

### Required Format
Your CSV file must have the following structure:

```csv
name,phoneNumber
John Doe,+1234567890
Jane Smith,+1987654321
Rahul Kumar,+919876543210
```

### Important Notes:
1. **Header Row**: First line must be `name,phoneNumber`
2. **Name Column**: Contact's full name
3. **Phone Number Column**: Must include country code (e.g., +1 for US, +91 for India)
4. **Comma Separated**: Use commas to separate name and phone number
5. **No Special Characters**: Avoid quotes or special characters in names

## Sample CSV File
A sample CSV file is included: `sample-contacts.csv`

## How to Create a Campaign

### Step 1: Prepare Your CSV File
1. Create a new CSV file in Excel, Google Sheets, or any text editor
2. Add header row: `name,phoneNumber`
3. Add your contacts with proper phone number format
4. Save as `.csv` format

### Step 2: Create Campaign
1. Navigate to the **Campaign** section
2. Click **Create Campaign** button
3. Fill in campaign details:
   - **Campaign Name**: Give your campaign a descriptive name
   - **Upload CSV**: Select your prepared CSV file
   - **Goal**: (Optional) Set campaign objective
   - **AI Personality**: Choose conversation tone (Friendly, Professional, Witty, Empathetic)
   - **Language**: Select from English (US), English (Indian), or Hindi
   - **Voice**: Choose appropriate voice for the language
   - **Custom Script**: (Optional) Add personalized script for calls

### Step 3: Review and Submit
1. Verify the number of contacts loaded from CSV
2. Click **Create Campaign** button
3. Campaign will be created with status "pending"

## Features

### Campaign Dashboard
- View all your campaigns
- See campaign status (pending, running, completed, paused)
- Track progress (completed calls / total contacts)
- View campaign details
- Delete campaigns

### Campaign Details
Each campaign shows:
- Campaign name
- Goal
- Personality
- Language and voice
- Total contacts
- Completed calls
- Current status

## Phone Number Format Examples

### United States
```
+1234567890
```

### India
```
+919876543210
```

### UK
```
+447911123456
```

**Always include the country code with + symbol**

## Best Practices

1. **Test Small First**: Start with a small campaign (5-10 contacts) to test
2. **Verify Numbers**: Ensure all phone numbers are valid and formatted correctly
3. **Clear Names**: Use full names for better personalization
4. **Custom Scripts**: Write clear, concise scripts for better engagement
5. **Monitor Progress**: Check campaign status regularly

## Troubleshooting

### CSV Upload Issues
- **No contacts loaded**: Check CSV format and header row
- **Invalid format**: Ensure comma-separated values
- **Special characters**: Remove quotes and special characters

### Campaign Creation Issues
- **Missing required fields**: Fill in all mandatory fields
- **Invalid phone numbers**: Verify country code format
- **Empty CSV**: CSV must contain at least one contact

## API Endpoints

### Backend Routes
```
POST   /api/campaign/create          - Create new campaign
GET    /api/campaign/user/:googleId  - Get user's campaigns
GET    /api/campaign/:campaignId     - Get specific campaign
PUT    /api/campaign/:campaignId/status - Update campaign status
DELETE /api/campaign/:campaignId     - Delete campaign
```

## Database Schema

### DynamoDB Table: CallingAgent-Campaigns
```
campaignId (String, Primary Key)
googleId (String)
campaignName (String)
goal (String)
personality (String)
script (String)
language (String)
voice (String)
contacts (Array of {name, phoneNumber})
totalContacts (Number)
completedCalls (Number)
status (String: pending | running | completed | paused)
createdAt (Number, timestamp)
updatedAt (Number, timestamp)
```

## Support
For issues or questions, please check the logs or contact support.
