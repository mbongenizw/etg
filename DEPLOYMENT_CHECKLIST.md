# ETG Fleet Management System - Deployment Checklist

## ✅ Pre-Deployment Checklist

- [x] Initialize git repository
- [x] Create GitHub repository
- [x] Push code to GitHub
- [x] Update next.config.ts for production
- [x] Create vercel.json configuration
- [x] Create .env.example template
- [x] Update package.json build scripts
- [x] Update Prisma schema to PostgreSQL
- [x] Create deployment documentation
- [x] Create deployment helper scripts

## 🚀 Deployment Steps

### Step 1: Create PostgreSQL Database
Choose one of these options:

**Option A: Neon (Recommended - Free)**
1. Go to https://neon.tech
2. Sign up and create a new project
3. Copy the connection string
4. Format: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`

**Option B: Vercel Postgres**
1. Go to your Vercel project
2. Navigate to Storage > Create Database
3. Follow the prompts to create PostgreSQL

**Option C: Supabase**
1. Go to https://supabase.com
2. Create a new project
3. Get connection string from Project Settings > Database

### Step 2: Configure Vercel Deployment

**Via Dashboard:**
1. Login to https://vercel.com
2. Click "Add New Project"
3. Import: https://github.com/mbongenizw/etg.git
4. Click "Deploy"
5. Wait for deployment to complete (2-5 minutes)

**Via CLI:**
```bash
npm i -g vercel
vercel login
vercel --prod
```

### Step 3: Add Environment Variables

In Vercel dashboard, go to your project settings:

**Required Variables:**
```
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-generated-secret
NODE_ENV=production
```

**Generate NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Step 4: Run Database Migration

After deployment, in Vercel Console:

```bash
bun install
bun run db:generate
bun run db:deploy
```

### Step 5: Seed Database (Optional)

If you want initial data:

```bash
bun run db:seed
```

## 📋 Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | PostgreSQL connection string | `postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb` |
| `NEXTAUTH_URL` | ✅ Yes | Application URL | `https://etg.vercel.app` |
| `NEXTAUTH_SECRET` | ✅ Yes | Session encryption key | `base64 encoded string` |
| `NODE_ENV` | No | Environment mode | `production` |

## 🌐 Custom Domain

1. Go to Vercel Project Settings > Domains
2. Add your domain (e.g., `etg.yourcompany.com`)
3. Add DNS records:
   - A record: `your-domain.com` → `76.76.21.21`
   - CNAME record: `www.your-domain.com` → `cname.vercel-dns.com`

## 🔍 Troubleshooting

### Build Failed
```bash
# Check dependencies
bun install

# Check TypeScript errors
bun run lint

# Clean and rebuild
rm -rf .next node_modules
bun install
bun run build
```

### Database Connection Errors
- Verify DATABASE_URL is correct
- Check PostgreSQL database is running
- Verify firewall allows connections
- Check connection string format

### Environment Variables Not Working
- Ensure variables are added in Vercel dashboard (not .env file)
- Redeploy after adding variables
- Check variable names match exactly

### Route Not Found
- Ensure `output: "standalone"` is set in next.config.ts
- Verify all API routes are properly structured

## 📊 Performance Optimization

- ✅ Static Generation for all pages
- ✅ Optimized images
- ✅ CDN for static assets
- ✅ Serverless functions for API routes
- ✅ Environment-based database connections

## 🔒 Security

- ✅ HTTPS enforced by Vercel
- ✅ Environment variables encrypted
- ✅ NextAuth authentication configured
- ✅ SQL injection protection via Prisma
- ✅ Rate limiting for API endpoints

## 📞 Support

- Repository: https://github.com/mbongenizw/etg.git
- Vercel Docs: https://vercel.com/docs
- Prisma Docs: https://www.prisma.io/docs

## 🎉 Deployment Complete

Your ETG Fleet Management System is now live on Vercel!

Access your application at: `https://your-app.vercel.app`
