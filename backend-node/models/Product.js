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
    city: {
        type: String,
        default: 'Bhopal'
    },
    category: String,
    listing_type: {
        type: String,
        default: 'venue'
    },
    zone: String,
    landmark: String,
    service_area: String,

    latitude: Number,
    longitude: Number,
    street_view_image: String,

    occasion_types: [String],
    occasion_focus: [String],
    features: [String],
    combo_items: [String],

    capacity: Number,
    price: {
        type: Number,
        default: 0
    },

    base_price: {
        type: Number,
        default: 0
    },
    price_unit: {
        type: String,
        default: 'Starting Price'
    },
    tag_label: String,
    pure_veg: {
        type: Boolean,
        default: false
    },
    rating: {
        type: Number,
        default: 4.2
    },
    review_count: {
        type: Number,
        default: 0
    },
    budget_tier: {
        type: String,
        default: 'mid'
    },
    premium_pick: {
        type: Boolean,
        default: false
    },
    available_today: {
        type: Boolean,
        default: false
    },
    combo_package: {
        type: Boolean,
        default: false
    },
    combo_name: String,
    combo_discount_price: Number,
    combo_original_price: Number,
    trending_score: {
        type: Number,
        default: 0
    },
    recommended_score: {
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
    location: 'text',
    category: 'text',
    city: 'text'
});

module.exports = mongoose.model('Product', productSchema);
