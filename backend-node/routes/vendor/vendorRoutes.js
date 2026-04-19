const express = require('express');
const multer = require('multer');

const {
  addProduct,
  getMyVenue,
  updateMyVenue,
  getProfile,
  updateProfile,
  uploadVenueImages,
  getVenueImages,
  uploadVerificationDocument
} = require('../../controllers/vendorController');

const verifyToken = require('../../middleware/authMiddleware');
const checkRole = require('../../middleware/roleMiddleware');

const router = express.Router();

/**
 * 📸 Multer Configuration
 * Using memory storage (BEST for Cloudinary uploads)
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const ext = file.originalname.toLowerCase().split('.').pop();
    const isValidExt = allowedTypes.test(ext);
    const isValidMime = allowedTypes.test(file.mimetype);

    if (isValidExt && isValidMime) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (jpeg, jpg, png, webp) are allowed'));
    }
  }
});

/**
 * 📂 Upload Fields
 */
const venueUpload = upload.fields([
  { name: 'image', maxCount: 1 },     // Cover image
  { name: 'gallery', maxCount: 6 }    // Gallery images
]);

/**
 * 👤 Vendor Profile Routes
 */

// Get vendor profile
router.get(
  '/profile',
  verifyToken,
  checkRole('vendor'),
  getProfile
);

// Update vendor profile
router.put(
  '/profile',
  verifyToken,
  checkRole('vendor'),
  updateProfile
);

/**
 * 🏢 Venue (Product) Routes
 */

// Get vendor's venue
router.get(
  '/my-venue',
  verifyToken,
  checkRole('vendor'),
  getMyVenue
);

// Update vendor's venue
router.put(
  '/my-venue',
  verifyToken,
  checkRole('vendor'),
  venueUpload,
  updateMyVenue
);

// Add new venue (only one allowed per vendor)
router.post(
  '/venue',
  verifyToken,
  checkRole('vendor'),
  venueUpload,
  addProduct
);

/**
 * 📸 Image Upload Routes
 */
const imageUpload = upload.array('images', 10); // Allow up to 10 images

router.post(
  '/images',
  verifyToken,
  checkRole('vendor'),
  imageUpload,
  uploadVenueImages
);

router.get(
  '/images',
  verifyToken,
  checkRole('vendor'),
  getVenueImages
);

/**
 * 🔐 Verification Document Routes
 */
const docUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|jpg|jpeg|png|docx/;
    const ext = file.originalname.toLowerCase().split('.').pop();
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, JPG, PNG, DOCX files are allowed'));
    }
  }
});

router.post(
  '/verification',
  verifyToken,
  checkRole('vendor'),
  docUpload.single('document'),
  uploadVerificationDocument
);

module.exports = router;