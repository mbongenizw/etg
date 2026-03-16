# Database Connection Guide

## Connection String
```
postgresql://neondb_owner:npg_JkiAXB53ZgVG@ep-ancient-forest-ai8b913y-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Methods to Connect

### 1. Using Bun Script (Recommended)
```bash
# Check database tables
bun run check-database.ts

# Check Prisma models
bun run check-prisma.ts
```

### 2. Install PostgreSQL Client Tools

#### Windows (PowerShell)
```powershell
# Download and install PostgreSQL
# Visit: https://www.postgresql.org/download/windows/
# Or use Chocolatey:
choco install postgresql
```

#### Windows (With Chocolatey)
```powershell
choco install postgresql pgadmin4
```

#### macOS
```bash
brew install postgresql
```

### 3. Using GUI Tools

#### DBeaver (Free & Cross-Platform)
1. Download: https://dbeaver.io/download/
2. Create new connection
3. Select PostgreSQL
4. Enter connection details:
   - Host: ep-ancient-forest-ai8b913y-pooler.c-4.us-east-1.aws.neon.tech
   - Port: 5432
   - Database: neondb
   - User: neondb_owner
   - Password: npg_JkiAXB53ZgVG
   - SSL: Require

#### pgAdmin (Official PostgreSQL Tool)
1. Download: https://www.pgadmin.org/download/
2. Connect using the same details

#### Neon Web Interface (Easiest)
1. Visit: https://console.neon.tech
2. Select your database
3. Use the built-in SQL editor
4. Run SQL queries directly

### 4. Using Command Line

#### Windows (if PostgreSQL installed)
```cmd
psql -h ep-ancient-forest-ai8b913y-pooler.c-4.us-east-1.aws.neon.tech -p 5432 -U neondb_owner -d neondb -c "\dt"
```

#### Windows (if PostgreSQL installed with password)
```cmd
psql -h ep-ancient-forest-ai8b913y-pooler.c-4.us-east-1.aws.neon.tech -p 5432 -U neondb_owner -d neondb -W
```

### 5. Using Node.js

#### Install dependencies
```bash
bun add pg
```

#### Connect via script
```javascript
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_JkiAXB53ZgVG@ep-ancient-forest-ai8b913y-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require'
});

async function query() {
  await client.connect();
  const result = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\'');
  console.log(result.rows);
  await client.end();
}

query();
```

### 6. Using Prisma Studio

```bash
# Generate Prisma Client
bun run db:generate

# Start Prisma Studio
bun run db:studio
```

### 7. Using Prisma CLI

```bash
# Check database status
bun run db:push

# Create migration
bun run db:migrate dev

# Deploy to production
bun run db:deploy
```

## Database Tables Overview

| Table | Purpose | Columns |
|-------|---------|---------|
| users | User accounts | 12 |
| drivers | Driver profiles | 19 |
| vehicles | Vehicle records | 19 |
| vehicle_checks | Check-in/out records | 18 |
| trips | Trip management | 16 |
| fuel_records | Fuel tracking | 11 |
| maintenance | Maintenance records | 13 |
| incidents | Incident reporting | 21 |
| reminders | Reminders & alerts | 16 |
| backup_history | Backup logs | 7 |
| backup_settings | Backup configuration | 8 |
| settings | App settings | 6 |
| role_permissions | Role-based access | 6 |
| sessions | User sessions | 5 |

## Security Notes

⚠️ **Never commit your database credentials** to version control

- Keep connection strings in `.env` files
- Use environment variables in production
- Rotate secrets regularly
- Enable SSL (already required in connection string)

## Troubleshooting

### Connection Refused
- Verify database is active in Neon console
- Check firewall settings
- Ensure SSL mode is enabled

### Authentication Failed
- Verify username and password
- Check database permissions
- Ensure user has proper access rights

### SSL Errors
- Use `sslmode=require` (already in connection string)
- If needed, upgrade to `sslmode=verify-full`

## Quick Commands

```bash
# View all tables
\dt

# View table structure
\d table_name

# Query data
SELECT * FROM table_name LIMIT 10;

# Exit psql
\q
```

## Support Resources

- **Neon Documentation**: https://neon.tech/docs
- **PostgreSQL Docs**: https://www.postgresql.org/docs/
- **Prisma Docs**: https://www.prisma.io/docs
- **DBeaver Help**: https://dbeaver.io/docs/
