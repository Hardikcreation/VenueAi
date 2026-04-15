const { getPool } = require('../config/db');
const { formatProduct } = require('../utils/productFormatter');
const { parseList, serializeList } = require('../utils/productFormatter');

const BOOKING_PAYMENT_OPTIONS = ['on_visit', 'upi', 'card', 'net_banking'];

const getVenueAvailability = async (req, res) => {
  try {
    const [products] = await getPool().query(
      'SELECT id, title, status FROM products WHERE id = ?',
      [req.params.productId]
    );

    if (products.length === 0 || products[0].status !== 'approved') {
      return res.status(404).json({ message: 'Approved venue not found' });
    }

    const [bookings] = await getPool().query(
      `SELECT id, event_date, event_time, status
       FROM bookings
       WHERE product_id = ?
         AND status IN ('pending', 'accepted', 'completed')
       ORDER BY event_date ASC, event_time ASC`,
      [req.params.productId]
    );

    return res.json({
      venueId: Number(req.params.productId),
      blockedSlots: bookings.map((booking) => ({
        id: booking.id,
        event_date: booking.event_date,
        event_time: booking.event_time,
        status: booking.status
      }))
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const createBooking = async (req, res) => {
  try {
    const {
      productId,
      bookingName,
      bookingEmail,
      bookingPhone,
      eventDate,
      eventTime,
      guestCount,
      occasionType,
      selectedServices,
      paymentMethod,
      message
    } = req.body;

    if (!productId || !bookingName || !bookingEmail || !eventDate || !eventTime) {
      return res.status(400).json({ message: 'Venue, name, email, event date, and event time are required' });
    }

    if (paymentMethod && !BOOKING_PAYMENT_OPTIONS.includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method selected' });
    }

    if ((paymentMethod || 'on_visit') !== 'on_visit') {
      return res.status(400).json({ message: 'Only pay on visit is available right now. Online payment will be enabled later.' });
    }

    const [products] = await getPool().query(
      `SELECT p.*, v.business_name
       FROM products p
       JOIN vendors v ON v.id = p.vendor_id
       WHERE p.id = ? AND p.status = 'approved'`,
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: 'Approved venue not found' });
    }

    const [conflictingBookings] = await getPool().query(
      `SELECT id
       FROM bookings
       WHERE product_id = ?
         AND event_date = ?
         AND event_time = ?
         AND status IN ('pending', 'accepted', 'completed')`,
      [productId, eventDate, eventTime]
    );

    if (conflictingBookings.length > 0) {
      return res.status(409).json({ message: 'This date and time is already requested or booked. Please choose another slot.' });
    }

    const [result] = await getPool().query(
      `INSERT INTO bookings (
        product_id, user_id, booking_name, booking_email, booking_phone,
        event_date, event_time, guest_count, occasion_type, selected_services,
        payment_method, payment_status, message, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        productId,
        req.user.id,
        bookingName,
        bookingEmail,
        bookingPhone || null,
        eventDate,
        eventTime,
        guestCount || null,
        occasionType || null,
        serializeList(parseList(selectedServices)),
        paymentMethod || 'on_visit',
        'pending',
        message || null
      ]
    );

    return res.status(201).json({
      message: 'Booking request sent. After the vendor accepts it within 24 hours, your booking will be confirmed.',
      bookingId: result.insertId
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getMyBookings = async (req, res) => {
  try {
    const [bookings] = await getPool().query(
      `SELECT b.*, p.title, p.image, p.gallery_images, p.video_url, p.location, p.category,
        p.occasion_types, p.features, p.capacity, p.price, v.business_name
       FROM bookings b
       JOIN products p ON p.id = b.product_id
       JOIN vendors v ON v.id = p.vendor_id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [req.user.id]
    );

    return res.json(
      bookings.map((booking) => ({
        ...booking,
        selected_services: parseList(booking.selected_services),
        venue: formatProduct({
          id: booking.product_id,
          title: booking.title,
          image: booking.image,
          gallery_images: booking.gallery_images,
          video_url: booking.video_url,
          location: booking.location,
          category: booking.category,
          occasion_types: booking.occasion_types,
          features: booking.features,
          capacity: booking.capacity,
          price: booking.price,
          business_name: booking.business_name
        })
      }))
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const getVendorBookings = async (req, res) => {
  try {
    const [bookings] = await getPool().query(
      `SELECT b.*, p.title, p.image, p.category, p.location, p.occasion_types,
        u.name AS customer_name, u.email AS customer_account_email
       FROM bookings b
       JOIN products p ON p.id = b.product_id
       JOIN vendors v ON v.id = p.vendor_id
       JOIN users u ON u.id = b.user_id
       WHERE v.user_id = ?
       ORDER BY
         CASE b.status
           WHEN 'pending' THEN 1
           WHEN 'accepted' THEN 2
           WHEN 'completed' THEN 3
           ELSE 4
         END,
         b.created_at DESC`,
      [req.user.id]
    );

    return res.json(
      bookings.map((booking) => ({
        ...booking,
        selected_services: parseList(booking.selected_services)
      }))
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid booking status' });
    }

    const [bookings] = await getPool().query(
      `SELECT b.id
       FROM bookings b
       JOIN products p ON p.id = b.product_id
       JOIN vendors v ON v.id = p.vendor_id
       WHERE b.id = ? AND v.user_id = ?`,
      [id, req.user.id]
    );

    if (bookings.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    await getPool().query('UPDATE bookings SET status = ? WHERE id = ?', [status, id]);

    return res.json({ message: `Booking ${status} successfully` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createBooking, getMyBookings, getVendorBookings, getVenueAvailability, updateBookingStatus };
