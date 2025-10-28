# Create New Google Sheet for Newsletter

## Quick Setup

1. **Go to Google Sheets**: https://sheets.google.com
2. **Create a new blank spreadsheet**
3. **Rename it** to "Newsletter Subscribers"
4. **Rename the first tab** to "Newsletter"
5. **Copy the Sheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/COPY_THIS_PART/edit
   ```
6. **Share with service account**:
   - Click "Share" button
   - Paste your service account email from .env file
   - Set to "Editor"
   - Uncheck "Notify people"
   - Click "Share"

7. **Update .env** with the new GOOGLE_SHEET_ID

## Verify Setup

The sheet will automatically create these headers when you start the server:
- Column A: Email
- Column B: Name  
- Column C: SentMail

## Test Access

Run this to verify the service account can access the sheet:
```bash
curl http://localhost:3001/api/health
```

If the server starts successfully, you should see:
```
✅ Google Sheets service initialized
✅ SendGrid service initialized
🚀 Server is running
```
