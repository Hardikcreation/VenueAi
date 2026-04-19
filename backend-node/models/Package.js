const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String,
    services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    price: Number
});

module.exports = mongoose.model('Package', packageSchema);