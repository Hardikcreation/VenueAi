const express = require('express');
const { searchVenues } = require('../../controllers/searchController');

const router = express.Router();

// 🔍 Search venues
router.get('/', searchVenues);

module.exports = router;