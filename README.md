# Military Asset Management System JP

An enterprise-grade web application for tracking military assets (vehicles, weapons, ammunition) across multiple bases with Role-Based Access Control (RBAC) and comprehensive audit trails.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, Vite, Recharts, Lucide React, Axios |
| **Backend** | Node.js, Express.js, JavaScript ES6+ |
| **Database** | PostgreSQL + Prisma ORM |
| **Auth** | JWT + Bcrypt |

## Core Formula

```
Closing Balance = Opening Balance + Net Movement - Assigned - Expended
Net Movement = Purchases + Transfers In - Transfers Out
```

## User Roles

| Role | Access Level |
|------|-------------|
| **Admin** | Full system access, audit logs, user management |
| **Base Commander** | Base-scoped data, assignments, expenditures |
| **Logistics Officer** | Purchases, transfers |

<<<<<<< HEAD
##  Setup Instructions
=======
## 🏗️ Setup Instructions
>>>>>>> 17bb1ec (Initial commit / Update project)

### Prerequisites
- Node.js v18+
- PostgreSQL (running locally or remote)

### 1. Backend Setup

```bash
cd backend
npm install

# Create database (via psql or pgAdmin)
# CREATE DATABASE military_assets;

# Push schema to database
npx prisma db push

# Seed with demo data
node prisma/seed.js

# Start backend server
npm run dev
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Access the Application

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin123` |
| Base Commander | `commander_alpha` | `cmd123` |
| Logistics Officer | `logistics_officer` | `log123` |

## Project Structure

```
military-asset-management/
├── backend/
│   ├── config/db.js              # Prisma client singleton
│   ├── controllers/              # Business logic
│   │   ├── authController.js     # Login, register, profile
│   │   ├── assetController.js    # Dashboard metrics, inventory
│   │   ├── purchaseController.js # Purchase CRUD
│   │   ├── transferController.js # Atomic cross-base transfers
│   │   ├── assignmentController.js
│   │   └── expenditureController.js
│   ├── middlewares/
│   │   ├── authMiddleware.js     # JWT verification
│   │   ├── rbacMiddleware.js     # Role & base scoping
│   │   └── auditMiddleware.js    # Audit log helper
│   ├── routes/                   # Express route definitions
│   ├── prisma/
│   │   ├── schema.prisma         # Database schema
│   │   └── seed.js               # Demo data seeder
│   ├── .env                      # Environment variables
│   └── server.js                 # Express entry point
│
├── frontend/
│   └── src/
│       ├── components/           # Reusable UI components
│       ├── pages/                # Route pages
│       ├── context/AuthContext.jsx
│       ├── services/api.js       # Axios with JWT interceptor
│       ├── App.jsx               # Router configuration
│       └── index.css             # Design system
│
└── README.md
```

## API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/login` | Public |
| POST | `/api/auth/register` | Admin |
| GET | `/api/auth/me` | Authenticated |

### Assets & Dashboard
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/assets/dashboard` | Authenticated (base-scoped) |
| GET | `/api/assets/chart-data` | Authenticated (base-scoped) |
| GET | `/api/assets/inventory` | Authenticated (base-scoped) |
| GET | `/api/assets/bases` | Authenticated |
| GET | `/api/assets/equipment-types` | Authenticated |
| GET | `/api/assets/audit-logs` | Admin only |

### Purchases
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/purchases` | Admin, Logistics |
| GET | `/api/purchases` | Authenticated (base-scoped) |

### Transfers
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/transfers` | Admin, Logistics |
| GET | `/api/transfers` | Authenticated (base-scoped) |
| PATCH | `/api/transfers/:id/status` | Admin |

### Assignments & Expenditures
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/assignments` | Admin, Commander |
| GET | `/api/assignments` | Authenticated (base-scoped) |
| POST | `/api/expenditures` | Admin, Commander |
| GET | `/api/expenditures` | Authenticated (base-scoped) |
