const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    vendor_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },

    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        trim: true
    },

    image: String,
    gallery_images: [String],
    video_url: String,

    location: String,
    category: String,
    zone: String,
    landmark: String,

    latitude: Number,
    longitude: Number,
    street_view_image: String,

    occasion_types: [String],
    features: [String],

    capacity: Number,
    price: {
        type: Number,
        default: 0
    },

    base_price: {
        type: Number,
        default: 0
    },

    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    }

}, { timestamps: true });

// 🔥 Text Search Index
productSchema.index({
    title: 'text',
    description: 'text',
    location: 'text'
});

module.exports = mongoose.model('Product', productSchema);
