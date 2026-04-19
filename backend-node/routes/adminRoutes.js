const express = require('express');
const {
    getStats,
    getAllUsers,
    getAllVendors,
    getVendorDetails,
    approveVendor,
    rejectVendor,
    deleteUser,
    updateProductStatus // Added updateProductStatus import
} = require('../controllers/adminController');

const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');

const router = express.Router();

// 📊 Dashboard
router.get('/stats', verifyToken, checkRole('admin'), getStats);

// 👥 Users
router.get('/users', verifyToken, checkRole('admin'), getAllUsers);
router.delete('/users/:id', verifyToken, checkRole('admin'), deleteUser);

// 🏢 Vendors
router.get('/vendors', verifyToken, checkRole('admin'), getAllVendors);
router.get('/vendors/:vendorId', verifyToken, checkRole('admin'), getVendorDetails);
router.patch('/vendors/:vendorId/approve', verifyToken, checkRole('admin'), approveVendor);
router.delete('/vendors/:vendorId/reject', verifyToken, checkRole('admin'), rejectVendor);

// 🏷️ Products
router.patch('/products/:id/status', verifyToken, checkRole('admin'), updateProductStatus);

module.exports = router;
