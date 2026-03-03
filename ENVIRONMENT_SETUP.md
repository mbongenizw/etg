# Development vs Production Environment

This application is designed to run seamlessly in both development and production environments.

## 📋 Environment Setup

### Development Environment (.env.development)

```env
DATABASE_URL="postgresql://user:password@localhost:5432/etg_dev"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-development-secret"
NODE_ENV="development"
```

### Production Environment (.env.production)

```env
DATABASE_URL="postgresql://user:password@host:port/etg_prod"
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-production-secret"
NODE_ENV="production"
```

## 🔧 Configuration Differences

### Database Configuration

| Feature | Development | Production |
|---------|-------------|------------|
| Database Log Level | Query logging enabled | Error/Warn only |
| Initial Admin User | ✅ Auto-created | ❌ Not created (manual setup) |
| Database URL | Local PostgreSQL | Cloud PostgreSQL |
| Auto-initialization | Yes | No |

### Build Configuration

| Feature | Development | Production |
|---------|-------------|------------|
| Standalone Output | ❌ Disabled | ✅ Enabled |
| TypeScript Errors | ❌ Ignored | ✅ Checked |
| React Strict Mode | Disabled | Disabled |
| Static Generation | ✅ All pages | ✅ All pages |

### API Routes

| Feature | Development | Production |
|---------|-------------|------------|
| Function Timeout | ✅ 60 seconds | ✅ 60 seconds |
| CORS | N/A | ✅ Configured |
| Rate Limiting | ✅ Applied | ✅ Applied |

## 🚀 Running in Different Environments

### Development Mode

```bash
# Install dependencies
bun install

# Copy example environment file
cp .env.example .env.development

# Start development server
bun run dev

# Server will start on http://localhost:3000
```

**Features:**
- Hot reload enabled
- Query logging for debugging
- Auto-creates default admin user
- Type checking errors are ignored (for faster builds)

### Production Mode

```bash
# Build for production
bun run build

# Start production server
bun run start

# Server will start on port 3000
```

**Features:**
- Optimized build
- Error/Warn database logging only
- No auto-initialization (manual admin setup)
- Full type checking
- Standalone output for Vercel deployment

## 🔄 Migration Between Environments

### 1. Development → Production Checklist

- [ ] Update `DATABASE_URL` to production PostgreSQL
- [ ] Update `NEXTAUTH_URL` to production domain
- [ ] Update `NEXTAUTH_SECRET` to production secret
- [ ] Set `NODE_ENV` to "production"
- [ ] Run `bun run db:deploy` to run migrations
- [ ] Manually create admin user (if needed)
- [ ] Test all features

### 2. Production → Development Checklist

- [ ] Set `NODE_ENV` to "development"
- [ ] Update `DATABASE_URL` to local PostgreSQL
- [ ] Update `NEXTAUTH_URL` to "http://localhost:3000"
- [ ] Run `bun run db:push` to update schema
- [ ] Reset database if needed: `bun run db:reset`
- [ ] Test all features

## 🗄️ Database Initialization

### Development

When you run `bun run dev`, the system will:
1. Connect to local database
2. Check if admin user exists
3. If no users exist, create:
   - Default admin user (admin@etg.com / admin123)
   - Default company settings

### Production

In production, the system will:
1. Connect to production database
2. Skip admin user creation
3. Skip default settings creation
4. You must manually create the admin user and settings

**Manual Admin Setup (Production):**
```typescript
// Run this in Vercel Console
bun run db:seed
```

## 🔒 Security Best Practices

### Development
- Use simple passwords for testing
- Disable strict security checks for faster iteration
- Use local database for development

### Production
- Use strong, random secrets for authentication
- Enable all security checks
- Use cloud PostgreSQL (Neon, Supabase, Vercel Postgres)
- Implement proper backup strategy

## 📊 Performance Comparison

| Metric | Development | Production |
|--------|-------------|------------|
| Build Time | ~30-60 seconds | ~5-10 minutes |
| Cold Start | ~2-3 seconds | ~1-2 seconds |
| Memory Usage | ~150-200MB | ~300-500MB |
| Query Performance | Slower (logging overhead) | Optimized |

## 🐛 Troubleshooting

### Development Issues

**Database connection failed:**
```bash
# Ensure PostgreSQL is running
bun run db:generate
bun run db:push
```

**TypeScript errors:**
```bash
# Ignore build errors in development
# This is intentional for faster iteration
```

### Production Issues

**Build failures:**
```bash
# Clear cache and rebuild
rm -rf .next
bun install
bun run build
```

**Database connection timeout:**
- Verify DATABASE_URL is correct
- Check firewall rules
- Ensure PostgreSQL is running

## 🔄 Environment Variables Reference

| Variable | Dev Value | Prod Value | Required |
|----------|-----------|------------|----------|
| `DATABASE_URL` | Local PostgreSQL | Cloud PostgreSQL | Yes |
| `NEXTAUTH_URL` | `http://localhost:3000` | Production URL | Yes |
| `NEXTAUTH_SECRET` | Random dev secret | Random prod secret | Yes |
| `NODE_ENV` | `development` | `production` | Yes |

## ✅ Validation Commands

### Development Validation
```bash
# Check dependencies
bun install

# Check environment
cat .env.development

# Start server
bun run dev
```

### Production Validation
```bash
# Check dependencies
bun install

# Check environment
cat .env.production

# Build
bun run build

# Test build
bun run start
```

## 📞 Support

For environment-specific issues:
- Check console logs in development
- Check Vercel logs in production
- Review this guide for common issues
