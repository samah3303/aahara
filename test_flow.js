const axios = require('axios');
const BASE_URL = 'http://localhost:3000/webhook';

async function sendMsg(text) {
    console.log(`\nUser: "${text}"`);
    try {
        await axios.post(BASE_URL, {
            entry: [{ changes: [{ value: { messages: [{ type: 'text', from: '9190000001', text: { body: text } }] } }] }]
        });
    } catch (e) { console.error(e.message); }
}

async function runTest() {
    // 1. Start
    await sendMsg("I want to book");
    
    // 2. Select Service
    await new Promise(r => setTimeout(r, 500));
    await sendMsg("Retort Packaging");

    // 3. Select Time
    await new Promise(r => setTimeout(r, 500));
    await sendMsg("Tomorrow 7 PM");

    // 4. Confirm Slot
    await new Promise(r => setTimeout(r, 500));
    await sendMsg("2");
}

runTest();
