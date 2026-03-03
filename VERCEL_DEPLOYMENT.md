# ETG Fleet Management System - Vercel Deployment Guide

## Prerequisites

- GitHub repository: https://github.com/mbongenizw/etg.git
- Vercel account

## Deployment Steps

### 1. Install Vercel CLI (Optional)
```bash
npm i -g vercel
```

### 2. Deploy to Vercel

#### Option A: Via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your repository: https://github.com/mbongenizw/etg.git
4. Keep default settings, click "Deploy"
5. Wait for deployment to complete

#### Option B: Via Vercel CLI
```bash
vercel login
vercel --prod
```

### 3. Configure Environment Variables

After deployment, add these environment variables in Vercel dashboard:

**Database Variables:**
- `DATABASE_URL`: PostgreSQL connection string
  - Create a new PostgreSQL database on Neon, Supabase, or Vercel Postgres
  - Format: `postgresql://user:password@host:port/database`

**NextAuth Variables:**
- `NEXTAUTH_URL`: Your Vercel URL (e.g., https://etg.vercel.app)
- `NEXTAUTH_SECRET`: Generate a secure secret (use: `openssl rand -base64 32`)

**Other Variables:**
- `NODE_ENV`: production

### 4. Database Migration

After deploying, run these commands in the Vercel Console:

```bash
# Install dependencies
bun install

# Generate Prisma Client
bun run db:generate

# Run migrations to create tables
bun run db:migrate deploy

# Seed the database (optional)
bun run db:seed
```

### 5. Update Prisma Schema (For Production)

Update `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

## Database Options for Vercel

1. **Neon PostgreSQL**: Free tier available, no server required
   - https://neon.tech
   - Get connection string from dashboard

2. **Supabase**: Free tier available
   - https://supabase.com
   - Get connection string from dashboard

3. **Vercel Postgres**: Built into Vercel
   - Connect in Vercel dashboard under Storage

## Custom Domain (Optional)

1. Go to Vercel project settings
2. Add custom domain in "Domains" section
3. Configure DNS records with your domain provider

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `NEXTAUTH_URL` | Yes | Application URL | `https://etg.vercel.app` |
| `NEXTAUTH_SECRET` | Yes | Session secret | `openssl rand -base64 32` |
| `NODE_ENV` | No | Environment mode | `production` |

## Troubleshooting

### Build Errors
- Ensure all dependencies are properly installed
- Check TypeScript errors in the terminal

### Database Connection Errors
- Verify DATABASE_URL is correct
- Ensure PostgreSQL database is accessible
- Check firewall rules if using custom PostgreSQL

### Environment Variables
- Variables must be added via Vercel dashboard
- Changes require redeployment

## Support

- Repository: https://github.com/mbongenizw/etg.git
- Vercel Docs: https://vercel.com/docs
