#!/bin/bash

# Supabase Setup Script for Sales Route Collector
# This script sets up the Supabase database using the migration file

set -e

echo "🚀 Setting up Supabase Database for Sales Route Collector"
echo "=========================================================="
echo ""

# Check if environment variables are set
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: SUPABASE_URL and SUPABASE_ANON_KEY must be set"
    echo ""
    echo "Please set them in your environment:"
    echo "  export SUPABASE_URL='https://your-project.supabase.co'"
    echo "  export SUPABASE_ANON_KEY='your-anon-key'"
    echo ""
    echo "Or create a .env file with these values"
    exit 1
fi

echo "✅ Environment variables found"
echo "   SUPABASE_URL: $SUPABASE_URL"
echo ""

# Read the migration SQL file
MIGRATION_FILE="supabase/migrations/20250101000000_create_shops_table.sql"

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Error: Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "📄 Migration file found: $MIGRATION_FILE"
echo ""
echo "⚠️  IMPORTANT: You need to run this SQL manually in Supabase Dashboard"
echo ""
echo "Steps:"
echo "1. Go to: https://supabase.com/dashboard"
echo "2. Select your project"
echo "3. Click 'SQL Editor' in the left sidebar"
echo "4. Click 'New query'"
echo "5. Copy and paste the SQL from: $MIGRATION_FILE"
echo "6. Click 'Run' (or press Ctrl+Enter)"
echo ""
echo "Alternatively, if you have Supabase CLI linked:"
echo "  supabase db push"
echo ""
echo "=========================================================="
echo "SQL to execute:"
echo "=========================================================="
cat "$MIGRATION_FILE"
echo ""
echo "=========================================================="
echo ""
echo "After running the SQL, your database will have:"
echo "  ✅ shops table with all required columns"
echo "  ✅ Indexes for better performance"
echo "  ✅ Row Level Security (RLS) policies"
echo "  ✅ Auto-updating timestamps"
echo ""
echo "Done! 🎉"
