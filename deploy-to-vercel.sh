#!/bin/bash

# ETG Fleet Management System - Vercel Deployment Script
# This script helps you deploy to Vercel

echo "🚀 ETG Fleet Management System - Vercel Deployment Script"
echo "============================================================"
echo ""

# Step 1: Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm i -g vercel
fi

echo "✅ Vercel CLI installed"
echo ""

# Step 2: Login to Vercel
echo "🔐 Logging into Vercel..."
vercel login
echo ""

# Step 3: Deploy to Vercel
echo "📦 Deploying to Vercel..."
vercel --prod --yes
echo ""

# Step 4: Set environment variables (requires manual input)
echo "⚙️  Setting up environment variables..."
echo ""
echo "Please provide the following environment variables:"
echo ""

# Database URL
read -p "Enter DATABASE_URL: " DATABASE_URL
echo ""

# NextAuth URL
read -p "Enter NEXTAUTH_URL (e.g., https://your-project.vercel.app): " NEXTAUTH_URL
echo ""

# NextAuth Secret
read -p "Enter NEXTAUTH_SECRET (or press Enter to generate): " NEXTAUTH_SECRET

if [ -z "$NEXTAUTH_SECRET" ]; then
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    echo "Generated NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
fi
echo ""

# Additional variables
NODE_ENV="production"
NEXT_PUBLIC_APP_URL=$NEXTAUTH_URL

# Save to .env.production
cat > .env.production <<EOF
DATABASE_URL="$DATABASE_URL"
NEXTAUTH_URL="$NEXTAUTH_URL"
NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
NODE_ENV="$NODE_ENV"
NEXT_PUBLIC_APP_URL="$NEXT_PUBLIC_APP_URL"
EOF

echo "✅ Environment variables saved to .env.production"
echo ""

# Step 5: Deploy with environment variables
echo "🚀 Deploying with new environment variables..."
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NODE_ENV production
vercel env add NEXT_PUBLIC_APP_URL production
echo ""

echo "🎉 Deployment complete!"
echo "Your site will be available at: https://your-project.vercel.app"
echo ""
echo "Next steps:"
echo "1. Run database migrations: bun run db:migrate deploy"
echo "2. Seed the database: bun run db:seed"
echo "3. Login with admin@etg.com / admin123"
