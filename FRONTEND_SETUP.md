# 🎨 Premium Stays Frontend Setup

Beautiful Next.js frontend for the Premium Stays hotel booking platform with the **house activation/deactivation feature**.

## ✨ Features Implemented

### 🏠 **Public Pages:**
- **Beautiful Homepage** with featured properties
- **House Listings** with advanced filtering
- **House Details** with booking functionality
- **Booking Lookup** by booking ID
- **Responsive Design** for all devices

### 🔐 **Admin Dashboard:**
- **Admin Login** with demo credentials
- **Property Management** with activation controls
- **🎯 HOUSE ACTIVATION TOGGLE** - Core Feature!
- **Real-time Stats** dashboard
- **Beautiful UI** with Tailwind CSS

### 🎯 **Core Feature - House Activation System:**
- **Toggle Switches** in admin dashboard
- **Real-time Updates** when toggling
- **Visual Indicators** (Active/Inactive badges)
- **Public Site Integration** (only active houses shown)

## 🚀 Quick Start

### 1. **Install Dependencies**
```bash
cd client
npm install
```

### 2. **Configure API URL**
Create `client/.env.local`:
```env
# For local development
NEXT_PUBLIC_API_URL=http://localhost:5000

# For production (update with your Railway URL)
# NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

### 3. **Start Development Server**
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## 📱 Pages Overview

### **Public Pages:**
- `/` - Homepage with featured properties
- `/houses` - Browse all active houses
- `/houses/[id]` - House details with booking
- `/bookings` - Booking lookup
- `/admin/login` - Admin authentication

### **Admin Pages:**
- `/admin` - Main dashboard with activation controls
- `/admin/houses` - Property management
- `/admin/bookings` - Booking management

## 🎯 Testing the Activation Feature

### **Demo Flow:**
1. **Visit Homepage** (`http://localhost:3000`)
   - See featured active houses only
   - Click "Browse Houses" to see all active properties

2. **Admin Login** (`http://localhost:3000/admin/login`)
   - **Email:** `admin@premiumstays.com`
   - **Password:** `admin123`

3. **Admin Dashboard** (`http://localhost:3000/admin`)
   - See **ALL** houses (active + inactive)
   - Notice the **toggle switches** for each house
   - **Green badges** = Active, **Gray badges** = Inactive

4. **Test Activation:**
   - Toggle a house from active to inactive
   - Visit public pages - house disappears
   - Toggle back to active - house reappears

## 🎨 UI Components

Built with **Shadcn/UI** components:
- `Button` - Interactive buttons
- `Card` - Content containers
- `Input` - Form inputs
- `Switch` - **Activation toggles** (Core feature!)
- `Badge` - Status indicators
- `Navigation` - Site-wide navbar

## 🔌 API Integration

### **Public API Endpoints:**
```javascript
// Get active houses only
GET /api/houses

// Get specific active house
GET /api/houses/:id

// Create booking (active houses only)
POST /api/bookings

// Check availability
GET /api/houses/:id/availability
```

### **Admin API Endpoints:**
```javascript
// Get ALL houses (active + inactive)
GET /admin/api/houses

// Toggle house activation (CORE FEATURE)
PATCH /admin/api/houses/:id/toggle

// Update house details
PUT /admin/api/houses/:id
```

### **Authentication:**
```javascript
// Admin login
POST /api/auth/login

// Get current user
GET /api/auth/me
```

## 🎯 Core Feature Implementation

### **Activation Toggle Component:**
```jsx
<Switch
  checked={house.is_active}
  onCheckedChange={() => handleToggleActivation(house.id)}
  className="data-[state=checked]:bg-green-600"
/>
```

### **Real-time State Updates:**
```javascript
const handleToggleActivation = async (houseId) => {
  const response = await adminApi.toggleHouseActivation(houseId)
  
  // Update local state immediately
  setHouses(prev => prev.map(house => 
    house.id === houseId 
      ? { ...house, is_active: response.data.house.isActive }
      : house
  ))
}
```

### **Public Filtering:**
```javascript
// Only fetch active houses for public pages
const fetchHouses = async () => {
  const response = await publicApi.getHouses() // is_active = true only
  setHouses(response.data.houses)
}
```

## 🎨 Design System

### **Colors:**
- **Primary:** Blue (`#2563eb`)
- **Success:** Green (`#16a34a`) - Active houses
- **Secondary:** Gray (`#6b7280`) - Inactive houses
- **Background:** Light gray (`#f9fafb`)

### **Typography:**
- **Headings:** Inter font, bold weights
- **Body:** Inter font, regular/medium weights
- **Code:** Monospace font

### **Components:**
- **Cards** with subtle shadows
- **Buttons** with hover effects
- **Toggles** with smooth animations
- **Badges** with status colors

## 🔧 Environment Configuration

### **Development:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### **Production:**
```env
NEXT_PUBLIC_API_URL=https://your-railway-app.railway.app
```

## 📦 Build & Deploy

### **Build for Production:**
```bash
npm run build
```

### **Deploy to Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variable
vercel env add NEXT_PUBLIC_API_URL
```

## 🧪 Testing Checklist

### **Public Functionality:**
- [ ] Homepage loads with featured houses
- [ ] House listings show only active houses
- [ ] House details page works
- [ ] Booking form functions correctly
- [ ] Booking lookup works

### **Admin Functionality:**
- [ ] Admin login works with demo credentials
- [ ] Dashboard shows all houses (active + inactive)
- [ ] Toggle switches work for activation
- [ ] Status badges update in real-time
- [ ] Stats update when toggling houses

### **Core Feature (Activation System):**
- [ ] Inactive houses hidden from public
- [ ] Active houses visible on public site
- [ ] Toggle immediately updates public visibility
- [ ] Admin can see all houses regardless of status
- [ ] Visual indicators work correctly

## 🎉 Success Criteria

Your frontend is working correctly when:

1. **Public users** see only active houses
2. **Admin users** see all houses with toggle controls
3. **Toggling activation** immediately affects public visibility
4. **Beautiful UI** with modern design
5. **Responsive** on all devices
6. **Real-time updates** when changing activation status

## 🔗 Integration with Backend

The frontend connects to your Railway API automatically. Make sure:

1. **Backend is running** on Railway
2. **Database is seeded** with sample data
3. **Environment variables** are set correctly
4. **CORS is configured** to allow frontend domain

## 🎯 The Magic - House Activation

This is what makes your platform special:

**Admin Dashboard:**
- Toggle switches for each house
- Real-time activation/deactivation
- Visual feedback (badges, colors)
- Immediate state updates

**Public Site:**
- Only shows active houses
- Inactive houses completely hidden
- No broken links or 404s
- Seamless user experience

**The Result:**
Admins have full control over which properties are publicly bookable, with instant visibility changes! 🚀

Your hotel booking platform frontend is now **complete and beautiful**! 🏨✨
