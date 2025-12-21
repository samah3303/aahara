const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

// Fallback Heuristic (Legacy)
function extractDetailedIntent(text, context) {
    const lower = text.toLowerCase();
    
    // 1. Reset / New Booking
    if (lower.includes('book') || lower.includes('reservation')) return { intent: "CREATE_BOOKING" };
    
    // 2. Service Selection
    if (context.state === 'SELECT_SERVICE') {
        if (lower.includes('retort')) return { intent: "INFORM_SERVICE", value: "Retort" };
        if (lower.includes('freeze') || lower.includes('drying')) return { intent: "INFORM_SERVICE", value: "Freeze Drying" };
        if (lower.includes('dehydration') || lower.includes('dry')) return { intent: "INFORM_SERVICE", value: "Dehydration" };
        if (lower.includes('powder')) return { intent: "INFORM_SERVICE", value: "Powdering" };
        return { intent: "UNKNOWN", message: "Please choose: Retort, Freeze Drying, Dehydration, or Powdering." };
    }

    // 3. Details Extraction (Quantity / Product)
    if (context.state === 'SELECT_DETAILS') {
        const qtyMatch = text.match(/(\d+)\s?(kg|liters|tons|packets)/i);
        let qty = qtyMatch ? qtyMatch[0] : null;
        let product = (!qtyMatch && text.length > 2) ? text : null;
        return { intent: "INFORM_DETAILS", quantity: qty, product_type: product };
    }

    // 4. Time Selection
    if (context.state === 'SELECT_TIME') {
        return { intent: "INFORM_TIME", value: "2025-12-21 19:00:00" };
    }

    // 5. Slot Confirmation
    if (context.state === 'SELECT_SLOT') {
        if (lower.includes('1') || lower.includes('2')) return { intent: "CONFIRM_SLOT", value: lower };
    }

    return { intent: "SMALL_TALK", message: "I can help you book Ahara processing services." };
}

async function interpretMessage(text, context = {}) {
    // 1. If no key, verify if it's dummy explicitly or missing
    if (!API_KEY || API_KEY === 'dummy') {
        console.log("[LLM] Using Mock (No Key/Dummy)");
        return extractDetailedIntent(text, context);
    }

    // 2. Real Gemini Call
    console.log("[LLM] Calling Gemini...", text);
    try {
        const genAI = new GoogleGenerativeAI(API_KEY);
        // Use gemini-1.5-flash for speed and free tier
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
        You are a booking assistant for 'Ahara Food Processing'. 
        Current User State: ${context.state || 'IDLE'}.
        
        Services: Retort, Freeze Drying, Dehydration, Powdering.
        
        Analyze the user input and return valid JSON **only**. No markdown code blocks.
        Allowed JSON Structure:
        {
            "intent": "CREATE_BOOKING" | "INFORM_SERVICE" | "INFORM_TIME" | "INFORM_DETAILS" | "CONFIRM_SLOT" | "SMALL_TALK" | "UNKNOWN",
            "value": "Extracted entity",
            "quantity": "Extracted quantity if applicable",
            "product_type": "Extracted product if applicable",
            "message": "Friendly reply if needed"
        }

        Rules:
        - If user wants to book/start -> intent="CREATE_BOOKING".
        - If state=SELECT_SERVICE -> look for service names (Retort, Freeze Drying, etc).
        - If state=SELECT_DETAILS -> extract "quantity" (e.g. 50kg) OR "product_type" (e.g. Mangoes).
        - If state=SELECT_TIME -> extract normalized date/time (e.g. 2025-12-21 19:00:00).
        - If state=SELECT_SLOT -> look for "1", "2".
        
        User Input: "${text}"
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let content = response.text();
        
        console.log("[LLM] Response:", content);
        
        // Clean markdown if present
        content = content.replace(/```json/g, '').replace(/```/g, '').trim();
        
        try {
            return JSON.parse(content);
        } catch (e) {
            console.error("[LLM] JSON Parse Error", e);
            // Fallback
            return { intent: "SMALL_TALK", message: content };
        }

    } catch (err) {
        console.error("[LLM] Gemini API Error:", err.message);
        return extractDetailedIntent(text, context); // Fallback to mock
    }
}

module.exports = { interpretMessage };
