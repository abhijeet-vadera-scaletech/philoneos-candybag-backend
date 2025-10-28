# Newsletter Backend API

A Node.js backend service for managing newsletter subscriptions with Google Sheets integration and bulk email sending via SendGrid.

## Features

- ✅ Subscribe users to newsletter (stores in Google Sheets)
- ✅ Send bulk emails to subscribers via SendGrid
- ✅ Track email delivery status
- ✅ Rate limiting for API protection
- ✅ CORS enabled for frontend integration
- ✅ Error handling and validation

## Prerequisites

Before running this application, you need:

1. **Node.js** (v16 or higher)
2. **Google Cloud Service Account** with Google Sheets API access
3. **SendGrid Account** with API key
4. **Google Sheet** created and shared with service account

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Sheets Setup

#### Create a Google Cloud Project and Service Account:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google Sheets API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

4. Create Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and create
   - Click on the created service account
   - Go to "Keys" tab
   - Click "Add Key" > "Create New Key" > "JSON"
   - Download the JSON file

#### Create and Configure Google Sheet:

1. Create a new Google Sheet
2. Copy the Sheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit
   ```
3. Share the sheet with your service account email (found in the JSON file)
   - Give "Editor" permissions
4. Rename the first sheet to "Newsletter" (or update `sheetName` in code)

### 3. SendGrid Setup

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API Key:
   - Go to Settings > API Keys
   - Click "Create API Key"
   - Give it "Full Access" or "Mail Send" permissions
   - Copy the API key (you won't see it again!)
3. Verify your sender email/domain in SendGrid

### 4. Environment Configuration

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` and fill in your credentials:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Google Sheets Configuration
GOOGLE_SHEET_ID=your_google_sheet_id_here
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"

# SendGrid Configuration
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Your Company Name

# CORS Configuration
FRONTEND_URL=http://localhost:5173
```

**Important Notes:**
- The `GOOGLE_PRIVATE_KEY` should include the full key with `\n` for line breaks
- Copy it from the downloaded JSON file (`private_key` field)
- Keep the quotes around the private key

### 5. Run the Server

Development mode (with auto-reload):
```bash
npm run dev
```

Production mode:
```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### 1. Subscribe to Newsletter

**Endpoint:** `POST /api/subscribe`

**Request Body:**
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

**Frontend Integration:**
Update your frontend `.env` file:
```env
VITE_API_BASE_URL=http://localhost:3001
```

### 2. Send Bulk Emails

**Endpoint:** `POST /api/send-bulk-emails`

**Request Body (Optional - uses default template if not provided):**
```json
{
  "emailTemplate": {
    "subject": "Welcome to Our Newsletter!",
    "html": "<html>...</html>",
    "text": "Plain text version..."
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Bulk email sending completed. Sent: 10, Failed: 0",
  "results": {
    "total": 10,
    "sent": 10,
    "failed": 0,
    "errors": []
  }
}
```

**Email Template Variables:**
- `{{name}}` - Subscriber's name
- `{{email}}` - Subscriber's email

### 3. Get Unsent Subscribers

**Endpoint:** `GET /api/subscribers/unsent`

**Response:**
```json
{
  "success": true,
  "count": 5,
  "subscribers": [
    { "email": "user1@example.com", "name": "User 1" },
    { "email": "user2@example.com", "name": "User 2" }
  ]
}
```

### 4. Health Check

**Endpoint:** `GET /api/health`

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Testing the APIs

### Using cURL:

**Subscribe:**
```bash
curl -X POST http://localhost:3001/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

**Send Bulk Emails:**
```bash
curl -X POST http://localhost:3001/api/send-bulk-emails \
  -H "Content-Type: application/json"
```

**Get Unsent Subscribers:**
```bash
curl http://localhost:3001/api/subscribers/unsent
```

## Google Sheet Structure

The Google Sheet will have the following columns:

| Email | Name | SentMail |
|-------|------|----------|
| user@example.com | John Doe | false |
| user2@example.com | Jane Smith | true |

- **Email**: Subscriber's email address
- **Name**: Subscriber's name (optional)
- **SentMail**: Boolean indicating if welcome email was sent

## Scheduling Bulk Emails

For weekly email sending, you can use:

1. **Cron Job (Linux/Mac):**
```bash
# Edit crontab
crontab -e

# Add this line to run every Monday at 9 AM
0 9 * * 1 curl -X POST http://localhost:3001/api/send-bulk-emails
```

2. **Node-cron (within the app):**
Install: `npm install node-cron`

Add to `server.js`:
```javascript
import cron from 'node-cron';

// Run every Monday at 9 AM
cron.schedule('0 9 * * 1', async () => {
  console.log('Running weekly email job...');
  // Call your bulk email function
});
```

3. **External Services:**
   - Use services like [Zapier](https://zapier.com/) or [Make](https://www.make.com/)
   - Set up a webhook to call your API weekly

## Security Considerations

⚠️ **Important for Production:**

1. **Add Authentication:** The bulk email endpoint should be protected with API keys or JWT tokens
2. **Use HTTPS:** Always use SSL/TLS in production
3. **Environment Variables:** Never commit `.env` file to version control
4. **Rate Limiting:** Adjust rate limits based on your needs
5. **Input Validation:** Additional validation may be needed for production use
6. **SendGrid Limits:** Check your SendGrid plan limits for bulk sending

## Troubleshooting

### Google Sheets API Error
- Verify the service account has access to the sheet
- Check if Google Sheets API is enabled in Google Cloud Console
- Ensure the private key is correctly formatted in `.env`

### SendGrid Error
- Verify your API key is correct
- Check if sender email is verified in SendGrid
- Review SendGrid sending limits for your plan

### CORS Error
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Ensure the frontend is making requests to the correct backend URL

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── config.js          # Configuration management
│   ├── services/
│   │   ├── googleSheets.js    # Google Sheets integration
│   │   └── sendgrid.js        # SendGrid email service
│   ├── routes/
│   │   └── newsletter.js      # API routes
│   ├── middleware/
│   │   └── errorHandler.js    # Error handling
│   └── server.js              # Main server file
├── .env                       # Environment variables (create this)
├── .env.example              # Environment template
├── .gitignore
├── package.json
└── README.md
```

## License

ISC
