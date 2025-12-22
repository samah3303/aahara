const express = require('express');
const axios = require('axios');
const router = express.Router();
const { interpretMessage } = require('../services/llm');
const { get, all, run } = require('../config/database');

// In-Memory Session Storage
const sessions = new Map();

// Helper to send message to WhatsApp
async function sendMessage(to, body) {
    try {
        await axios.post(
            `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
            {
                messaging_product: "whatsapp",
                to: to,
                type: "text",
                text: { body: body }
            },
            {
                headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}` }
            }
        );
        console.log(`[WhatsApp] Sent message to ${to}`);
    } catch (error) {
        console.error("Error sending message:", error.response?.data || error.message);
    }
}

// 1. WhatsApp Validation (GET)
router.get('/', (req, res) => {
    if (req.query['hub.mode'] === 'subscribe') {
        const verifyToken = process.env.VERIFY_TOKEN;
        if (req.query['hub.verify_token'] === verifyToken) {
             console.log("Webhook Verified!");
             return res.send(req.query['hub.challenge']);
        }
        return res.sendStatus(403);
    }
    res.send("Webhook is listening (POST required for messages).");
});

// 2. Message Handling (POST)
router.post('/', async (req, res) => {
    try {
        const entry = req.body.entry?.[0];
        const message = entry?.changes?.[0]?.value?.messages?.[0];

        if (message && message.type === 'text') {
            const userPhone = message.from;
            const text = message.text.body;
            
            // Get or Init Session
            let session = sessions.get(userPhone) || { state: 'IDLE', data: {} };
            
            console.log(`[${userPhone}] State: ${session.state} | Input: ${text}`);

            // Interpret Intent
            const decision = await interpretMessage(text, session);
            let reply = "";

            // --- State Machine ---

            // 1. Start Booking
            if (decision.intent === 'CREATE_BOOKING') {
                session.data.center_id = 1; 
                const services = await all("SELECT * FROM services WHERE center_id = ?", [session.data.center_id]);
                const list = services.map((s, i) => `${i+1}. ${s.name} (${s.description})`).join('\n');
                reply = `Welcome to Ahara! Which service would you like to book?\n${list}\n(Reply with name)`;
                session.state = 'SELECT_SERVICE';
            }
            
            // 2. Service Selected
            else if (decision.intent === 'INFORM_SERVICE') {
                const service = await get("SELECT * FROM services WHERE name LIKE ? AND center_id = ?", [`%${decision.value}%`, session.data.center_id]);
                if (service) {
                    session.data.service_id = service.id;
                    session.data.service_name = service.name;
                    if (service.name.includes('Freeze Drying')) {
                        reply = `You chose ${service.name}. What product are you processing? (e.g. "Mangoes")`;
                        session.state = 'SELECT_DETAILS';
                        session.data.expecting = 'product';
                    } else {
                        reply = `You chose ${service.name}. What is the quantity? (e.g. "50 kg")`;
                        session.state = 'SELECT_DETAILS';
                        session.data.expecting = 'quantity';
                    }
                } else {
                    reply = "I couldn't find that service. Please try again (e.g. Retort, Freeze Drying).";
                }
            }
            
            // 3. Details Provided
            else if (decision.intent === 'INFORM_DETAILS') {
                if (session.data.expecting === 'product') {
                    session.data.product_type = decision.product_type || decision.quantity;
                    reply = "Got it. And what is the total quantity? (e.g. 100 kg)";
                    session.data.expecting = 'quantity';
                } else {
                    session.data.quantity = decision.quantity || decision.product_type;
                    reply = `Ok, ${session.data.quantity} of ${session.data.product_type || 'product'}. \nWhen would you like to book? (e.g. "Tomorrow 10 AM")`;
                    session.state = 'SELECT_TIME';
                }
            }

            // 4. Time Selected
            else if (decision.intent === 'INFORM_TIME') {
                session.data.requested_time = decision.value; 
                reply = `Checking slots for ${session.data.quantity}...\n\nAvailable Slots:\n1. 10:00 AM\n2. 02:00 PM\n\nReply with 1 or 2.`;
                session.state = 'SELECT_SLOT';
            }

            // 5. Slot Chosen -> Confirm
            else if (decision.intent === 'CONFIRM_SLOT') {
                const map = { '1': '19:00', '2': '19:30', '3': '20:00' };
                const time = map[decision.value] || '19:00';
                
                let user = await get("SELECT * FROM users WHERE phone_number = ?", [userPhone]);
                if (!user) {
                   const u = await run("INSERT INTO users (phone_number, name) VALUES (?, ?)", [userPhone, 'Guest']);
                   user = { id: u.id };
                }
                
                await run(`INSERT INTO bookings (user_id, center_id, service_id, booking_time, quantity, product_type, status) 
                           VALUES (?, ?, ?, datetime('now', '+1 day'), ?, ?, 'CONFIRMED')`, 
                           [user.id, session.data.center_id, session.data.service_id, session.data.quantity, session.data.product_type]);

                reply = `✅ Booking Confirmed!\nService: ${session.data.service_name}\nProduct: ${session.data.product_type || '-'}\nQty: ${session.data.quantity}\nTime: ${time}\n\nType "Book" to start again.`;
                session.state = 'IDLE';
                session.data = {};
            }

            // Default
            else {
                reply = "I didn't understand. Type 'Book' to start a reservation.";
            }

            // Save Session
            sessions.set(userPhone, session);
            
            console.log(`>> Reply: ${reply}`);
            
            // Send to WhatsApp
            await sendMessage(userPhone, reply);

            res.status(200).send('EVENT_RECEIVED');
        } else {
             res.sendStatus(404);
        }
    } catch (err) {
        console.error(err);
        res.sendStatus(500);
    }
});

module.exports = router;
