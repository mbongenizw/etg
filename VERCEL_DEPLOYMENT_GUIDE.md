# Vercel Deployment Guide for ETG Fleet Management System

## Prerequisites
- Git repository set up
- Vercel account
- PostgreSQL database (Neon, Supabase, or Vercel Postgres)

## Step 1: Create a PostgreSQL Database

### Using Neon (Recommended - Free)
1. Go to [https://neon.tech](https://neon.tech) and sign up
2. Click "New Project"
3. Give it a name (e.g., "etg-fleet")
4. Copy the connection string from the dashboard

**Connection string format:**
```
postgresql://user:password@host:5432/database?sslmode=require
```

### Using Supabase
1. Go to [https://supabase.com](https://supabase.com) and sign up
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string from the "Connection string" dropdown

### Using Vercel Postgres
1. Create a new Vercel project
2. Go to Storage > Create Database
3. Select Vercel Postgres
4. Vercel will create and configure the database

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Easiest)
1. Go to [https://vercel.com](https://vercel.com) and sign in
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Keep default settings, click "Deploy"
5. Wait for deployment to complete

### Option B: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

## Step 3: Configure Environment Variables

After deployment, add these environment variables in your Vercel project settings:

### Required Variables

**Database Variables:**
```bash
DATABASE_URL="postgresql://your-user:your-password@your-host:5432/your-database?sslmode=require"
```

**NextAuth Variables:**
```bash
NEXTAUTH_URL="https://your-project.vercel.app"
NEXTAUTH_SECRET="generate-a-secure-secret"
```

**Application Variables:**
```bash
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-project.vercel.app"
```

### How to Generate NEXTAUTH_SECRET:
```bash
openssl rand -base64 32
```

## Step 4: Run Database Migrations

After deploying and setting environment variables, run these commands in your Vercel console:

```bash
# Install dependencies
bun install

# Generate Prisma Client
bun run db:generate

# Run migrations
bun run db:migrate deploy

# Seed the database (optional - creates default admin user)
bun run db:seed
```

## Step 5: Access Your Deployed Application

1. Go to your project in Vercel dashboard
2. The URL will be: `https://your-project-name.vercel.app`
3. Login with default credentials:
   - Email: `admin@etg.com`
   - Password: `admin123`

## Database Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | PostgreSQL connection string | `postgresql://neondb_owner:password@ep-patient-sun-aivrzyoa-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require` |
| `NEXTAUTH_URL` | Yes | Your Vercel URL | `https://etg-fleet.vercel.app` |
| `NEXTAUTH_SECRET` | Yes | Session secret key | `openssl rand -base64 32` |
| `NODE_ENV` | No | Environment mode | `production` |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL | `https://etg-fleet.vercel.app` |

## Troubleshooting

### Build Errors
- Ensure all dependencies are listed in package.json
- Check TypeScript errors in the terminal

### Database Connection Errors
- Verify DATABASE_URL is correct
- Ensure PostgreSQL database is accessible
- Check SSL mode (use `sslmode=require` for Neon)

### Environment Variables
- Variables must be added via Vercel dashboard
- Changes require redeployment
- Don't commit .env files to Git

### Database Migrations
- Run migrations after deployment
- Check Prisma schema in `prisma/schema.prisma`
- Ensure database provider is set to PostgreSQL

## Additional Resources

- [Vercel Deployment Docs](https://vercel.com/docs/deployments)
- [Prisma PostgreSQL Setup](https://www.prisma.io/docs/guides/database/postgresql)
- [NextAuth Configuration](https://next-auth.js.org/configuration/options)

## Support

If you encounter issues:
1. Check Vercel deployment logs
2. Verify database connection string
3. Ensure all environment variables are set
4. Run migrations again
