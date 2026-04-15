const express = require('express');
const {
  createBooking,
  getMyBookings,
  getVendorBookings,
  getVenueAvailability,
  updateBookingStatus
} = require('../controllers/bookingController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/availability/:productId', getVenueAvailability);
router.post('/', verifyToken, checkRole('user'), createBooking);
router.get('/my', verifyToken, checkRole('user'), getMyBookings);
router.get('/vendor', verifyToken, checkRole('vendor'), getVendorBookings);
router.patch('/:id/status', verifyToken, checkRole('vendor'), updateBookingStatus);

module.exports = router;
