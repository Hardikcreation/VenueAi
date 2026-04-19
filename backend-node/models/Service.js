const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    price: Number,
    is_available: { type: Boolean, default: true }
});

module.exports = mongoose.model('Service', serviceSchema);