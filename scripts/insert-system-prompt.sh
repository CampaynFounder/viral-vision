#!/bin/bash

# Script to insert system prompt into Supabase database
# This uses the API endpoint instead of direct database access

echo "📝 Inserting system prompt into database via API..."

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
  echo "❌ Error: Environment variables not set"
  echo "   Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY"
  exit 1
fi

# Get the app URL (default to localhost for local dev)
APP_URL="${NEXT_PUBLIC_APP_URL:-http://localhost:3000}"

# Read the system prompt from the route file
# For now, we'll use curl to call the API endpoint
# But first, let's create a simple Node script that can be run

echo "✅ Use the Node.js script instead:"
echo "   npx tsx scripts/insert-system-prompt.ts"
echo ""
echo "Or use the API endpoint directly:"
echo "   POST $APP_URL/api/system-prompt"
echo "   Body: { \"version\": \"v1.0\", \"prompt_text\": \"...\", \"is_active\": true }"

