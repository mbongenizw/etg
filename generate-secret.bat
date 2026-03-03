@echo off
chcp 65001 >nul

REM Generate secure NEXTAUTH_SECRET (Windows)
REM This generates a cryptographically secure random string for NextAuth

echo 🔐 Generating NEXTAUTH_SECRET...

REM Generate a random 32-byte base64 encoded string
for /f "delims=" %%i in ('openssl rand -base64 32') do set SECRET=%%i

echo ✅ Generated Secret:
echo.
echo NEXTAUTH_SECRET="%SECRET%"
echo.
echo 📋 Copy this secret and add it to your .env file or Vercel environment variables:
echo.
echo NEXTAUTH_URL="http://localhost:3000"
echo NEXTAUTH_SECRET="%SECRET%"
echo.
pause
