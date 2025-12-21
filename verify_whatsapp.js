const axios = require('axios');
require('dotenv').config();

const TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_ID = process.env.WHATSAPP_PHONE_ID;

async function checkWhatsApp() {
    console.log("Verifying WhatsApp Credentials...");
    console.log(`Phone ID: ${PHONE_ID}`);
    
    try {
        // 1. Check Phone Number details
        const url = `https://graph.facebook.com/v17.0/${PHONE_ID}`;
        const res = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${TOKEN}` }
        });
        
        console.log("✅ Phone ID is Valid!");
        console.log("Name:", res.data.verified_name || "Test Number");
        console.log("Display Phone Number:", res.data.display_phone_number);
        
    } catch (e) {
        console.error("❌ Verification Failed!");
        if (e.response) {
            console.error(`Error ${e.response.status}:`, e.response.data);
            if (e.response.data.error && e.response.data.error.type === 'OAuthException') {
                console.log("Hint: Token might be invalid or expired.");
            }
            if (e.response.data.error && e.response.data.error.type === 'GraphMethodException') {
                console.log("Hint: Phone ID might be incorrect (Is '1555...' definitely the ID, not just the number?).");
            }
        } else {
            console.error(e.message);
        }
    }
}

checkWhatsApp();
