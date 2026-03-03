@echo off
chcp 65001 >nul

REM Vercel Deployment Helper Script (Windows)
REM This script helps prepare the application for Vercel deployment

echo 🚀 ETG Fleet Management - Vercel Deployment Helper

REM Check if node_modules exists
if not exist "node_modules\" (
    echo 📦 Installing dependencies...
    call bun install
) else (
    echo ✅ Dependencies already installed
)

REM Generate Prisma Client
echo 🔧 Generating Prisma Client...
call bun run db:generate

REM Check if .env exists
if not exist ".env" (
    echo ⚠️  .env file not found!
    echo 📝 Please create .env file with required variables:
    echo    - DATABASE_URL: PostgreSQL connection string
    echo    - NEXTAUTH_URL: Your application URL
    echo    - NEXTAUTH_SECRET: A secure random string
    echo    - NODE_ENV: production
    exit /b 1
)

echo ✅ Environment configuration check passed

REM Build the application
echo 🔨 Building application...
call bun run build

if %ERRORLEVEL% EQU 0 (
    echo ✅ Build completed successfully
    echo.
    echo 🎉 Your application is ready for Vercel deployment!
    echo.
    echo Next steps:
    echo 1. Go to Vercel dashboard
    echo 2. Import this repository
    echo 3. Add environment variables
    echo 4. Deploy
) else (
    echo ❌ Build failed
    exit /b 1
)
