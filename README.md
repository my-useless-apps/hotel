# Premium Stays - Vacation Rental Platform

A complete full-stack web application for managing premium vacation house rentals with a **critical house activation/deactivation feature**. Built with React/Next.js frontend and Node.js/Express/PostgreSQL backend.

## 🎯 Core Feature: House Activation/Deactivation

**This application's defining feature is the ability to activate/deactivate vacation houses:**

- **Active Houses**: Visible on the public site, searchable, and bookable by guests
- **Inactive Houses**: Hidden from the public site, only visible in admin dashboard
- **Real-time Updates**: Changing activation status immediately affects public visibility
- **Admin Controls**: Prominent toggle switches in the admin dashboard for instant activation/deactivation

## 🏗️ Architecture Overview

### Frontend (Next.js)
- **Public Site**: Browse and book only ACTIVE houses
- **Admin Dashboard**: Manage ALL houses with activation controls
- **Real-time Calendar**: Instant availability checking for active houses only

### Backend (Express.js)
- **Public APIs**: Automatically filter by `is_active = true`
- **Admin APIs**: Access all houses regardless of status
- **Database**: PostgreSQL with `is_active` column as core requirement

## 📋 Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd hotel-project

# Install all dependencies
npm run install:all
```

### 2. Database Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE premium_stays;
```

2. Run the schema:
```bash
psql -d premium_stays -f database/schema.sql
```

### 3. Environment Configuration

Create environment files:

**Server Configuration** (`server/.env`):
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=premium_stays
DB_USER=postgres
DB_PASSWORD=your_password

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_here
JWT_EXPIRES_IN=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000
```

**Client Configuration** (`client/.env.local`):
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### 4. Seed Database

**CRITICAL**: Run the seed script to create sample data demonstrating the activation feature:

```bash
cd server
npm run seed
```

This creates:
- Admin user: `admin@premiumstays.com` / `admin123`
- 5 sample houses (3 active, 2 inactive)
- Sample bookings and blocked dates

### 5. Start the Application

```bash
# Start both frontend and backend
npm run dev

# Or start separately:
npm run server:dev  # Backend on http://localhost:5000
npm run client:dev  # Frontend on http://localhost:3000
```

## 🎮 Testing the Activation Feature

### Demo Scenario:

1. **Visit Public Site** (`http://localhost:3000`)
   - See only 3 active houses in the listings
   - Notice inactive houses are completely hidden

2. **Login to Admin** (`http://localhost:3000/admin`)
   - Email: `admin@premiumstays.com`
   - Password: `admin123`

3. **In Admin Dashboard**:
   - See ALL 5 houses (active and inactive)
   - Notice green "Active" and gray "Inactive" badges
   - Use the toggle switches to activate/deactivate houses

4. **Test Real-time Updates**:
   - Deactivate an active house in admin
   - Refresh the public site → house disappears
   - Activate an inactive house in admin
   - Refresh the public site → house appears

5. **Test Booking Flow**:
   - Only active houses can be booked
   - Calendar availability only works for active houses
   - Booking attempts on inactive houses return 404

## 🔑 Critical API Endpoints

### Public Endpoints (Filter by `is_active = true`)
- `GET /api/houses` - Only returns active houses
- `GET /api/houses/:id` - 404 if house is inactive
- `GET /api/availability/:houseId` - 404 if house is inactive
- `POST /api/bookings` - Only allows booking active houses

### Admin Endpoints (Access all houses)
- `GET /admin/api/houses` - Returns ALL houses with `is_active` status
- `POST /admin/api/houses` - Create house with activation status
- `PUT /admin/api/houses/:id` - Update house including activation
- `PATCH /admin/api/houses/:id/toggle` - Quick activation toggle

## 📊 Database Schema Highlights

### Houses Table (Core)
```sql
CREATE TABLE houses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    -- ... other fields ...
    is_active BOOLEAN DEFAULT FALSE NOT NULL, -- CRITICAL COLUMN
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Performance index on activation status
CREATE INDEX idx_houses_active ON houses(is_active);
```

## 🔐 Authentication

- **Admin Login**: JWT-based authentication
- **Public Access**: No authentication required for browsing active houses
- **Protected Routes**: All `/admin/api/*` endpoints require valid JWT token

## 🎨 UI/UX Features

### Admin Dashboard
- **Prominent Toggle Switches**: Easy activation/deactivation
- **Status Badges**: Clear visual indication of house status
- **Real-time Stats**: Active vs inactive house counts
- **Form Controls**: Checkbox for activation when creating/editing houses

### Public Site
- **Seamless Experience**: Inactive houses never appear
- **Real-time Calendar**: Instant availability checking
- **Responsive Design**: Modern, mobile-friendly interface

## 📁 Project Structure

```
hotel-project/
├── client/                 # Next.js frontend
│   ├── app/
│   │   ├── page.js        # Public house listings
│   │   ├── houses/[id]/   # House details with booking
│   │   ├── bookings/      # Booking lookup
│   │   └── admin/         # Admin dashboard
│   ├── components/ui/     # Shadcn/UI components
│   └── lib/utils.js       # Utilities
├── server/                # Express backend
│   ├── routes/
│   │   ├── public.js      # Public APIs (filtered by is_active)
│   │   ├── admin.js       # Admin APIs (all houses)
│   │   └── auth.js        # Authentication
│   ├── middleware/auth.js # JWT middleware
│   ├── config/database.js # PostgreSQL config
│   └── scripts/seed.js    # Database seeding
├── database/
│   └── schema.sql         # Complete database schema
└── README.md
```

## 🚨 Critical Implementation Notes

### 1. Database Queries
- **Public APIs**: ALWAYS include `WHERE is_active = true`
- **Admin APIs**: Include `is_active` column in SELECT statements
- **Performance**: Indexed queries on `is_active` column

### 2. Frontend Components
- **Public Components**: Fetch from public APIs only
- **Admin Components**: Include activation controls and status display
- **Real-time Updates**: Re-fetch data after activation changes

### 3. Security
- **Admin Protection**: All admin routes require authentication
- **Data Isolation**: Public users cannot access inactive house data
- **Validation**: Server-side validation of activation status

## 🔧 Development Commands

```bash
# Install dependencies
npm run install:all

# Development (both frontend and backend)
npm run dev

# Individual services
npm run server:dev
npm run client:dev

# Database seeding
npm run seed

# Production builds
npm run client:build
npm run server:start
```

## 🐛 Troubleshooting

### Common Issues:

1. **Houses not appearing on public site**
   - Check if houses are activated in admin dashboard
   - Verify `is_active = true` in database

2. **Admin login fails**
   - Ensure database is seeded with admin user
   - Check JWT_SECRET in environment variables

3. **Database connection errors**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`

4. **API 404 errors**
   - Ensure backend server is running on port 5000
   - Check CORS configuration

## 🎯 Key Testing Scenarios

1. **Activation Workflow**:
   - Create house as inactive → not visible publicly
   - Activate house → appears on public site
   - Deactivate house → disappears from public site

2. **Booking Restrictions**:
   - Try booking inactive house → should fail
   - Book active house → should succeed
   - Deactivate house with bookings → bookings remain valid

3. **Admin Controls**:
   - Toggle activation switches in dashboard
   - Create new houses with activation status
   - Edit existing houses and change activation

## 📈 Future Enhancements

- WebSocket real-time updates
- Bulk activation/deactivation
- Scheduling activation/deactivation
- Activation audit logs
- Email notifications on status changes

## 📄 License

MIT License - see LICENSE file for details.

---

**🎉 The Premium Stays platform successfully demonstrates the critical house activation/deactivation feature with real-time public site updates and comprehensive admin controls.**
