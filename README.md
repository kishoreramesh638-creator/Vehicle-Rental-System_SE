# 🚗 DriveEase — Full-Stack Vehicle Rental System

A complete, enterprise-grade Vehicle Rental Web Application built from scratch with **React 18**, **Tailwind CSS**, **Node.js/Express**, and support for **Supabase (PostgreSQL)**, **MySQL**, and zero-config local relational database engines.

Ready for production deployment on **Vercel** with full **GitHub** version control integration.

---

## 🌟 Key Features

### 👤 Customer Experience
- **Authentication**: Secure registration, login with JWT tokens, password hashing with `bcryptjs`.
- **Fleet Catalog & Search**: Real-time filtering by category (SUV, Sedan, Hatchback, Bike, Luxury), transmission, fuel type, seating capacity, price range, and city hubs (Mumbai, Bengaluru, Delhi NCR, Pune).
- **Live Availability Engine**: True database-driven overlap checking (`pickup_date < ? AND return_date > ?`) to guarantee zero double bookings.
- **Dynamic Price Engine**: Transparent backend-calculated pricing (`days × daily_rate + security_deposit`). Frontend cannot tamper with prices.
- **Reservation Workflow**: Instant booking creation with unique references (e.g., `VR-2026-952974`).
- **Simulated Payment Gateway**: Choice of **UPI**, **Credit/Debit Card**, and **Cash on Pickup** with instant simulated receipt generation.
- **Booking Management**: Customer dashboard to monitor active journeys, upcoming trips, rental history, and cancellation with confirmation dialogs.
- **Profile & Security**: Update contact info and change password with verification.

### 🛡️ Administrator Operations
- **Executive Dashboard**: Live KPIs for total fleet, available vehicles, rented vehicles, maintenance status, customer registrations, active trips, and revenue.
- **Overdue Rentals Detection**: Automatic detection and highlighting of active rentals past their return date without manual cron updates.
- **Vehicle Fleet Management**: Full CRUD operations to add, edit, inspect, service (MAINTENANCE), or deactivate vehicles.
- **Reservations Desk**: Confirm, reject, or cancel reservations with audit trails.
- **Rental Operations (Pickup & Return)**:
  - **Pickup Workflow**: Document pickup datetime, odometer reading (km), fuel level, and condition notes → marks booking `ACTIVE` and vehicle `RENTED`.
  - **Return Workflow**: Document return odometer, return fuel level, damage charges, additional fees, and notes → marks booking `COMPLETED` and vehicle `AVAILABLE`.
- **Customer Directory**: View customer profiles, booking volumes, total spend, and toggle active/inactive account status (passwords never exposed).
- **Immutable Audit Trail**: Activity log tracking logins, vehicle updates, status changes, pickups, and returns.

---

## 🏗️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Axios, Lucide React |
| **Backend** | Node.js, Express.js, REST API Architecture, JWT, bcryptjs, Morgan |
| **Databases** | **Supabase (PostgreSQL)**, **MySQL 8.0+**, and Embedded SQLite fallback |
| **Deployment** | **Vercel** (Serverless Express + Static Vite Frontend on single origin) |
| **Source Control** | **Git** & **GitHub** (`kishoreramesh638-creator/Vehicle-Rental-System_SE`) |

---

## 📂 Project Structure

```
vehicle-rental-system/
│
├── api/
│   └── index.js                   # Vercel Serverless Function entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/            # VehicleCard, StatusBadge, Modal, LoadingSpinner, EmptyState
│   │   ├── context/               # AuthContext (JWT, state, role guards)
│   │   ├── layouts/               # Navbar, Footer, MainLayout
│   │   ├── pages/
│   │   │   ├── Home.jsx           # Landing page with interactive search widget
│   │   │   ├── Vehicles.jsx       # Vehicle catalog & multi-filter search
│   │   │   ├── VehicleDetails.jsx # Detailed specs & live availability calculator
│   │   │   ├── Login.jsx          # Quick-fill demo credentials & sign-in
│   │   │   ├── Register.jsx       # Customer registration
│   │   │   ├── customer/          # Dashboard, MyBookings, Checkout, Payment, Confirmation, Profile
│   │   │   └── admin/             # Dashboard, Vehicles, Bookings, Rentals Desk, Customers, AuditLogs
│   │   ├── services/              # Axios instance with auth interceptor
│   │   ├── App.jsx                # Route declarations & role guards
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── backend/
│   ├── config/                    # db.js (Supabase/MySQL/SQLite adapter), constants.js
│   ├── controllers/               # auth, vehicle, booking, rental, payment, customer, dashboard, audit
│   ├── middleware/                # JWT auth, role authorization, request validation, error handling
│   ├── routes/                    # REST API route endpoints
│   ├── services/                  # Business logic layer
│   ├── utils/                     # responseHandler, referenceGenerator, dateUtils
│   ├── tests/                     # integration.test.js (30 automated test assertions)
│   ├── app.js                     # Express application definition
│   ├── server.js                  # Standalone local HTTP server
│   └── package.json
│
├── database/
│   ├── supabase_schema.sql        # Supabase PostgreSQL schema with indexes & constraints
│   ├── supabase_seed.sql          # Supabase seed data (Admin, Customers, 13 Vehicles, Bookings)
│   ├── schema.sql                 # MySQL schema
│   ├── seed.sql                   # MySQL seed data
│   └── schema.sqlite.sql          # SQLite schema
│
├── vercel.json                    # Vercel build and serverless rewrite configuration
├── .env.example                   # Environment configuration template
├── .gitignore
└── README.md
```

---

## 🔑 Demo Credentials

| Role | Email | Password | Permissions |
|---|---|---|---|
| **Administrator** | `admin@vehiclerental.com` | `Admin@123` | Full system control, fleet CRUD, pickup/return dispatch, audit logs |
| **Customer** | `rahul.sharma@example.com` | `Customer@123` | Browse, reserve vehicles, simulated payments, view personal bookings |
| **Customer** | `priya.patel@example.com` | `Customer@123` | Standard customer account |

*(On the login page, you can click **"Admin Demo"** or **"Customer Demo"** for instant 1-click test filling!)*

---

## 🚀 Setup & Supabase Connection

### Option A: Supabase (Project: `auevbqwytflxliaefcz`)
1. Open your Supabase Dashboard: [https://supabase.com/dashboard/project/auevbqwytflxliaefcz](https://supabase.com/dashboard/project/auevbqwytflxliaefcz).
2. Go to the **SQL Editor** in the left sidebar.
3. Open `database/supabase_schema.sql`, copy all queries, and click **Run**.
4. Open `database/supabase_seed.sql`, copy all queries, and click **Run**.
5. Go to **Settings > Database** and copy the **Connection string (URI)** (or pooler string):
   ```env
   DATABASE_URL=postgresql://postgres.auevbqwytflxliaefcz:[YOUR-PASSWORD]@aws-0-ap-south-1.pooler.supabase.com:6543/postgres
   ```
6. Paste into your `.env` or Vercel Environment Variables.

### Option B: Local Running (Zero-Config or MySQL)
The system includes an intelligent database connector:
- If MySQL is running on `localhost:3306`, it connects and manages `vehicle_rental_db`.
- If no external database is active, it engages an embedded relational SQLite database with disk persistence, allowing instant zero-dependency execution.

---

## 💻 Local Development

### 1. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm run install:all
```

### 2. Run Test Suite
```bash
npm test
```
*Executes all 30 automated integration test cases covering the entire rental lifecycle.*

### 3. Start Backend & Frontend
```bash
# Terminal 1: Backend API (port 5000)
cd backend
npm run dev

# Terminal 2: Frontend (port 5173)
cd frontend
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## ☁️ Vercel Deployment

This project includes a native `vercel.json` configuration configured to deploy both the Vite frontend and Express API together:

1. Push your code to your GitHub repository:
   ```bash
   git remote add origin https://github.com/kishoreramesh638-creator/Vehicle-Rental-System_SE.git
   git branch -M main
   git push -u origin main
   ```
2. Open **[vercel.com](https://vercel.com)** and click **Add New > Project**.
3. Import **`kishoreramesh638-creator/Vehicle-Rental-System_SE`**.
4. In **Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase connection string.
   - `JWT_SECRET`: `driveease_jwt_secret_production_key_2026_secured`
   - `NODE_ENV`: `production`
5. Click **Deploy**. Vercel will build the frontend and serve `/api/*` routes via serverless functions automatically!

---

## 🧪 Integration Test Verification

The automated integration test suite tests:
- Customer Registration with validation & duplicate email rejection (409 Conflict)
- Customer & Admin Authentication (JWT issuance and verification)
- Vehicle Catalog & Server-Side Search Filtering
- Availability Date Engine (Checks requested dates against overlapping reservations)
- Double-Booking Prevention (Blocks race conditions and overlapping periods with 409 Conflict)
- Backend Price Calculation (`subtotal = days × price_per_day`, deposit calculation)
- Simulated Payment Processing (Transitions booking `PENDING` → `CONFIRMED`)
- Pickup Dispatch Workflow (`CONFIRMED` → `ACTIVE`, vehicle `RENTED`, odometer/fuel recorded)
- Business Rule Enforcements (Prevents customer cancellation on `ACTIVE` rentals)
- Return Workflow (`ACTIVE` → `COMPLETED`, vehicle `AVAILABLE`, damage/extra charges settled)
- Admin Dashboard Statistics & Revenue aggregation
- Customer Management Security (Customer passwords never exposed to admin APIs)
