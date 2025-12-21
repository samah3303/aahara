const express = require('express');
const router = express.Router();
const { all, get, run } = require('../config/database');

// --- Centers ---

// Search Centers
router.get('/centers', async (req, res) => {
    try {
        const { pincode, city } = req.query;
        let sql = "SELECT * FROM centers WHERE is_active = 1";
        const params = [];

        if (pincode) {
            sql += " AND pincode LIKE ?";
            params.push(`${pincode}%`);
        } else if (city) {
            sql += " AND city LIKE ?";
            params.push(`%${city}%`);
        }

        const centers = await all(sql, params);
        res.json({ centers });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Center Details
router.get('/centers/:id', async (req, res) => {
    try {
        const center = await get("SELECT * FROM centers WHERE id = ?", [req.params.id]);
        if (!center) return res.status(404).json({ error: "Center not found" });
        res.json({ center });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Services for a Center
router.get('/centers/:id/services', async (req, res) => {
    try {
        const services = await all("SELECT * FROM services WHERE center_id = ?", [req.params.id]);
        res.json({ center_id: req.params.id, services });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Bookings ---

// Check Slots (Simplified: Check if open - typically we'd check overlap)
// For Frozen Box, maybe we just assume availability for MVP or check quantity?
// We'll return "Available" for any future date for now.
router.get('/centers/:id/slots', async (req, res) => {
    try {
        // Mock response
        const { date } = req.query;
        res.json({
            center_id: req.params.id,
            date,
            slots: [
                { id: 'morning', label: 'Morning (9AM - 12PM)', available: true },
                { id: 'afternoon', label: 'Afternoon (1PM - 5PM)', available: true }
            ]
        });
    } catch (err) {
         res.status(500).json({ error: err.message });
    }
});

// Create Booking
router.post('/bookings', async (req, res) => {
    try {
        const { user_phone, user_name, center_id, service_id, start_time } = req.body;

        // 1. Find or Create User
        let user = await get("SELECT * FROM users WHERE phone_number = ?", [user_phone]);
        if (!user) {
            const result = await run("INSERT INTO users (phone_number, name) VALUES (?, ?)", [user_phone, user_name || 'Unknown']);
            user = { id: result.id };
        }

        // 2. Create Booking
        const result = await run(
            `INSERT INTO bookings (user_id, center_id, service_id, booking_time, status) 
             VALUES (?, ?, ?, ?, 'CONFIRMED')`,
            [user.id, center_id, service_id, start_time]
        );

        res.json({ 
            success: true, 
            booking_id: result.id, 
            message: "Booking confirmed locally." 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// List User Bookings
router.get('/users/:phone/bookings', async (req, res) => {
    try {
        const user = await get("SELECT id FROM users WHERE phone_number = ?", [req.params.phone]);
        if (!user) return res.json({ bookings: [] });

        const bookings = await all(
            `SELECT b.id, b.booking_time, b.status, c.name as center_name, s.name as service_name 
             FROM bookings b
             JOIN centers c ON b.center_id = c.id
             JOIN services s ON b.service_id = s.id
             WHERE b.user_id = ? ORDER BY b.created_at DESC`,
            [user.id]
        );
        res.json({ bookings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cancel Booking
router.patch('/bookings/:id', async (req, res) => {
    try {
        const { status } = req.body; // Expect 'CANCELLED'
        await run("UPDATE bookings SET status = ? WHERE id = ?", [status, req.params.id]);
        res.json({ success: true, message: "Booking updated" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- Admin ---
router.get('/admin/bookings', async (req, res) => {
    try {
        const bookings = await all(
            `SELECT b.id, b.booking_time, b.status, c.name as center_name, s.name as service_name, u.name as user_name, u.phone_number as user_phone
             FROM bookings b
             JOIN centers c ON b.center_id = c.id
             JOIN services s ON b.service_id = s.id
             JOIN users u ON b.user_id = u.id
             ORDER BY b.created_at DESC`
        );
        res.json({ bookings });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/admin/stats', async (req, res) => {
    try {
        // Real counts
        const centersData = await get("SELECT COUNT(*) as count FROM centers");
        const bookingsData = await get("SELECT COUNT(*) as count FROM bookings");
        
        // Dummy Revenue (Randomized for demo)
        const revenue = 12500; 
        
        res.json({
            centers: centersData.count,
            bookings: bookingsData.count,
            revenue: revenue
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/admin/logs', async (req, res) => {
    // Dummy Chat Logs
    res.json({
        logs: [
            { time: 'Just now', user: '919876...', message: 'What is the rate for Retort?', type: 'incoming' },
            { time: 'Just now', user: 'Bot', message: 'Retort packaging is ₹1500/cycle (120 mins).', type: 'outgoing' },
            { time: '2 mins ago', user: '919999...', message: 'Book Freeze Drying for tomorrow', type: 'incoming' },
            { time: '2 mins ago', user: 'Bot', message: 'Confirmed. Slot: Tomorrow 10 AM.', type: 'outgoing' }
        ]
    });
});

module.exports = router;
