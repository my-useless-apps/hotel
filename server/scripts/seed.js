const bcrypt = require('bcryptjs');
const db = require('../config/database');

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data (be careful in production!)
    await db.query('DELETE FROM blocked_dates');
    await db.query('DELETE FROM bookings');
    await db.query('DELETE FROM house_amenities');
    await db.query('DELETE FROM houses');
    await db.query('DELETE FROM users');

    // Reset sequences
    await db.query('ALTER SEQUENCE users_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE houses_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE bookings_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE house_amenities_id_seq RESTART WITH 1');
    await db.query('ALTER SEQUENCE blocked_dates_id_seq RESTART WITH 1');

    // 1. Create admin user
    console.log('👤 Creating admin user...');
    const adminPassword = await bcrypt.hash('admin123', 12);
    
    await db.query(`
      INSERT INTO users (email, password_hash, first_name, last_name, role) 
      VALUES ($1, $2, $3, $4, $5)
    `, ['admin@premiumstays.com', adminPassword, 'Admin', 'User', 'admin']);

    // 2. Create sample houses
    console.log('🏠 Creating sample houses...');
    
    const houses = [
      {
        title: 'Luxury Beach Villa',
        description: 'Stunning oceanfront villa with private beach access and panoramic sea views. Perfect for a romantic getaway or family vacation.',
        address: '123 Ocean Drive',
        city: 'Malibu',
        state: 'California',
        country: 'USA',
        zip_code: '90265',
        price_per_night: 450.00,
        max_guests: 8,
        bedrooms: 4,
        bathrooms: 3.5,
        square_feet: 3200,
        is_active: true,
        wifi: true,
        parking: true,
        pool: true,
        hot_tub: true,
        fireplace: true,
        air_conditioning: true,
        heating: true,
        kitchen: true,
        washer_dryer: true,
        tv: true,
        images: [
          'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800',
          'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800'
        ]
      },
      {
        title: 'Mountain Cabin Retreat',
        description: 'Cozy mountain cabin surrounded by pine trees and hiking trails. Features a stone fireplace and rustic charm.',
        address: '456 Pine Ridge Road',
        city: 'Aspen',
        state: 'Colorado',
        country: 'USA',
        zip_code: '81611',
        price_per_night: 320.00,
        max_guests: 6,
        bedrooms: 3,
        bathrooms: 2.0,
        square_feet: 2100,
        is_active: true,
        wifi: true,
        parking: true,
        pool: false,
        hot_tub: true,
        fireplace: true,
        air_conditioning: false,
        heating: true,
        kitchen: true,
        washer_dryer: true,
        tv: true,
        images: [
          'https://images.unsplash.com/photo-1587061949409-02df41d5e562?w=800',
          'https://images.unsplash.com/photo-1618767689160-da3fb810aad7?w=800'
        ]
      },
      {
        title: 'Urban Loft Downtown',
        description: 'Modern loft in the heart of the city with floor-to-ceiling windows and contemporary design. Walking distance to restaurants and attractions.',
        address: '789 City Center Blvd',
        city: 'San Francisco',
        state: 'California',
        country: 'USA',
        zip_code: '94102',
        price_per_night: 275.00,
        max_guests: 4,
        bedrooms: 2,
        bathrooms: 2.0,
        square_feet: 1400,
        is_active: true,
        wifi: true,
        parking: false,
        pool: false,
        hot_tub: false,
        fireplace: false,
        air_conditioning: true,
        heating: true,
        kitchen: true,
        washer_dryer: true,
        tv: true,
        images: [
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800',
          'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=800'
        ]
      },
      {
        title: 'Historic Victorian Manor',
        description: 'Beautifully restored Victorian mansion with period furnishings and modern amenities. Perfect for special occasions.',
        address: '321 Heritage Lane',
        city: 'Savannah',
        state: 'Georgia',
        country: 'USA',
        zip_code: '31401',
        price_per_night: 380.00,
        max_guests: 10,
        bedrooms: 5,
        bathrooms: 4.0,
        square_feet: 4200,
        is_active: false, // INACTIVE - testing feature
        wifi: true,
        parking: true,
        pool: false,
        hot_tub: false,
        fireplace: true,
        air_conditioning: true,
        heating: true,
        kitchen: true,
        washer_dryer: true,
        tv: true,
        images: [
          'https://images.unsplash.com/photo-1594736797933-d0e3ef5a3b9c?w=800'
        ]
      },
      {
        title: 'Desert Oasis Ranch',
        description: 'Secluded ranch house in the desert with stunning sunset views and outdoor entertainment space.',
        address: '654 Desert Vista Trail',
        city: 'Scottsdale',
        state: 'Arizona',
        country: 'USA',
        zip_code: '85251',
        price_per_night: 295.00,
        max_guests: 6,
        bedrooms: 3,
        bathrooms: 2.5,
        square_feet: 2800,
        is_active: false, // INACTIVE - testing feature
        wifi: true,
        parking: true,
        pool: true,
        hot_tub: true,
        fireplace: true,
        air_conditioning: true,
        heating: true,
        kitchen: true,
        washer_dryer: true,
        tv: true,
        images: [
          'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800'
        ]
      }
    ];

    const houseIds = [];
    for (const house of houses) {
      const result = await db.query(`
        INSERT INTO houses (
          title, description, address, city, state, country, zip_code,
          price_per_night, max_guests, bedrooms, bathrooms, square_feet,
          is_active, wifi, parking, pool, hot_tub, fireplace, air_conditioning,
          heating, kitchen, washer_dryer, tv, images
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
        RETURNING id
      `, [
        house.title, house.description, house.address, house.city, house.state, 
        house.country, house.zip_code, house.price_per_night, house.max_guests, 
        house.bedrooms, house.bathrooms, house.square_feet, house.is_active,
        house.wifi, house.parking, house.pool, house.hot_tub, house.fireplace,
        house.air_conditioning, house.heating, house.kitchen, house.washer_dryer,
        house.tv, JSON.stringify(house.images)
      ]);
      
      houseIds.push(result.rows[0].id);
    }

    // 3. Create custom amenities for some houses
    console.log('✨ Adding custom amenities...');
    
    await db.query(`
      INSERT INTO house_amenities (house_id, name, description) VALUES
      ($1, 'Private Chef Service', 'Professional chef available upon request'),
      ($1, 'Beach Equipment', 'Kayaks, surfboards, and beach chairs included'),
      ($2, 'Ski Equipment Storage', 'Heated storage for ski equipment'),
      ($2, 'Mountain Bikes', 'Two mountain bikes available for guests'),
      ($3, 'Rooftop Access', 'Private rooftop terrace with city views'),
      ($4, 'Piano Room', 'Grand piano in the music room'),
      ($4, 'Historic Tours', 'Guided tour of the mansion available')
    `, [houseIds[0], houseIds[1], houseIds[2], houseIds[3]]);

    // 4. Create sample bookings
    console.log('📅 Creating sample bookings...');
    
    const today = new Date();
    const futureDate1 = new Date(today);
    futureDate1.setDate(today.getDate() + 30);
    const futureDate2 = new Date(futureDate1);
    futureDate2.setDate(futureDate1.getDate() + 3);

    const futureDate3 = new Date(today);
    futureDate3.setDate(today.getDate() + 60);
    const futureDate4 = new Date(futureDate3);
    futureDate4.setDate(futureDate3.getDate() + 5);

    await db.query(`
      INSERT INTO bookings (
        house_id, guest_email, guest_first_name, guest_last_name, guest_phone,
        check_in_date, check_out_date, total_nights, total_amount, status, special_requests
      ) VALUES
      ($1, 'john.doe@email.com', 'John', 'Doe', '+1-555-0123', $2, $3, 3, $4, 'confirmed', 'Late check-in requested'),
      ($5, 'jane.smith@email.com', 'Jane', 'Smith', '+1-555-0456', $6, $7, 5, $8, 'confirmed', 'Anniversary celebration')
    `, [
      houseIds[0], futureDate1, futureDate2, 450 * 3,
      houseIds[1], futureDate3, futureDate4, 320 * 5
    ]);

    // 5. Create some blocked dates
    console.log('🚫 Adding blocked dates...');
    
    const maintenanceDate1 = new Date(today);
    maintenanceDate1.setDate(today.getDate() + 15);
    const maintenanceDate2 = new Date(today);
    maintenanceDate2.setDate(today.getDate() + 16);

    await db.query(`
      INSERT INTO blocked_dates (house_id, blocked_date, reason) VALUES
      ($1, $2, 'Maintenance and cleaning'),
      ($1, $3, 'Maintenance and cleaning'),
      ($4, $2, 'Property inspection')
    `, [houseIds[0], maintenanceDate1, maintenanceDate2, houseIds[1]]);

    // 6. Display summary
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('- 1 admin user created');
    console.log('- 5 houses created (3 active, 2 inactive)');
    console.log('- Custom amenities added');
    console.log('- 2 sample bookings created');
    console.log('- Blocked dates added');
    
    console.log('\n🔐 Admin Login Credentials:');
    console.log('Email: admin@premiumstays.com');
    console.log('Password: admin123');
    
    console.log('\n🏠 House Activation Status:');
    console.log('✅ Active: Luxury Beach Villa, Mountain Cabin Retreat, Urban Loft Downtown');
    console.log('❌ Inactive: Historic Victorian Manor, Desert Oasis Ranch');
    
    console.log('\n🧪 Test the activation feature:');
    console.log('1. Visit public site - see only 3 active houses');
    console.log('2. Login to admin - see all 5 houses with toggle controls');
    console.log('3. Toggle activation status and check public site updates');

  } catch (error) {
    console.error('❌ Seeding error:', error);
    throw error;
  }
};

// Run seeding if called directly
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('\n✅ Seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase;
