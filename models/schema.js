const { run } = require('../config/database');

const createSchema = async () => {
    try {
        // Users
        await run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            phone_number TEXT UNIQUE NOT NULL,
            name TEXT,
            default_pincode TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Centers
        await run(`CREATE TABLE IF NOT EXISTS centers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            address TEXT,
            city TEXT,
            pincode TEXT,
            latitude REAL,
            longitude REAL,
            rating REAL,
            is_active BOOLEAN DEFAULT 1
        )`);

        // Services
        await run(`CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            center_id INTEGER,
            name TEXT NOT NULL,
            description TEXT,
            price REAL,
            duration_minutes INTEGER,
            FOREIGN KEY(center_id) REFERENCES centers(id)
        )`);

        // Bookings
        await run(`CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            center_id INTEGER,
            service_id INTEGER,
            booking_time DATETIME,
            quantity TEXT,
            product_type TEXT,
            status TEXT DEFAULT 'PENDING',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(id),
            FOREIGN KEY(center_id) REFERENCES centers(id),
            FOREIGN KEY(service_id) REFERENCES services(id)
        )`);

        console.log("Schema created successfully.");
    } catch (err) {
        console.error("Error creating schema:", err);
    }
};

if (require.main === module) {
    createSchema();
}

module.exports = { createSchema };
