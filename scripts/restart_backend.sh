#!/bin/bash

# Backend restart/refresh script for Habit Tracker
# Since we use Supabase (cloud-hosted), this script helps with:
# - Clearing local auth cache
# - Checking Supabase connection
# - Refreshing environment variables

echo "🔄 Backend Refresh Script"
echo "========================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "   Please create a .env file with your Supabase credentials."
    exit 1
fi

# Source environment variables
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
    echo "✅ Loaded environment variables"
fi

# Check if Supabase URL and key are set
if [ -z "$VITE_SUPABASE_URL" ] || [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
    echo "❌ Error: Supabase environment variables not set!"
    echo "   VITE_SUPABASE_URL: ${VITE_SUPABASE_URL:-'NOT SET'}"
    echo "   VITE_SUPABASE_ANON_KEY: ${VITE_SUPABASE_ANON_KEY:-'NOT SET'}"
    exit 1
fi

echo "✅ Supabase URL: $VITE_SUPABASE_URL"
echo "✅ Supabase Key: ${VITE_SUPABASE_ANON_KEY:0:20}..."
echo ""

# Clear browser local storage (if using a headless browser, this won't work)
# But we can provide instructions
echo "📝 To clear browser cache/storage:"
echo "   1. Open browser DevTools (F12)"
echo "   2. Go to Application tab"
echo "   3. Clear 'Local Storage' and 'Session Storage'"
echo "   4. Refresh the page"
echo ""

# Check Supabase connection (basic check)
echo "🔍 Checking Supabase connection..."
if curl -s -o /dev/null -w "%{http_code}" "$VITE_SUPABASE_URL/rest/v1/" | grep -q "200\|401\|403"; then
    echo "✅ Supabase is reachable"
else
    echo "⚠️  Warning: Could not reach Supabase (this might be normal)"
    echo "   Make sure your Supabase project is active"
fi

echo ""
echo "✨ Backend refresh complete!"
echo ""
echo "💡 Note: Supabase is cloud-hosted, so there's no local server to restart."
echo "   If you need to restart Supabase services, use the Supabase Dashboard."
echo "   For local Supabase development, use: supabase start"


