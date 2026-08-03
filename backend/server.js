const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use('/restaurant', express.static(path.join(__dirname, '../frontend/restaurant-cafe')));
app.use('/gym', express.static(path.join(__dirname, '../frontend/gym-fitness')));
app.use('/salon', express.static(path.join(__dirname, '../frontend/salon-spa')));
app.use('/shared', express.static(path.join(__dirname, '../frontend/shared')));
app.use('/admin', express.static(path.join(__dirname, '../frontend/admin')));
// ✅ IMAGES FOLDER SERVE KARNE KE LIYE
app.use('/images', express.static(path.join(__dirname, '../frontend/images')));

// ============ MODELS ============

// User Schema
const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    password: String,
    phone: String,
    role: { type: String, default: 'user' },
    createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// Booking Schema
const bookingSchema = new mongoose.Schema({
    businessType: String,
    name: String,
    email: String,
    phone: String,
    date: String,
    time: String,
    guests: String,
    service: String,
    occasion: String,
    specialRequests: String,
    createdAt: { type: Date, default: Date.now }
});
const Booking = mongoose.model('Booking', bookingSchema);

// Contact Schema
const contactSchema = new mongoose.Schema({
    businessType: String,
    name: String,
    email: String,
    phone: String,
    message: String,
    createdAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// ============ AUTH ROUTES ============

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, password: hashedPassword, phone });
        await user.save();
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123');
        res.json({ success: true, token, user: { id: user._id, name, email, role: user.role } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('📧 Login attempt:', email);
        
        const user = await User.findOne({ email });
        
        if (!user) {
            console.log('❌ User not found:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        const isValid = await bcrypt.compare(password, user.password);
        
        if (!isValid) {
            console.log('❌ Invalid password for:', email);
            return res.status(401).json({ 
                success: false, 
                message: 'Invalid credentials' 
            });
        }
        
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role }, 
            process.env.JWT_SECRET || 'secret123',
            { expiresIn: '7d' }
        );
        
        console.log('✅ Login successful:', email);
        
        res.json({ 
            success: true, 
            token: token,
            user: { 
                id: user._id, 
                name: user.name, 
                email: user.email, 
                phone: user.phone,
                role: user.role 
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Server error' 
        });
    }
});

// ============ CONTACT API ============
app.post('/api/contact', async (req, res) => {
    try {
        console.log('📧 Contact:', req.body);
        const contact = new Contact(req.body);
        await contact.save();
        console.log('✅ Contact saved');
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// ============ BOOKING API ============
app.post('/api/bookings', async (req, res) => {
    try {
        console.log('📅 Booking:', req.body);
        const booking = new Booking(req.body);
        await booking.save();
        console.log('✅ Booking saved');
        res.json({ success: true, message: 'Booking successful!' });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
});

// ============ ADMIN MIDDLEWARE ============
const isAdmin = async (req, res, next) => {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');
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

// ============ ADMIN ROUTES ============

// Admin Stats
app.get('/api/admin/stats', isAdmin, async (req, res) => {
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
            data: { totalBookings, totalContacts, todayBookings, recentBookings }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin - Get All Bookings
app.get('/api/admin/bookings', isAdmin, async (req, res) => {
    try {
        const bookings = await Booking.find().sort({ createdAt: -1 });
        res.json({ success: true, data: bookings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin - Delete Booking
app.delete('/api/admin/bookings/:id', isAdmin, async (req, res) => {
    try {
        await Booking.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Booking deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin - Get All Contacts
app.get('/api/admin/contacts', isAdmin, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json({ success: true, data: contacts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Admin - Delete Contact
app.delete('/api/admin/contacts/:id', isAdmin, async (req, res) => {
    try {
        await Contact.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Contact deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ GET ADMIN PROFILE ============
app.get('/api/admin/profile', isAdmin, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json({ success: true, user });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ UPDATE ADMIN PROFILE ============
app.put('/api/admin/profile', isAdmin, async (req, res) => {
    try {
        const { name, email, phone, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        
        if (currentPassword && newPassword) {
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return res.status(401).json({ success: false, message: 'Current password is incorrect' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
            }
            user.password = await bcrypt.hash(newPassword, 10);
        }
        
        await user.save();
        
        res.json({ 
            success: true, 
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============ TEST API ============
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API Working!',
        mongodb: mongoose.connection.readyState === 1 ? 'Connected ✅' : 'Disconnected ❌'
    });
});

// ============ HOME PAGE ============
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============ CREATE ADMIN USER (ONLY ONCE) ============
const createAdminUser = async () => {
    try {
        const adminExists = await User.findOne({ email: 'admin@business.com' });
        
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new User({
                name: 'Admin User',
                email: 'admin@business.com',
                password: hashedPassword,
                phone: '9431879807',
                role: 'admin'
            });
            await admin.save();
            console.log('✅ Admin user created!');
            console.log('   Email: admin@business.com');
            console.log('   Password: admin123');
        } else {
            console.log('✅ Admin user already exists');
        }
    } catch (error) {
        console.error('Error creating admin:', error);
    }
};

// ============ MONGODB CONNECTION ============
mongoose.connect('mongodb://localhost:27017/localbusiness')
    .then(() => {
        console.log('✅ MongoDB Connected');
        createAdminUser();
    })
    .catch(err => console.log('❌ MongoDB Error:', err.message));

// ============ START SERVER ============
const PORT = 5000;
app.listen(PORT, () => {
    console.log('\n========================================');
    console.log('✅ SERVER RUNNING ON http://localhost:5000');
    console.log('========================================');
    console.log(`🍽️ Restaurant: http://localhost:5000/restaurant`);
    console.log(`💪 Gym: http://localhost:5000/gym`);
    console.log(`💇 Salon: http://localhost:5000/salon`);
    console.log(`👑 Admin Login: http://localhost:5000/admin/login.html`);
    console.log('========================================');
    console.log('👑 Credentials: admin@business.com / admin123');
    console.log('========================================\n');
});