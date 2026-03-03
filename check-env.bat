@echo off
chcp 65001 >nul

REM Environment Configuration Checker (Windows)
REM Checks if the application is properly configured for dev or production

echo 🔍 ETG Fleet Management - Environment Configuration Checker
echo.

REM Check NODE_ENV
if defined NODE_ENV (
    echo ✅ NODE_ENV is set: %NODE_ENV%
) else (
    echo ⚠️  NODE_ENV is not set (will default to development)
)

REM Check DATABASE_URL
if defined DATABASE_URL (
    echo ✅ DATABASE_URL is configured

    REM Check if it's a local database (dev) or remote (prod)
    echo %DATABASE_URL% | findstr /C:"localhost" >nul
    if %errorlevel% equ 0 (
        echo    → Local PostgreSQL detected ^(Development^)
    ) else (
        echo    → Remote PostgreSQL detected ^(Production^)
    )
) else (
    echo ❌ DATABASE_URL is missing!
    echo    Please create .env file with DATABASE_URL
    exit /b 1
)

REM Check NEXTAUTH_URL
if defined NEXTAUTH_URL (
    echo ✅ NEXTAUTH_URL is configured: %NEXTAUTH_URL%

    REM Check if it's localhost (dev) or domain (prod)
    echo %NEXTAUTH_URL% | findstr /C:"localhost" >nul
    if %errorlevel% equ 0 (
        echo    → Local URL ^(Development^)
    ) else (
        echo    → Production URL
    )
) else (
    echo ⚠️  NEXTAUTH_URL is not set
)

REM Check NEXTAUTH_SECRET
if defined NEXTAUTH_SECRET (
    echo ✅ NEXTAUTH_SECRET is configured
) else (
    echo ❌ NEXTAUTH_SECRET is missing!
    echo    Please generate one ^(run generate-secret.bat^)
    exit /b 1
)

REM Check Prisma Client
if exist "node_modules\.prisma\client\index.js" (
    echo ✅ Prisma Client is installed
) else (
    echo ⚠️  Prisma Client not found, run: bun run db:generate
)

REM Check if node_modules exists
if exist "node_modules" (
    echo ✅ Dependencies are installed
) else (
    echo ❌ Dependencies not found, run: bun install
)

echo.
echo 🎉 Configuration check completed!
echo.

REM Provide next steps based on environment
if "%NODE_ENV%"=="production" (
    echo 📋 Production Setup:
    echo    1. Ensure DATABASE_URL points to production PostgreSQL
    echo    2. Verify NEXTAUTH_URL is production URL
    echo    3. Run: bun run db:deploy
    echo    4. Optionally: bun run db:seed
) else if "%NODE_ENV%"=="development" (
    echo 📋 Development Setup:
    echo    1. Ensure PostgreSQL is running locally
    echo    2. Run: bun run db:push
    echo    3. Run: bun run dev
) else (
    echo 📋 Setup:
    echo    1. Set NODE_ENV to 'development' or 'production'
    echo    2. Create .env file with all required variables
    echo    3. Run: bun run dev ^(development^) or bun run start ^(production^)
)

pause
