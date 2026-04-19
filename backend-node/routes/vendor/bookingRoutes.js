const router4 = require('express').Router();
const bookingController = require('../../controllers/vendor/bookingController');
const verifyToken = require('../../middleware/authMiddleware');
const checkRole = require('../../middleware/roleMiddleware');

router4.get(
  '/availability/:productId',
  bookingController.getAvailability
);

router4.post(
  '/',
  verifyToken,
  checkRole('user'),
  bookingController.createBooking
);

router4.get(
  '/my',
  verifyToken,
  checkRole('user'),
  bookingController.getMyBookings
);

// Get bookings for vendor
router4.get(
  '/vendor',
  verifyToken,
  checkRole('vendor'),
  bookingController.getVendorBookings
);

// Update booking status
router4.patch(
  '/:id/status',
  verifyToken,
  checkRole('vendor'),
  bookingController.updateBookingStatus
);

router4.post(
  '/update-status',
  verifyToken,
  checkRole('vendor'),
  bookingController.updateBookingStatus
);

module.exports = router4;
