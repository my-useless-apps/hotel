const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const db = require('../config/database');

const router = express.Router();

// Get all active houses (public endpoint)
router.get('/houses', [
  query('city').optional().trim(),
  query('minPrice').optional().isFloat({ min: 0 }),
  query('maxPrice').optional().isFloat({ min: 0 }),
  query('guests').optional().isInt({ min: 1 }),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 })
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
      city,
      minPrice,
      maxPrice,
      guests,
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;
    
    // Build dynamic query
    let queryText = `
      SELECT 
        id, title, description, address, city, state, country, zip_code,
        price_per_night, max_guests, bedrooms, bathrooms, square_feet,
        wifi, parking, pool, hot_tub, fireplace, air_conditioning, 
        heating, kitchen, washer_dryer, tv, images, created_at
      FROM houses 
      WHERE is_active = true
    `;
    
    const queryParams = [];
    let paramCount = 0;

    // Add filters
    if (city) {
      paramCount++;
      queryText += ` AND LOWER(city) LIKE LOWER($${paramCount})`;
      queryParams.push(`%${city}%`);
    }

    if (minPrice) {
      paramCount++;
      queryText += ` AND price_per_night >= $${paramCount}`;
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      paramCount++;
      queryText += ` AND price_per_night <= $${paramCount}`;
      queryParams.push(maxPrice);
    }

    if (guests) {
      paramCount++;
      queryText += ` AND max_guests >= $${paramCount}`;
      queryParams.push(guests);
    }

    // Add sorting and pagination
    queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    queryParams.push(limit, offset);

    // Execute query
    const result = await db.query(queryText, queryParams);

    // Get total count for pagination
    let countQuery = 'SELECT COUNT(*) FROM houses WHERE is_active = true';
    const countParams = [];
    let countParamIndex = 0;

    if (city) {
      countParamIndex++;
      countQuery += ` AND LOWER(city) LIKE LOWER($${countParamIndex})`;
      countParams.push(`%${city}%`);
    }

    if (minPrice) {
      countParamIndex++;
      countQuery += ` AND price_per_night >= $${countParamIndex}`;
      countParams.push(minPrice);
    }

    if (maxPrice) {
      countParamIndex++;
      countQuery += ` AND price_per_night <= $${countParamIndex}`;
      countParams.push(maxPrice);
    }

    if (guests) {
      countParamIndex++;
      countQuery += ` AND max_guests >= $${countParamIndex}`;
      countParams.push(guests);
    }

    const countResult = await db.query(countQuery, countParams);
    const totalCount = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalCount / limit);

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
        }
      }
    });

  } catch (error) {
    console.error('Get houses error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching houses'
    });
  }
});

// Get single house by ID (public endpoint - only active houses)
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
        h.id, h.title, h.description, h.address, h.city, h.state, h.country, h.zip_code,
        h.price_per_night, h.max_guests, h.bedrooms, h.bathrooms, h.square_feet,
        h.wifi, h.parking, h.pool, h.hot_tub, h.fireplace, h.air_conditioning, 
        h.heating, h.kitchen, h.washer_dryer, h.tv, h.images, h.created_at,
        COALESCE(
          JSON_AGG(
            JSON_BUILD_OBJECT('name', ha.name, 'description', ha.description)
          ) FILTER (WHERE ha.id IS NOT NULL), 
          '[]'
        ) as custom_amenities
      FROM houses h
      LEFT JOIN house_amenities ha ON h.id = ha.house_id
      WHERE h.id = $1 AND h.is_active = true
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
    console.error('Get house error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching house'
    });
  }
});

// Get house availability for date range
router.get('/houses/:id/availability', [
  param('id').isInt({ min: 1 }),
  query('startDate').isISO8601().toDate(),
  query('endDate').isISO8601().toDate()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid parameters',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Check if house exists and is active
    const houseResult = await db.query(
      'SELECT id FROM houses WHERE id = $1 AND is_active = true',
      [id]
    );

    if (houseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'House not found'
      });
    }

    // Check for existing bookings
    const bookingResult = await db.query(`
      SELECT id, check_in_date, check_out_date 
      FROM bookings 
      WHERE house_id = $1 
        AND status != 'cancelled'
        AND (
          (check_in_date <= $2 AND check_out_date > $2) OR
          (check_in_date < $3 AND check_out_date >= $3) OR
          (check_in_date >= $2 AND check_out_date <= $3)
        )
    `, [id, startDate, endDate]);

    // Check for blocked dates
    const blockedResult = await db.query(`
      SELECT blocked_date, reason
      FROM blocked_dates 
      WHERE house_id = $1 
        AND blocked_date >= $2 
        AND blocked_date < $3
    `, [id, startDate, endDate]);

    const isAvailable = bookingResult.rows.length === 0 && blockedResult.rows.length === 0;

    res.json({
      success: true,
      data: {
        available: isAvailable,
        conflicts: {
          bookings: bookingResult.rows,
          blockedDates: blockedResult.rows
        }
      }
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking availability'
    });
  }
});

// Create a new booking (public endpoint)
router.post('/bookings', [
  body('houseId').isInt({ min: 1 }),
  body('guestEmail').isEmail().normalizeEmail(),
  body('guestFirstName').trim().isLength({ min: 1 }),
  body('guestLastName').trim().isLength({ min: 1 }),
  body('guestPhone').optional().trim(),
  body('checkInDate').isISO8601().toDate(),
  body('checkOutDate').isISO8601().toDate(),
  body('specialRequests').optional().trim()
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
      houseId,
      guestEmail,
      guestFirstName,
      guestLastName,
      guestPhone,
      checkInDate,
      checkOutDate,
      specialRequests
    } = req.body;

    // Validate date range
    if (new Date(checkInDate) >= new Date(checkOutDate)) {
      return res.status(400).json({
        success: false,
        message: 'Check-out date must be after check-in date'
      });
    }

    // Check if house exists and is active
    const houseResult = await db.query(
      'SELECT id, title, price_per_night FROM houses WHERE id = $1 AND is_active = true',
      [houseId]
    );

    if (houseResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'House not found or not available for booking'
      });
    }

    const house = houseResult.rows[0];

    // Check availability one more time
    const conflictResult = await db.query(`
      SELECT id FROM bookings 
      WHERE house_id = $1 
        AND status != 'cancelled'
        AND (
          (check_in_date <= $2 AND check_out_date > $2) OR
          (check_in_date < $3 AND check_out_date >= $3) OR
          (check_in_date >= $2 AND check_out_date <= $3)
        )
      UNION
      SELECT -1 as id FROM blocked_dates 
      WHERE house_id = $1 
        AND blocked_date >= $2 
        AND blocked_date < $3
      LIMIT 1
    `, [houseId, checkInDate, checkOutDate]);

    if (conflictResult.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Selected dates are not available'
      });
    }

    // Calculate total nights and amount
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const totalNights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const totalAmount = totalNights * parseFloat(house.price_per_night);

    // Create booking
    const bookingResult = await db.query(`
      INSERT INTO bookings (
        house_id, guest_email, guest_first_name, guest_last_name, guest_phone,
        check_in_date, check_out_date, total_nights, total_amount, special_requests
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *
    `, [
      houseId, guestEmail, guestFirstName, guestLastName, guestPhone,
      checkInDate, checkOutDate, totalNights, totalAmount, specialRequests
    ]);

    const booking = bookingResult.rows[0];

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      data: {
        booking: {
          id: booking.id,
          houseId: booking.house_id,
          houseTitle: house.title,
          guestEmail: booking.guest_email,
          guestFirstName: booking.guest_first_name,
          guestLastName: booking.guest_last_name,
          guestPhone: booking.guest_phone,
          checkInDate: booking.check_in_date,
          checkOutDate: booking.check_out_date,
          totalNights: booking.total_nights,
          totalAmount: booking.total_amount,
          status: booking.status,
          specialRequests: booking.special_requests,
          createdAt: booking.created_at
        }
      }
    });

  } catch (error) {
    console.error('Create booking error:', error);
    
    // Handle unique constraint violation for overlapping bookings
    if (error.code === '23505' && error.constraint === 'no_overlapping_bookings') {
      return res.status(409).json({
        success: false,
        message: 'Selected dates are no longer available'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating booking'
    });
  }
});

// Get booking by ID (public lookup)
router.get('/bookings/:id', [
  param('id').isInt({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid booking ID',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const result = await db.query(`
      SELECT 
        b.id, b.guest_email, b.guest_first_name, b.guest_last_name, b.guest_phone,
        b.check_in_date, b.check_out_date, b.total_nights, b.total_amount,
        b.status, b.special_requests, b.created_at,
        h.title as house_title, h.address as house_address, h.city as house_city
      FROM bookings b
      JOIN houses h ON b.house_id = h.id
      WHERE b.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: {
        booking: result.rows[0]
      }
    });

  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking'
    });
  }
});

module.exports = router;
