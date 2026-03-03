# ETG Fleet Management System - Local Setup & Vercel Deployment

## 🎯 What's Been Fixed

### Local Development Issues Resolved:
1. ✅ **Database Configuration**: Switched from PostgreSQL to SQLite for local development
2. ✅ **Login System**: Fixed authentication with default admin credentials
3. ✅ **TypeScript Errors**: Fixed type issues in API routes
4. ✅ **Prisma Client**: Regenerated and configured correctly
5. ✅ **Environment Variables**: Fixed loading issues

### Default Login Credentials:
- **Email**: `admin@etg.com`
- **Password**: `admin123`

## 🚀 Quick Start - Local Development

```bash
# Install dependencies
bun install

# Generate Prisma Client
bun run db:generate

# Push database schema
bun run db:push

# Start development server
bun run dev

# Access application at http://localhost:3000
```

## ☁️ Deployment to Vercel

### Option 1: Dashboard (Recommended for beginners)
1. Go to [Vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Keep default settings, click "Deploy"
4. Wait for deployment to complete

### Option 2: CLI (For power users)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

## 📊 Required Environment Variables (Vercel)

After deployment, add these in Vercel dashboard:

### 1. Database Variables (Required)
```bash
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### 2. NextAuth Variables (Required)
```bash
NEXTAUTH_URL="https://your-project.vercel.app"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
```

### 3. Application Variables
```bash
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-project.vercel.app"
```

## 🔧 Database Setup for Production

### Step 1: Create PostgreSQL Database
Choose one:
- **Neon** (Free, easiest): https://neon.tech
- **Supabase** (Free): https://supabase.com
- **Vercel Postgres**: Built into Vercel

### Step 2: Get Connection String
From Neon:
1. Go to Dashboard > Projects
2. Copy connection string from "Connection string" dropdown

### Step 3: Update Environment Variables in Vercel
Add `DATABASE_URL` to your Vercel project environment variables

### Step 4: Run Migrations
```bash
# SSH into Vercel console or use Vercel CLI
bun run db:generate
bun run db:migrate deploy
bun run db:seed
```

## 📁 Project Structure

```
workspace-ETG/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React components
│   ├── lib/                 # Utilities & database
│   ├── contexts/            # React contexts
│   └── hooks/               # Custom hooks
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeder
├── public/                  # Static assets
├── package.json            # Dependencies
├── next.config.ts          # Next.js config
├── vercel.json             # Vercel config
└── .env                    # Local environment variables
```

## 🗄️ Database Models

- **Users**: Admin, Manager, User, Driver roles
- **Vehicles**: Full vehicle tracking and management
- **Drivers**: Driver profiles and permissions
- **Trips**: Trip tracking and management
- **Maintenance**: Maintenance records and scheduling
- **Fuel Records**: Fuel tracking and management
- **Incidents**: Incident reporting and tracking
- **Reminders**: Automated reminders for important events
- **Vehicle Checks**: Check-in/out tracking
- **Settings**: System configuration
- **Backup Settings**: Automated backup configuration

## 🔐 Security Features

- Password hashing with bcrypt
- Session management with JWT tokens
- Secure cookie settings
- Environment-based configuration
- Input validation

## 🌐 Features

- 📊 Dashboard with analytics
- 🚗 Vehicle management
- 👥 Driver management
- 📝 Trip tracking
- 🔧 Maintenance scheduling
- ⛽ Fuel tracking
- 📋 Reports and analytics
- 🔔 Notifications
- 🔒 Role-based access control
- 📱 Responsive design
- 🌍 Multi-language support

## 🐛 Troubleshooting

### Build Errors
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `bun install`
- Check TypeScript errors in terminal

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check PostgreSQL database is running
- Ensure SSL mode is set to `require`
- Verify firewall allows connections

### Login Issues
- Clear browser cookies
- Check console for errors
- Verify database has users
- Check `NEXTAUTH_SECRET` is set

### Environment Variables
- Add variables via Vercel dashboard
- Restart deployment after changes
- Don't commit `.env` files to Git

## 📞 Support

- **Documentation**: See `VERCEL_DEPLOYMENT_GUIDE.md`
- **Deployment Guide**: See `VERCEL_DEPLOYMENT_GUIDE.md`
- **Vercel Docs**: https://vercel.com/docs

## 📝 Next Steps

1. ✅ Run locally to test
2. ✅ Create PostgreSQL database
3. ✅ Deploy to Vercel
4. ✅ Set environment variables
5. ✅ Run database migrations
6. ✅ Seed database
7. ✅ Test login and features

---

**Last Updated**: March 2026
**Version**: 0.2.0
