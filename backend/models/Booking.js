const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    businessType: {
        type: String,
        enum: ['restaurant', 'gym', 'salon'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    guests: {
        type: String
    },
    service: {
        type: String
    },
    occasion: {
        type: String
    },
    specialRequests: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', BookingSchema);