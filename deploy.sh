#!/bin/bash

# Vercel Deployment Helper Script
# This script helps prepare the application for Vercel deployment

echo "🚀 ETG Fleet Management - Vercel Deployment Helper"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    bun install
else
    echo "✅ Dependencies already installed"
fi

# Generate Prisma Client
echo "🔧 Generating Prisma Client..."
bun run db:generate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found!"
    echo "📝 Please create .env file with required variables:"
    echo "   - DATABASE_URL: PostgreSQL connection string"
    echo "   - NEXTAUTH_URL: Your application URL"
    echo "   - NEXTAUTH_SECRET: A secure random string"
    echo "   - NODE_ENV: production"
    exit 1
fi

echo "✅ Environment configuration check passed"

# Build the application
echo "🔨 Building application..."
bun run build

if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully"
    echo ""
    echo "🎉 Your application is ready for Vercel deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Go to Vercel dashboard"
    echo "2. Import this repository"
    echo "3. Add environment variables"
    echo "4. Deploy"
else
    echo "❌ Build failed"
    exit 1
fi
