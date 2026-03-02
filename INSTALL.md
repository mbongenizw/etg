# ETG Agri Inputs - Fleet Management System

A comprehensive fleet and vehicle management system for ETG Agri Inputs.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [Default Login Credentials](#default-login-credentials)
- [Features](#features)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Troubleshooting](#troubleshooting)

## Prerequisites

Before installing the application, ensure you have the following installed:

| Software | Version | Required |
|----------|---------|----------|
| Node.js | 18.x or higher | Yes |
| Bun | 1.x or higher | Yes |
| Git | Latest | Yes |

### Installing Bun

If you don't have Bun installed, run:

```bash
# macOS/Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1 | iex"
```

## Installation

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd my-project
```

### Step 2: Install Dependencies

```bash
bun install
```

### Step 3: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Database
DATABASE_URL="file:./dev.db"

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 4: Initialize the Database

```bash
# Generate Prisma client
bun run db:generate

# Push database schema
bun run db:push
```

### Step 5: Seed Initial Data (Optional)

The application will automatically create a default admin user on first run. You can also manually seed data:

```bash
# Via API endpoint (after starting the server)
curl -X POST http://localhost:3000/api/seed
```

## Running the Application

### Development Mode

```bash
bun run dev
```

The application will be available at `http://localhost:3000`

### Production Build

```bash
# Build the application
bun run build

# Start production server
bun run start
```

### Other Commands

```bash
# Run linting
bun run lint

# Open Prisma Studio (database GUI)
bun run db:studio
```

## Default Login Credentials

After installation, use these credentials to log in:

| Field | Value |
|-------|-------|
| Email | `admin@etg.com` |
| Password | `admin123` |

> ⚠️ **Important**: Change the default password immediately after first login!

## Features

### Core Modules

| Module | Description |
|--------|-------------|
| **Dashboard** | Overview statistics and quick actions |
| **Vehicles** | Manage fleet vehicles with full CRUD operations |
| **Drivers** | Driver management with vehicle assignment |
| **Check Out/In** | Vehicle check-out and check-in workflow |
| **Service & Maintenance** | Track services and maintenance records |
| **Fuel Management** | Fuel consumption tracking and records |
| **Incidents** | Report and manage accidents/breakdowns |
| **Reminders** | Scheduled reminders and alerts |
| **Reports** | Generate and export reports |
| **User Management** | Admin-only user administration |

### User Roles

| Role | Permissions |
|------|-------------|
| **Admin** | Full system access, manage all users, all modules |
| **Manager** | Manage vehicles, drivers, view reports, approve requests |
| **User** | View vehicles/drivers, create trip requests, basic reporting |
| **Driver** | View assigned vehicle, check in/out, report incidents |

### Key Features

- ✅ Profile picture upload
- ✅ Real-time notifications
- ✅ Network status detection
- ✅ Offline mode support
- ✅ Responsive design
- ✅ Dark/Light mode ready
- ✅ Export to CSV
- ✅ Search and filtering
- ✅ Pagination

## Project Structure

```
my-project/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── dev.db             # SQLite database
├── public/
│   ├── logo.png           # ETG logo
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── api/           # API routes
│   │   ├── login/         # Login page
│   │   ├── offline/       # Offline page
│   │   ├── error.tsx      # Error boundary
│   │   ├── global-error.tsx
│   │   ├── layout.tsx     # Root layout
│   │   └── page.tsx       # Main page
│   ├── components/
│   │   ├── layout/        # Layout components
│   │   ├── modules/       # Feature modules
│   │   └── ui/            # UI components (shadcn)
│   ├── contexts/          # React contexts
│   ├── lib/               # Utilities
│   ├── stores/            # Zustand stores
│   └── types/             # TypeScript types
├── .env                   # Environment variables
├── package.json
└── README.md
```

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| GET | `/api/auth/me` | Get current user |

### Vehicles

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | List all vehicles |
| POST | `/api/vehicles` | Create vehicle |
| GET | `/api/vehicles/:id` | Get vehicle details |
| PUT | `/api/vehicles/:id` | Update vehicle |
| DELETE | `/api/vehicles/:id` | Delete vehicle |

### Drivers

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drivers` | List all drivers |
| POST | `/api/drivers` | Create driver |
| GET | `/api/drivers/:id` | Get driver details |
| PUT | `/api/drivers/:id` | Update driver |
| DELETE | `/api/drivers/:id` | Delete driver |

### Maintenance

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/maintenance` | List maintenance records |
| POST | `/api/maintenance` | Create record |
| PUT | `/api/maintenance/:id` | Update record |
| DELETE | `/api/maintenance/:id` | Delete record |

### Fuel Records

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/fuel` | List fuel records |
| POST | `/api/fuel` | Create record |
| PUT | `/api/fuel/:id` | Update record |
| DELETE | `/api/fuel/:id` | Delete record |

### Trips

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | List trips |
| POST | `/api/trips` | Create trip |
| PUT | `/api/trips/:id` | Update trip |
| DELETE | `/api/trips/:id` | Delete trip |

### Incidents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/incidents` | List incidents |
| POST | `/api/incidents` | Create incident |
| PUT | `/api/incidents/:id` | Update incident |
| DELETE | `/api/incidents/:id` | Delete incident |

### Users (Admin Only)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | List users |
| POST | `/api/users` | Create user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Notifications

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notification counts |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Get dashboard statistics |

## Troubleshooting

### Database Issues

```bash
# Reset database
bun run db:push --force-reset

# Regenerate Prisma client
bun run db:generate
```

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>
```

### Clear Next.js Cache

```bash
# Delete .next folder
rm -rf .next

# Restart development server
bun run dev
```

### Node Modules Issues

```bash
# Remove and reinstall
rm -rf node_modules
bun install
```

### Prisma Studio Connection Issues

```bash
# Ensure database exists
bun run db:push

# Then open studio
bun run db:studio
```

## Technology Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 4 |
| UI Components | shadcn/ui |
| Database | SQLite (Prisma ORM) |
| State Management | Zustand |
| Icons | Lucide React |
| Notifications | Sonner |
| Charts | Recharts |
| Authentication | Custom (bcryptjs) |

## License

© 2026 ETG Agri Inputs. All rights reserved.

## Support

For technical support, contact the IT department.

---

**Developer**: Tinotenda  
**Version**: 1.0.0
