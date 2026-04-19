const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: Date,
    booking_name: String,
    booking_email: String,
    booking_phone: String,
    event_date: Date,
    event_time: String,
    guest_count: Number,
    occasion_type: String,
    payment_method: {
        type: String,
        enum: ['on_visit', 'card', 'upi', 'cash'],
        default: 'on_visit'
    },
    payment_status: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    message: String,
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    rejection_reason: String,
    selected_services: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Service' }],
    selected_package: { type: mongoose.Schema.Types.ObjectId, ref: 'Package' }
}, { timestamps: true });

module.exports = mongoose.model('Booking', bookingSchema);
