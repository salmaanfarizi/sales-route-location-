# Google Sheets Configuration

To set up Google Sheets integration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Give it a name and click "Create"
   - Grant it "Editor" role
   - Click "Done"
5. Create a key for the service account:
   - Click on the service account you just created
   - Go to "Keys" tab
   - Click "Add Key" > "Create new key"
   - Choose JSON format
   - Save the downloaded file as `credentials.json` in this directory
6. Create a Google Sheet:
   - Go to Google Sheets and create a new spreadsheet
   - Copy the spreadsheet ID from the URL (the long string between /d/ and /edit)
   - Add the spreadsheet ID to your `.env` file
7. Share the sheet:
   - Share the Google Sheet with the service account email (found in credentials.json as "client_email")
   - Give it "Editor" permissions

Place your `credentials.json` file in this directory.

**IMPORTANT**: Never commit `credentials.json` to version control!
