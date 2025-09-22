#!/bin/bash

# VentureLink Backend Deployment Script
# This script applies database migrations and deploys Supabase Edge Functions.

# Exit immediately if a command exits with a non-zero status.
set -e

echo "🚀 Starting VentureLink backend deployment..."

# --- Check for required environment variables ---
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ] || [ -z "$SUPABASE_ACCESS_TOKEN" ]; then
  echo "❌ Error: SUPABASE_URL and SUPABASE_ACCESS_TOKEN must be set."
  echo "Hint: Run 'supabase login' and ensure your .env file is sourced."
  exit 1
fi

# --- 1. Apply Database Schema ---
echo "Applying database schema..."
supabase db push

echo "✅ Database schema applied successfully."

# --- 2. Deploy Edge Functions ---
echo "Deploying Edge Functions..."

# Deploy each function individually and print status
supabase functions deploy get-signed-upload-url --no-verify-jwt
echo "  - Deployed get-signed-upload-url"

supabase functions deploy process-upload-webhook --no-verify-jwt
echo "  - Deployed process-upload-webhook"

supabase functions deploy stripe-webhook --no-verify-jwt
echo "  - Deployed stripe-webhook"

echo "✅ All Edge Functions deployed successfully."

echo -e "\n\n🎉 Backend deployment complete!"
echo -e "\n\n⚠️  CRITICAL MANUAL STEP REQUIRED ⚠️"
echo "----------------------------------------------------------------"
echo "You MUST now manually apply the security policies and triggers."
echo "1. Go to the SQL Editor in your Supabase project dashboard."
echo "2. Copy the entire content of 'infra/triggers.sql' and run it."
echo "3. Copy the entire content of 'infra/rls_policies.sql' and run it."
echo "----------------------------------------------------------------"
echo "The application will not function correctly until this is done."
echo "----------------------------------------------------------------"
