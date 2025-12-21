const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function verify() {
    try {
        console.log("1. Testing API: Get Centers...");
        const res1 = await axios.get(`${BASE_URL}/api/centers?pincode=673`);
        console.log("   found:", res1.data.centers.length, "centers");

        console.log("2. Testing Webhook: Search Intent...");
        const res2 = await axios.post(`${BASE_URL}/webhook`, {
            entry: [{ changes: [{ value: { messages: [{ type: 'text', from: '9199999999', text: { body: 'Find centers near me' } }] } }] }]
        });
        console.log("   User 'Find centers' -> Webhook Status:", res2.status, res2.data);

        console.log("3. Testing Webhook: Book Intent...");
        const res3 = await axios.post(`${BASE_URL}/webhook`, {
            entry: [{ changes: [{ value: { messages: [{ type: 'text', from: '9199999999', text: { body: 'I want to book a frozen box' } }] } }] }]
        });
        console.log("   User 'Book Frozen Box' -> Webhook Status:", res2.status, res2.data);
        
        console.log("Verification Complete!");
    } catch (err) {
        console.error("Verification Failed:", err.message);
        if (err.response) console.error("Data:", err.response.data);
    }
}

verify();
