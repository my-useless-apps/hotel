-- Premium Stays Database Schema
-- PostgreSQL DDL

-- Users table for admin/staff authentication
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'staff',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Houses table with CRITICAL is_active column
CREATE TABLE houses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20),
    price_per_night DECIMAL(10,2) NOT NULL,
    max_guests INTEGER NOT NULL,
    bedrooms INTEGER NOT NULL,
    bathrooms DECIMAL(3,1) NOT NULL,
    square_feet INTEGER,
    
    -- CORE REQUIREMENT: Activation status
    is_active BOOLEAN DEFAULT FALSE NOT NULL,
    
    -- House features
    wifi BOOLEAN DEFAULT FALSE,
    parking BOOLEAN DEFAULT FALSE,
    pool BOOLEAN DEFAULT FALSE,
    hot_tub BOOLEAN DEFAULT FALSE,
    fireplace BOOLEAN DEFAULT FALSE,
    air_conditioning BOOLEAN DEFAULT FALSE,
    heating BOOLEAN DEFAULT FALSE,
    kitchen BOOLEAN DEFAULT FALSE,
    washer_dryer BOOLEAN DEFAULT FALSE,
    tv BOOLEAN DEFAULT FALSE,
    
    -- Images (stored as JSON array of URLs)
    images JSON DEFAULT '[]',
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Custom amenities table for dynamic house features
CREATE TABLE house_amenities (
    id SERIAL PRIMARY KEY,
    house_id INTEGER REFERENCES houses(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE bookings (
    id SERIAL PRIMARY KEY,
    house_id INTEGER REFERENCES houses(id) ON DELETE CASCADE,
    guest_email VARCHAR(255) NOT NULL,
    guest_first_name VARCHAR(100) NOT NULL,
    guest_last_name VARCHAR(100) NOT NULL,
    guest_phone VARCHAR(20),
    
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    
    status VARCHAR(50) DEFAULT 'confirmed',
    special_requests TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure no overlapping bookings for the same house
    CONSTRAINT no_overlapping_bookings UNIQUE (house_id, check_in_date, check_out_date)
);

-- Blocked dates table for admin-defined unavailable periods
CREATE TABLE blocked_dates (
    id SERIAL PRIMARY KEY,
    house_id INTEGER REFERENCES houses(id) ON DELETE CASCADE,
    blocked_date DATE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(house_id, blocked_date)
);

-- Indexes for performance
CREATE INDEX idx_houses_active ON houses(is_active);
CREATE INDEX idx_houses_city ON houses(city);
CREATE INDEX idx_houses_price ON houses(price_per_night);
CREATE INDEX idx_bookings_house_dates ON bookings(house_id, check_in_date, check_out_date);
CREATE INDEX idx_bookings_email ON bookings(guest_email);
CREATE INDEX idx_blocked_dates_house ON blocked_dates(house_id, blocked_date);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_houses_updated_at BEFORE UPDATE ON houses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
