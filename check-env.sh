#!/bin/bash

# Environment Configuration Checker
# Checks if the application is properly configured for dev or production

echo "🔍 ETG Fleet Management - Environment Configuration Checker"
echo ""

# Check NODE_ENV
if [ -n "$NODE_ENV" ]; then
  echo "✅ NODE_ENV is set: $NODE_ENV"
else
  echo "⚠️  NODE_ENV is not set (will default to development)"
fi

# Check DATABASE_URL
if [ -n "$DATABASE_URL" ]; then
  echo "✅ DATABASE_URL is configured"

  # Check if it's a local database (dev) or remote (prod)
  if [[ "$DATABASE_URL" == *"localhost"* ]] || [[ "$DATABASE_URL" == *"127.0.0.1"* ]]; then
    echo "   → Local PostgreSQL detected (Development)"
  else
    echo "   → Remote PostgreSQL detected (Production)"
  fi
else
  echo "❌ DATABASE_URL is missing!"
  echo "   Please create .env file with DATABASE_URL"
  exit 1
fi

# Check NEXTAUTH_URL
if [ -n "$NEXTAUTH_URL" ]; then
  echo "✅ NEXTAUTH_URL is configured: $NEXTAUTH_URL"

  # Check if it's localhost (dev) or domain (prod)
  if [[ "$NEXTAUTH_URL" == *"localhost"* ]] || [[ "$NEXTAUTH_URL" == *"127.0.0.1"* ]]; then
    echo "   → Local URL (Development)"
  else
    echo "   → Production URL"
  fi
else
  echo "⚠️  NEXTAUTH_URL is not set"
fi

# Check NEXTAUTH_SECRET
if [ -n "$NEXTAUTH_SECRET" ]; then
  echo "✅ NEXTAUTH_SECRET is configured"
else
  echo "❌ NEXTAUTH_SECRET is missing!"
  echo "   Please generate one: openssl rand -base64 32"
  exit 1
fi

# Check Prisma Client
if [ -f "node_modules/.prisma/client/index.js" ]; then
  echo "✅ Prisma Client is installed"
else
  echo "⚠️  Prisma Client not found, run: bun run db:generate"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
  echo "✅ Dependencies are installed"
else
  echo "❌ Dependencies not found, run: bun install"
fi

echo ""
echo "🎉 Configuration check completed!"
echo ""

# Provide next steps based on environment
if [ "$NODE_ENV" == "production" ]; then
  echo "📋 Production Setup:"
  echo "   1. Ensure DATABASE_URL points to production PostgreSQL"
  echo "   2. Verify NEXTAUTH_URL is production URL"
  echo "   3. Run: bun run db:deploy"
  echo "   4. Optionally: bun run db:seed"
elif [ "$NODE_ENV" == "development" ]; then
  echo "📋 Development Setup:"
  echo "   1. Ensure PostgreSQL is running locally"
  echo "   2. Run: bun run db:push"
  echo "   3. Run: bun run dev"
else
  echo "📋 Setup:"
  echo "   1. Set NODE_ENV to 'development' or 'production'"
  echo "   2. Create .env file with all required variables"
  echo "   3. Run: bun run dev (development) or bun run start (production)"
fi
