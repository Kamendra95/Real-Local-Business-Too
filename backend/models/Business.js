const mongoose = require('mongoose');

const BusinessSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['restaurant', 'gym', 'salon'],
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    phone: String,
    email: String,
    hours: {
        monday: String,
        tuesday: String,
        wednesday: String,
        thursday: String,
        friday: String,
        saturday: String,
        sunday: String
    },
    services: [{
        name: String,
        price: Number,
        duration: String,
        description: String
    }],
    socialMedia: {
        facebook: String,
        instagram: String,
        twitter: String
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Business', BusinessSchema);