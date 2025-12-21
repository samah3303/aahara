const express = require('express');
const bodyParser = require('body-parser');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API Routes
app.use(express.static('public')); // Serve Admin Panel
app.use('/api', apiRoutes);
app.use('/webhook', require('./routes/webhook'));

// Health Check
app.get('/', (req, res) => {
    res.send({ status: 'ok', service: 'WhatsApp Booking Assistant - Frozen Storage Edition' });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
