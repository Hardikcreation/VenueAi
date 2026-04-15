const express = require('express');
const multer = require('multer');
const path = require('path');
const { addProduct, getMyVenue, updateMyVenue, getProfile, updateProfile } = require('../controllers/vendorController');
const verifyToken = require('../middleware/authMiddleware');
const checkRole = require('../middleware/roleMiddleware');
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/profile', verifyToken, checkRole('vendor'), getProfile);
router.put('/profile', verifyToken, checkRole('vendor'), updateProfile);
const venueUpload = upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 6 }
]);

router.get('/my-venue', verifyToken, checkRole('vendor'), getMyVenue);
router.put('/my-venue', verifyToken, checkRole('vendor'), venueUpload, updateMyVenue);
router.post('/products', verifyToken, checkRole('vendor'), venueUpload, addProduct);
router.post('/add', verifyToken, checkRole('vendor'), venueUpload, addProduct);
router.get('/my-listings', verifyToken, checkRole('vendor'), getMyVenue);

module.exports = router;
