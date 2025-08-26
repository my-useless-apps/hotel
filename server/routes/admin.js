const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const db = require('../config/database');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authMiddleware);
router.use(adminMiddleware);

// Get all houses (admin - includes inactive)
router.get('/houses', [
  query('includeInactive').optional().isBoolean(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const {
      includeInactive = true,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT 
        id, title, description, address, city, state, country, zip_code,
        price_per_night, max_guests, bedrooms, bathrooms, square_feet,
        is_active, wifi, parking, pool, hot_tub, fireplace, air_conditioning, 
        heating, kitchen, washer_dryer, tv, images, created_at, updated_at
      FROM houses
    `;

    const queryParams = [];
    
    if (!includeInactive) {
      queryText += ' WHERE is_active = true';
    }

    queryText += ` ORDER BY created_at DESC LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
    queryParams.push(limit, offset);

    const result = await db.query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM houses';
    if (!includeInactive) {
      countQuery += ' WHERE is_active = true';
    }

    const countResult = await db.query(countQuery);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    // Get active/inactive counts
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_active = true) as active,
        COUNT(*) FILTER (WHERE is_active = false) as inactive
      FROM houses
    `);

    res.json({
      success: true,
      data: {
        houses: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        },
        stats: statsResult.rows[0]
      }
    });

  } catch (error) {
    console.error('Admin get houses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching houses'
    });
  }
});

// Get single house (admin - includes inactive)
router.get('/houses/:id', [
  param('id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid house ID',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        h.*,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('id', ha.id, 'name', ha.name, 'description', ha.description)
          ) FILTER (WHERE ha.id IS NOT NULL), 
          '[]'
        ) as custom_amenities
      FROM houses h
      LEFT JOIN house_amenities ha ON h.id = ha.house_id
      WHERE h.id = $1
      GROUP BY h.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }

    res.json({
      success: true,
      data: {
        house: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Admin get house error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching house'
    });
  }
});

// Create new house
router.post('/houses', [
  body('title').trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim(),
  body('address').trim().isLength({ min: 1 }),
  body('city').trim().isLength({ min: 1, max: 100 }),
  body('state').trim().isLength({ min: 1, max: 100 }),
  body('country').trim().isLength({ min: 1, max: 100 }),
  body('zipCode').optional().trim().isLength({ max: 20 }),
  body('pricePerNight').isFloat({ min: 0 }),
  body('maxGuests').isInt({ min: 1 }),
  body('bedrooms').isInt({ min: 0 }),
  body('bathrooms').isFloat({ min: 0 }),
  body('squareFeet').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('wifi').optional().isBoolean(),
  body('parking').optional().isBoolean(),
  body('pool').optional().isBoolean(),
  body('hotTub').optional().isBoolean(),
  body('fireplace').optional().isBoolean(),
  body('airConditioning').optional().isBoolean(),
  body('heating').optional().isBoolean(),
  body('kitchen').optional().isBoolean(),
  body('washerDryer').optional().isBoolean(),
  body('tv').optional().isBoolean(),
  body('images').optional().isArray(),
  body('customAmenities').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      title, description, address, city, state, country, zipCode,
      pricePerNight, maxGuests, bedrooms, bathrooms, squareFeet,
      isActive = false, wifi = false, parking = false, pool = false,
      hotTub = false, fireplace = false, airConditioning = false,
      heating = false, kitchen = false, washerDryer = false, tv = false,
      images = [], customAmenities = []
    } = req.body;

    // Create house
    const houseResult = await db.query(`
      INSERT INTO houses (
        title, description, address, city, state, country, zip_code,
        price_per_night, max_guests, bedrooms, bathrooms, square_feet,
        is_active, wifi, parking, pool, hot_tub, fireplace, air_conditioning,
        heating, kitchen, washer_dryer, tv, images
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      RETURNING *
    `, [
      title, description, address, city, state, country, zipCode,
      pricePerNight, maxGuests, bedrooms, bathrooms, squareFeet,
      isActive, wifi, parking, pool, hotTub, fireplace, airConditioning,
      heating, kitchen, washerDryer, tv, JSON.stringify(images)
    ]);

    const house = houseResult.rows[0];

    // Add custom amenities if provided
    if (customAmenities.length > 0) {
      for (const amenity of customAmenities) {
        await db.query(
          'INSERT INTO house_amenities (house_id, name, description) VALUES ($1, $2, $3)',
          [house.id, amenity.name, amenity.description || null]
        );
      }
    }

    res.status(201).json({
      success: true,
      message: 'House created successfully',
      data: {
        house
      }
    });

  } catch (error) {
    console.error('Create house error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating house'
    });
  }
});

// Update house
router.put('/houses/:id', [
  param('id').isInt({ min: 1 }),
  body('title').optional().trim().isLength({ min: 1, max: 255 }),
  body('description').optional().trim(),
  body('address').optional().trim().isLength({ min: 1 }),
  body('city').optional().trim().isLength({ min: 1, max: 100 }),
  body('state').optional().trim().isLength({ min: 1, max: 100 }),
  body('country').optional().trim().isLength({ min: 1, max: 100 }),
  body('zipCode').optional().trim().isLength({ max: 20 }),
  body('pricePerNight').optional().isFloat({ min: 0 }),
  body('maxGuests').optional().isInt({ min: 1 }),
  body('bedrooms').optional().isInt({ min: 0 }),
  body('bathrooms').optional().isFloat({ min: 0 }),
  body('squareFeet').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  body('wifi').optional().isBoolean(),
  body('parking').optional().isBoolean(),
  body('pool').optional().isBoolean(),
  body('hotTub').optional().isBoolean(),
  body('fireplace').optional().isBoolean(),
  body('airConditioning').optional().isBoolean(),
  body('heating').optional().isBoolean(),
  body('kitchen').optional().isBoolean(),
  body('washerDryer').optional().isBoolean(),
  body('tv').optional().isBoolean(),
  body('images').optional().isArray()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    // Check if house exists
    const existingHouse = await db.query('SELECT id FROM houses WHERE id = $1', [id]);
    if (existingHouse.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const updateValues = [];
    let paramCount = 0;

    const allowedFields = [
      'title', 'description', 'address', 'city', 'state', 'country', 'zipCode',
      'pricePerNight', 'maxGuests', 'bedrooms', 'bathrooms', 'squareFeet',
      'isActive', 'wifi', 'parking', 'pool', 'hotTub', 'fireplace', 
      'airConditioning', 'heating', 'kitchen', 'washerDryer', 'tv', 'images'
    ];

    const columnMapping = {
      zipCode: 'zip_code',
      pricePerNight: 'price_per_night',
      maxGuests: 'max_guests',
      squareFeet: 'square_feet',
      isActive: 'is_active',
      hotTub: 'hot_tub',
      airConditioning: 'air_conditioning',
      washerDryer: 'washer_dryer'
    };

    for (const [field, value] of Object.entries(req.body)) {
      if (allowedFields.includes(field) && value !== undefined) {
        paramCount++;
        const columnName = columnMapping[field] || field;
        updateFields.push(`${columnName} = $${paramCount}`);
        updateValues.push(field === 'images' ? JSON.stringify(value) : value);
      }
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    updateValues.push(id);
    const updateQuery = `
      UPDATE houses 
      SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $${paramCount + 1}
      RETURNING *
    `;

    const result = await db.query(updateQuery, updateValues);

    res.json({
      success: true,
      message: 'House updated successfully',
      data: {
        house: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Update house error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating house'
    });
  }
});

// Toggle house activation status (CORE FEATURE)
router.patch('/houses/:id/toggle', [
  param('id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid house ID',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const result = await db.query(`
      UPDATE houses 
      SET is_active = NOT is_active, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, title, is_active
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }

    const house = result.rows[0];

    res.json({
      success: true,
      message: `House ${house.is_active ? 'activated' : 'deactivated'} successfully`,
      data: {
        house: {
          id: house.id,
          title: house.title,
          isActive: house.is_active
        }
      }
    });

  } catch (error) {
    console.error('Toggle house error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling house status'
    });
  }
});

// Delete house
router.delete('/houses/:id', [
  param('id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid house ID',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    // Check if house has active bookings
    const bookingsResult = await db.query(
      'SELECT COUNT(*) FROM bookings WHERE house_id = $1 AND status != $2',
      [id, 'cancelled']
    );

    const activeBookings = parseInt(bookingsResult.rows[0].count);
    if (activeBookings > 0) {
      return res.status(409).json({
        success: false,
        message: `Cannot delete house with ${activeBookings} active booking(s)`
      });
    }

    const result = await db.query('DELETE FROM houses WHERE id = $1 RETURNING title', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }

    res.json({
      success: true,
      message: `House "${result.rows[0].title}" deleted successfully`
    });

  } catch (error) {
    console.error('Delete house error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting house'
    });
  }
});

// Get all bookings (admin)
router.get('/bookings', [
  query('houseId').optional().isInt({ min: 1 }),
  query('status').optional().isIn(['confirmed', 'cancelled', 'completed']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid query parameters',
        errors: errors.array()
      });
    }

    const {
      houseId,
      status,
      page = 1,
      limit = 20
    } = req.query;

    const offset = (page - 1) * limit;
    
    let queryText = `
      SELECT 
        b.*, h.title as house_title, h.city as house_city
      FROM bookings b
      JOIN houses h ON b.house_id = h.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramCount = 0;

    if (houseId) {
      paramCount++;
      queryText += ` AND b.house_id = $${paramCount}`;
      queryParams.push(houseId);
    }

    if (status) {
      paramCount++;
      queryText += ` AND b.status = $${paramCount}`;
      queryParams.push(status);
    }

    queryText += ` ORDER BY b.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    const result = await db.query(queryText, queryParams);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM bookings b WHERE 1=1';
    const countParams = [];
    let countParamIndex = 0;

    if (houseId) {
      countParamIndex++;
      countQuery += ` AND b.house_id = $${countParamIndex}`;
      countParams.push(houseId);
    }

    if (status) {
      countParamIndex++;
      countQuery += ` AND b.status = $${countParamIndex}`;
      countParams.push(status);
    }

    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

    res.json({
      success: true,
      data: {
        bookings: result.rows,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalCount,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Admin get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
});

// Add blocked dates
router.post('/houses/:id/blocked-dates', [
  param('id').isInt({ min: 1 }),
  body('dates').isArray({ min: 1 }),
  body('dates.*').isISO8601().toDate(),
  body('reason').optional().trim()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { dates, reason } = req.body;

    // Check if house exists
    const houseResult = await db.query('SELECT id FROM houses WHERE id = $1', [id]);
    if (houseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }

    // Insert blocked dates
    const insertPromises = dates.map(date => 
      db.query(
        'INSERT INTO blocked_dates (house_id, blocked_date, reason) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING',
        [id, date, reason]
      )
    );

    await Promise.all(insertPromises);

    res.status(201).json({
      success: true,
      message: `${dates.length} date(s) blocked successfully`
    });

  } catch (error) {
    console.error('Add blocked dates error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding blocked dates'
    });
  }
});

module.exports = router;
