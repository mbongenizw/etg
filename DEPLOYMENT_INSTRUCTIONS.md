# 🚀 Quick Deployment Instructions

## Step 1: Create PostgreSQL Database

Choose one option:

### Option A: Neon (Recommended - Free)
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string
4. Format: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`

### Option B: Vercel Postgres
1. Go to your Vercel dashboard
2. Navigate to Storage > Create Database
3. Create PostgreSQL database

### Option C: Supabase
1. Go to https://supabase.com
2. Create a new project
3. Get connection string from Project Settings > Database

## Step 2: Configure Local Environment

```bash
# Install dependencies
bun install

# Create environment file
cp .env.example .env.production

# Edit .env.production with:
# - DATABASE_URL: Your PostgreSQL connection string
# - NEXTAUTH_URL: https://your-app.vercel.app (or http://localhost:3000 for local)
# - NEXTAUTH_SECRET: Generate a secure random string
```

## Step 3: Generate NextAuth Secret

```bash
# Linux/Mac
openssl rand -base64 32

# Windows
openssl rand -base64 32
```

## Step 4: Build Application

```bash
# Build for production
bun run build

# Run migrations
bun run db:deploy
```

## Step 5: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com
2. Click "Add New Project"
3. Import repository: https://github.com/mbongenizw/etg.git
4. Configure settings:
   - Framework Preset: Next.js
   - Root Directory: . (current directory)
   - Build Command: `bun run build`
   - Output Directory: `.next`
   - Install Command: `bun install`
5. Click "Deploy"
6. Wait for deployment to complete (2-5 minutes)
7. Add environment variables in the deployment settings:
   - `DATABASE_URL` = your PostgreSQL connection string
   - `NEXTAUTH_URL` = https://your-app.vercel.app
   - `NEXTAUTH_SECRET` = the secret you generated
   - `NODE_ENV` = production
8. Redeploy after adding variables

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

## Step 6: Post-Deployment Configuration

### Add Environment Variables
In Vercel dashboard, go to:
1. Your project > Settings > Environment Variables
2. Add these variables:
   ```
   DATABASE_URL = your-cloud-postgresql-url
   NEXTAUTH_URL = https://your-app.vercel.app
   NEXTAUTH_SECRET = your-generated-secret
   NODE_ENV = production
   ```

### Run Database Migration
1. Go to your project on Vercel
2. Click "Console" or "Terminal"
3. Run:
   ```bash
   bun install
   bun run db:deploy
   ```

### Create Admin User (Optional)
```bash
# In Vercel Console
bun run db:seed
```

## Step 7: Configure Custom Domain (Optional)

1. Go to Vercel project settings
2. Click "Domains"
3. Add your domain (e.g., `etg.yourcompany.com`)
4. Add DNS records with your domain provider:
   - A record: `your-domain.com` → `76.76.21.21`
   - CNAME record: `www.your-domain.com` → `cname.vercel-dns.com`

## 🎯 Access Your Application

Once deployed, access your application at:
```
https://your-app.vercel.app
```

**Default Admin Credentials (if seeded):**
- Email: `admin@etg.com`
- Password: `admin123`

## ✅ Verification

After deployment:

1. **Check Environment Variables**:
   ```bash
   # In Vercel Console
   ./check-env.sh
   # or
   check-env.bat
   ```

2. **Test Login**:
   - Navigate to https://your-app.vercel.app
   - Login with admin credentials
   - Test all features

3. **Check Logs**:
   - Go to Vercel dashboard > Logs
   - Monitor for any errors

## 🐛 Troubleshooting

### Build Failed
```bash
# Clean and rebuild
rm -rf .next node_modules
bun install
bun run build
```

### Database Connection Error
- Verify DATABASE_URL is correct
- Check PostgreSQL is accessible
- Ensure database is created

### Environment Variables Not Working
- Variables must be added in Vercel dashboard
- Changes require redeployment
- Check variable names match exactly

### NextAuth Error
- Generate a new NEXTAUTH_SECRET
- Ensure NEXTAUTH_URL is production URL
- Clear browser cookies and try again

## 📊 Deployment Status

After deployment, you should see:

✅ Build completed successfully
✅ Database connected
✅ Environment variables set
✅ Application accessible

## 🎉 Deployment Complete!

Your ETG Fleet Management System is now live on Vercel!

**Resources:**
- Quick Reference: `QUICK_REFERENCE.md`
- Environment Setup: `ENVIRONMENT_SETUP.md`
- Deployment Guide: `VERCEL_DEPLOYMENT.md`
- Deployment Checklist: `DEPLOYMENT_CHECKLIST.md`

## 🔄 Next Steps

1. **Test all features** in production
2. **Set up monitoring** for alerts
3. **Configure custom domain** if needed
4. **Set up database backups**
5. **Configure notifications** for incidents and alerts

---

**Deployment Time**: 10-15 minutes
**Total Cost**: $0 (free tier) for Neon/Supabase

**Status**: Ready to deploy! 🚀
