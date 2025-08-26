# 🚂 Railway Deployment Guide

This guide will help you deploy the Premium Stays Hotel API to Railway with a PostgreSQL database.

## 📋 Prerequisites

- Railway account ([railway.app](https://railway.app))
- GitHub repository connected to Railway
- Basic understanding of environment variables

## 🚀 Step 1: Create Railway Project

1. **Login to Railway** and click "New Project"
2. **Choose "Deploy from GitHub repo"**
3. **Select your hotel repository**
4. Railway will automatically detect the `railway.json` configuration

## 🗄️ Step 2: Add PostgreSQL Database

1. **In your Railway project**, click "Add Service"
2. **Select "Database" → "PostgreSQL"**
3. Railway will automatically:
   - Create a PostgreSQL instance
   - Generate a `DATABASE_URL` environment variable
   - Connect it to your app

## ⚙️ Step 3: Configure Environment Variables

In your Railway project settings, add these environment variables:

### Required Variables:
```bash
# JWT Configuration (REQUIRED)
JWT_SECRET=your_super_secure_jwt_secret_key_minimum_32_characters_long

# JWT Token Expiration
JWT_EXPIRES_IN=7d

# Node Environment
NODE_ENV=production

# Frontend URL (update after frontend deployment)
CLIENT_URL=https://your-frontend-domain.vercel.app
```

### Automatic Variables (Railway provides these):
- `DATABASE_URL` - Automatically set by Railway PostgreSQL service
- `PORT` - Automatically set by Railway

## 🗃️ Step 4: Initialize Database Schema

After deployment, you need to create the database schema:

### Option A: Using Railway CLI (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Run the schema
railway run psql $DATABASE_URL -f database/schema.sql
```

### Option B: Manual Connection
1. **Get Database URL** from Railway dashboard
2. **Connect using psql** or database client
3. **Run the schema** from `database/schema.sql`

## 🌱 Step 5: Seed Database (Optional)

To populate with sample data:

```bash
# Using Railway CLI
railway run node server/scripts/seed.js

# Or connect directly and run:
# node server/scripts/seed.js
```

This creates:
- 1 admin user (`admin@premiumstays.com` / `admin123`)
- 5 sample houses (3 active, 2 inactive)
- Sample bookings and blocked dates

## 🔗 Step 6: Get Your API URL

1. **In Railway dashboard**, find your service
2. **Copy the public URL** (e.g., `https://your-app.railway.app`)
3. **Test the endpoints**:
   - `GET /health` - Health check
   - `GET /api/test` - API feature test
   - `GET /api/houses` - Public houses (only active ones)

## 🧪 Step 7: Test API Endpoints

### Public Endpoints (No authentication required):
```bash
# Health check
curl https://your-app.railway.app/health

# Get active houses
curl https://your-app.railway.app/api/houses

# Get specific house
curl https://your-app.railway.app/api/houses/1
```

### Authentication:
```bash
# Login admin
curl -X POST https://your-app.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@premiumstays.com","password":"admin123"}'
```

### Admin Endpoints (Requires JWT token):
```bash
# Get all houses (including inactive)
curl https://your-app.railway.app/admin/api/houses \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Toggle house activation
curl -X PATCH https://your-app.railway.app/admin/api/houses/1/toggle \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🎯 Step 8: Test Core Feature

The app's main feature is **house activation/deactivation**:

1. **Visit public endpoint** `/api/houses` - see only active houses
2. **Login as admin** and get JWT token
3. **Use admin endpoint** `/admin/api/houses` - see all houses with `is_active` status
4. **Toggle activation** using `/admin/api/houses/:id/toggle`
5. **Check public endpoint again** - verify changes

## 🚨 Troubleshooting

### Database Connection Issues:
```bash
# Check if DATABASE_URL is set
railway variables

# Test database connection
railway run node -e "require('./server/config/database').query('SELECT NOW()')"
```

### JWT Issues:
- Ensure `JWT_SECRET` is at least 32 characters long
- Check that it's set in Railway environment variables

### CORS Issues:
- Update `CLIENT_URL` environment variable with your frontend domain
- Ensure Railway app URL is accessible

## 📊 Monitor Your Deployment

Railway provides:
- **Real-time logs** - Monitor API requests and errors
- **Metrics** - CPU, memory, and request statistics
- **Deployments** - Track deployment history

## 🔄 Auto-Deployment

Railway automatically redeploys when you push to your main branch:

1. **Make changes** to your code
2. **Commit and push** to GitHub
3. **Railway automatically redeploys** your app
4. **Monitor logs** for successful deployment

## 🎉 Success!

Your Premium Stays Hotel API is now live on Railway with:

✅ **PostgreSQL database** with full schema  
✅ **JWT authentication** for admin access  
✅ **House activation/deactivation** feature  
✅ **Public booking system** for active houses  
✅ **Admin dashboard APIs** for house management  
✅ **Real-time availability checking**  
✅ **Comprehensive error handling**  

## 🔗 Next Steps

1. **Deploy frontend** to Vercel or another hosting platform
2. **Update CORS settings** with your frontend URL
3. **Set up custom domain** (optional)
4. **Configure monitoring** and alerts
5. **Add payment processing** (Stripe, PayPal, etc.)

Your hotel booking platform is ready for production! 🏨
