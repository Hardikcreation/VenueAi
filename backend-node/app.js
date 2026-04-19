const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

require('dotenv').config();

// 📦 Routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const vendorRoutes = require('./routes/vendor/vendorRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/vendor/bookingRoutes');
const searchRoutes = require('./routes/vendor/searchRoutes');

const app = express();


// ===============================
// 🔐 SECURITY MIDDLEWARES
// ===============================
app.use(helmet()); // secure headers

app.use(cors({
  origin: '*', // change in production
  credentials: true
}));


// ===============================
// 📊 RATE LIMITING
// ===============================
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100 // limit per IP
});
app.use('/api', limiter);


// ===============================
// 🧾 BODY PARSER
// ===============================
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


// ===============================
// 📜 LOGGER
// ===============================
app.use(morgan('dev'));


// ===============================
// 🚏 ROUTES
// ===============================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);


// ===============================
// ❤️ HEALTH CHECK
// ===============================
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Venue AI API running',
    timestamp: new Date()
  });
});


// ===============================
// ❌ 404 HANDLER
// ===============================
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});


// ===============================
// 💥 GLOBAL ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {
  console.error('🔥 Error:', err);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});


module.exports = app;