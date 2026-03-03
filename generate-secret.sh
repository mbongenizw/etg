#!/bin/bash

# Generate secure NEXTAUTH_SECRET
# This generates a cryptographically secure random string for NextAuth

echo "🔐 Generating NEXTAUTH_SECRET..."

# Generate a random 32-byte base64 encoded string
SECRET=$(openssl rand -base64 32)

echo "✅ Generated Secret:"
echo ""
echo "NEXTAUTH_SECRET=\"$SECRET\""
echo ""
echo "📋 Copy this secret and add it to your .env file or Vercel environment variables:"
echo ""
echo "NEXTAUTH_URL=\"http://localhost:3000\""
echo "NEXTAUTH_SECRET=\"$SECRET\""
echo ""
