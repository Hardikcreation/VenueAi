const express = require('express');
const { getStats, getAllUsers, getAllVendors, updateProductStatus, deleteUser } = require('../controllers/adminController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const router = express.Router();

router.get('/stats', verifyToken, checkRole('admin'), getStats);
router.get('/users', verifyToken, checkRole('admin'), getAllUsers);
router.get('/vendors', verifyToken, checkRole('admin'), getAllVendors);
router.patch('/products/:id/status', verifyToken, checkRole('admin'), updateProductStatus);
router.delete('/users/:id', verifyToken, checkRole('admin'), deleteUser);

module.exports = router;
