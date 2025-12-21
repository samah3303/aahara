const { run } = require('../config/database');
const { createSchema } = require('./schema');

const seedData = async () => {
    try {
        await createSchema();

        // Clear existing data (optional, for dev)
        await run("DELETE FROM services");
        await run("DELETE FROM centers");
        await run("DELETE FROM bookings");
        await run("DELETE FROM users");

        // Centers
        const center1 = await run(`INSERT INTO centers (name, address, city, pincode, rating) 
                                   VALUES ('Ahara Processing Unit A', 'Industrial Area', 'Kozhikode', '673001', 4.8)`);
        const center2 = await run(`INSERT INTO centers (name, address, city, pincode, rating) 
                                   VALUES ('Ahara Processing Unit B', 'Tech Park', 'Vatakara', '673101', 4.5)`);
        
        // Services for Center 1
        const s1 = await run(`INSERT INTO services (center_id, name, description, price, duration_minutes) 
                   VALUES (?, 'Retort Packaging', 'High temperature food sterilization', 1500, 120)`, [center1.id]);
        const s2 = await run(`INSERT INTO services (center_id, name, description, price, duration_minutes) 
                   VALUES (?, 'Freeze Drying', 'Low temp dehydration for preservation', 2500, 360)`, [center1.id]);
        
        // Services for Center 2
        const s3 = await run(`INSERT INTO services (center_id, name, description, price, duration_minutes) 
                   VALUES (?, 'Dehydration', 'Hot air drying service', 800, 180)`, [center2.id]);
        const s4 = await run(`INSERT INTO services (center_id, name, description, price, duration_minutes) 
                    VALUES (?, 'Powdering', 'Grinding dried food to powder', 500, 60)`, [center2.id]);

        // Sample User
        const user = await run(`INSERT INTO users (phone_number, name) VALUES ('919876543210', 'Rahul Test')`);

        // Sample Bookings (Using actual Service IDs)
        await run(`INSERT INTO bookings (user_id, center_id, service_id, booking_time, status) 
                   VALUES (?, ?, ?, datetime('now', '+1 day'), 'CONFIRMED')`, [user.id, center1.id, s1.id]);
        
        await run(`INSERT INTO bookings (user_id, center_id, service_id, booking_time, status) 
                   VALUES (?, ?, ?, datetime('now', '+2 days'), 'PLANNED')`, [user.id, center2.id, s2.id]);
        
        console.log("Seed data (including bookings) injected successfully.");
    } catch (err) {
        console.error("Error seeding data:", err);
    }
};

seedData();
