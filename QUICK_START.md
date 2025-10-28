# Quick Start Guide

Get your newsletter API running in 5 minutes!

## Prerequisites Checklist

Before starting, make sure you have:
- [ ] Node.js installed (v16+)
- [ ] Google Cloud service account JSON file
- [ ] Google Sheet created and shared with service account
- [ ] SendGrid API key
- [ ] Verified sender email in SendGrid

## Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your credentials
nano .env  # or use your preferred editor
```

**Required values:**
- `GOOGLE_SHEET_ID` - From your Google Sheet URL
- `GOOGLE_SERVICE_ACCOUNT_EMAIL` - From service account JSON
- `GOOGLE_PRIVATE_KEY` - From service account JSON (keep quotes and \n)
- `SENDGRID_API_KEY` - From SendGrid dashboard
- `SENDGRID_FROM_EMAIL` - Your verified email in SendGrid

### 3. Start the Server
```bash
npm run dev
```

Expected output:
```
✅ Google Sheets service initialized
✅ SendGrid service initialized
🚀 Server is running
📍 Port: 3001
```

### 4. Test the API

**Health Check:**
```bash
curl http://localhost:3001/api/health
```

**Add a Subscriber:**
```bash
curl -X POST http://localhost:3001/api/subscribe \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User"}'
```

**Check Google Sheet** - you should see the new subscriber!

**View Unsent Subscribers:**
```bash
curl http://localhost:3001/api/subscribers/unsent
```

**Send Bulk Emails (⚠️ sends real emails!):**
```bash
curl -X POST http://localhost:3001/api/send-bulk-emails
```

## Common Issues

### "Failed to initialize Google Sheets"
- Check if Google Sheets API is enabled in Google Cloud Console
- Verify the sheet is shared with service account email
- Ensure private key is correctly formatted in .env

### "Failed to initialize SendGrid"
- Verify API key is correct
- Check if sender email is verified in SendGrid

### "CORS Error" from frontend
- Make sure `FRONTEND_URL` in .env matches your frontend URL
- Default is `http://localhost:5173`

## Next Steps

1. Update frontend `.env` with `VITE_API_BASE_URL=http://localhost:3001`
2. Test the newsletter form on your frontend
3. Customize the email template in `src/services/sendgrid.js`
4. Set up weekly automation (see main README.md)

## File Structure

```
backend/
├── src/
│   ├── config/config.js          # Environment configuration
│   ├── services/
│   │   ├── googleSheets.js       # Google Sheets integration
│   │   └── sendgrid.js           # Email sending logic
│   ├── routes/newsletter.js      # API endpoints
│   ├── middleware/errorHandler.js
│   └── server.js                 # Main server file
├── examples/
│   ├── test-api.js               # Test script
│   └── custom-email-template.json
├── .env                          # Your credentials (create this)
├── .env.example                  # Template
└── package.json
```

## Production Checklist

Before deploying to production:
- [ ] Add authentication to bulk email endpoint
- [ ] Use HTTPS
- [ ] Set `NODE_ENV=production`
- [ ] Review rate limits
- [ ] Set up error monitoring
- [ ] Never commit .env file

## Support

For detailed setup instructions, see:
- `README.md` - Complete documentation
- `../SETUP_GUIDE.md` - Step-by-step setup guide
- `examples/test-api.js` - API testing examples

Happy newsletter sending! 📧
