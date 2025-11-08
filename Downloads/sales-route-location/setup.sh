#!/bin/bash

# Sales Route Location Manager - Setup Script
# This script helps set up the application quickly

echo "========================================"
echo "  Al-Hasa Sales Route Manager Setup    "
echo "========================================"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v14+) first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm -v)"
echo ""

# Install dependencies
echo "📦 Installing server dependencies..."
npm install

echo ""
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

echo ""
echo "✅ Dependencies installed successfully!"
echo ""

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads
mkdir -p server/config
echo "✅ Directories created!"
echo ""

# Check for environment files
echo "🔧 Checking configuration files..."
echo ""

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env file and add your API keys:"
    echo "   - GOOGLE_MAPS_API_KEY"
    echo "   - GOOGLE_SHEET_ID"
    echo ""
else
    echo "✅ .env file exists"
fi

# Create client .env file if it doesn't exist
if [ ! -f client/.env ]; then
    echo "Creating client/.env file..."
    echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here" > client/.env
    echo "⚠️  Please edit client/.env file and add your Google Maps API key"
    echo ""
else
    echo "✅ client/.env file exists"
fi

# Check for Google credentials
if [ ! -f server/config/credentials.json ]; then
    echo "⚠️  Google Service Account credentials not found!"
    echo "   Please add credentials.json to server/config/"
    echo "   Follow the instructions in README.md"
    echo ""
else
    echo "✅ Google credentials found"
fi

echo ""
echo "========================================"
echo "           Setup Complete!              "
echo "========================================"
echo ""
echo "Next steps:"
echo "1. Configure your API keys in .env and client/.env"
echo "2. Add Google Service Account credentials to server/config/"
echo "3. Create and share a Google Sheet (see README.md)"
echo ""
echo "To start the application:"
echo "  Development: npm run dev-all"
echo "  Production: npm run build && npm start"
echo ""
echo "For detailed instructions, see README.md"
echo ""
echo "Happy coding! 🚀"
