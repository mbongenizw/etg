# Quick Reference: Dev vs Production

## 🚀 Quick Start Commands

### Development
```bash
# Setup
bun install

# Configure (if needed)
cp .env.example .env.development

# Run
bun run dev
```

### Production
```bash
# Setup
bun install

# Configure (if needed)
cp .env.example .env.production

# Build
bun run build

# Run
bun run start
```

## 📋 Environment Variables Required

| Variable | Development | Production | Example |
|----------|-------------|------------|---------|
| `DATABASE_URL` | Local PostgreSQL | Cloud PostgreSQL | `postgresql://...` |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://app.vercel.app` | Your URL |
| `NEXTAUTH_SECRET` | Random string | Random string | `abc123...` |
| `NODE_ENV` | `development` | `production` | `development` |

## 🔍 Verification

### Run Configuration Checker
```bash
# Linux/Mac
./check-env.sh

# Windows
check-env.bat
```

## 🗄️ Database Operations

### Development
```bash
# Create database schema
bun run db:push

# Reset database (destroy all data)
bun run db:reset

# Seed with initial data
bun run db:seed
```

### Production
```bash
# Run migrations
bun run db:deploy

# Seed with initial data
bun run db:seed
```

## 🚢 Deployment

### Vercel (Recommended)
1. Import repository: https://github.com/mbongenizw/etg.git
2. Add environment variables in dashboard
3. Deploy

### Local
```bash
# Build for production
bun run build

# Start production server
bun run start
```

## 🔐 Authentication

### Default Admin (Development Only)
- Email: `admin@etg.com`
- Password: `admin123`

### Production
- Must manually create admin user
- Use `bun run db:seed`

## 📊 Key Differences

| Aspect | Development | Production |
|--------|-------------|------------|
| DB Logs | All queries | Errors only |
| Admin Auto-create | ✅ Yes | ❌ No |
| Build Speed | Slower | Faster |
| Type Checks | Ignored | Strict |
| Database | Local | Cloud |

## 🐛 Troubleshooting

### Database Connection Failed
```bash
# Development
bun run db:push

# Production
bun run db:deploy
```

### Build Errors
```bash
# Clean and rebuild
rm -rf .next node_modules
bun install
bun run build
```

### Environment Issues
```bash
# Check environment
./check-env.sh
```

## 📞 Resources

- Deployment Guide: `VERCEL_DEPLOYMENT.md`
- Environment Setup: `ENVIRONMENT_SETUP.md`
- Deployment Checklist: `DEPLOYMENT_CHECKLIST.md`
