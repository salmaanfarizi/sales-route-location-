#!/bin/bash

# Script to encode Google credentials for Render deployment
# Usage: ./encode-credentials.sh

echo "🔐 Google Credentials Encoder for Render"
echo "=========================================="
echo ""

CREDS_FILE="server/config/credentials.json"

if [ ! -f "$CREDS_FILE" ]; then
    echo "❌ Error: $CREDS_FILE not found!"
    echo ""
    echo "Please make sure you have your Google Service Account credentials file at:"
    echo "  $CREDS_FILE"
    echo ""
    echo "See server/config/README.md for instructions on how to get this file."
    exit 1
fi

echo "✅ Found credentials file: $CREDS_FILE"
echo ""
echo "Encoding to base64..."
echo ""

# Encode the file
ENCODED=$(base64 -i "$CREDS_FILE" | tr -d '\n')

# Save to file
echo "$ENCODED" > credentials_base64.txt

echo "✅ Encoded successfully!"
echo ""
echo "📋 Your encoded credentials have been saved to: credentials_base64.txt"
echo ""
echo "Next steps:"
echo "1. Open credentials_base64.txt"
echo "2. Copy the entire content"
echo "3. In Render Dashboard, add a new environment variable:"
echo "   Key: GOOGLE_CREDENTIALS_BASE64"
echo "   Value: [paste the copied content]"
echo ""
echo "⚠️  IMPORTANT: Keep this file secure! Don't commit it to Git."
echo "   It's already in .gitignore for your safety."
echo ""

# Also display first 50 chars as preview
PREVIEW="${ENCODED:0:50}..."
echo "Preview (first 50 characters):"
echo "$PREVIEW"
echo ""
echo "Full content saved in credentials_base64.txt"
