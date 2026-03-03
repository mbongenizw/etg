@echo off
chcp 65001 > nul
echo 🚀 ETG Fleet Management System - Vercel Deployment Script
echo ============================================================
echo.

REM Step 1: Check if Vercel CLI is installed
where vercel >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Vercel CLI not found. Installing...
    call npm i -g vercel
)

echo ✅ Vercel CLI installed
echo.

REM Step 2: Login to Vercel
echo 🔐 Logging into Vercel...
call vercel login
echo.

REM Step 3: Deploy to Vercel
echo 📦 Deploying to Vercel...
call vercel --prod --yes
echo.

echo 🎉 Deployment complete!
echo.
echo Next steps:
echo 1. Set environment variables in Vercel dashboard
echo 2. Run database migrations: bun run db:migrate deploy
echo 3. Seed the database: bun run db:seed
echo 4. Login with admin@etg.com / admin123
echo.
echo Visit your Vercel project settings to configure:
echo - DATABASE_URL (PostgreSQL connection string)
echo - NEXTAUTH_URL (https://your-project.vercel.app)
echo - NEXTAUTH_SECRET (generate with openssl)
echo.
pause
