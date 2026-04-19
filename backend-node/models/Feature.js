const mongoose = require('mongoose');

const featureSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    parking: Boolean,
    rooms: Boolean,
    pool: Boolean,
    hall: Boolean,
    resort: Boolean
});

module.exports = mongoose.model('Feature', featureSchema);