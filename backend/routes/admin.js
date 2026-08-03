const express = require('express');
const Booking = require('../models/Booking');
const Contact = require('../models/Contact');
const User = require('../models/User');
const router = express.Router();

// Admin middleware - Check if user is admin
const isAdmin = async (req, res, next) => {
    const token = req.headers.authorization;
    
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).json({ success: false, message: 'Not authorized as admin' });
        }
        
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// ============ STATISTICS ============
router.get('/stats', isAdmin, async (req, res) => {
    try {
        const totalBookings = await Booking.countDocuments();
        const totalContacts = await Contact.countDocuments();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todayBookings = await Booking.countDocuments({
            createdAt: { $gte: today }
        });
        
        const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);
        
        res.json({
            success: true,
            data: {
                totalBookings,
                totalContacts,
                todayBookings,
                recentBookings
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ GET ALL BOOKINGS ============
router.get('/bookings', isAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ GET BOOKING BY ID ============
router.get('/bookings/:id', isAdmin, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }
        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ UPDATE BOOKING ============
router.put('/bookings/:id', isAdmin, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ success: true, data: booking });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ DELETE BOOKING ============
router.delete('/bookings/:id', isAdmin, async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ GET ALL CONTACTS ============
router.get('/contacts', isAdmin, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ DELETE CONTACT ============
router.delete('/contacts/:id', isAdmin, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Contact deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ GET ALL USERS ============
router.get('/users', isAdmin, async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json({ success: true, data: users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;