require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const leadRoutes = require('./routes/leads');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.disable('x-powered-by');
app.use(helmet());
app.use(
cors({
origin: process.env.CLIENT_URL || '*',
credentials: true,
})
);
app.use(express.json({ limit: '100kb' }));

const authLimiter = rateLimit({
windowMs: 15 * 60 * 1000,
limit: 30,
standardHeaders: 'draft-7',
legacyHeaders: false,
message: { success: false, message: 'Too many authentication attempts. Please try again later.' },
});
app.use('/api/auth', authLimiter);

// Health check
app.get('/api/health', (req, res) => {
res.json({
success: true,
status: 'ok',
timestamp: new Date().toISOString(),
});
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leads', leadRoutes);

// 404 handler for unknown API routes
app.use('/api/*', (req, res) => {
res.status(404).json({
success: false,
message: `Route ${req.originalUrl} not found`,
});
});

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lead_manager';

if (require.main === module) {
if (!process.env.JWT_SECRET) {
console.error('JWT_SECRET is required');
process.exit(1);
}
mongoose
.connect(MONGODB_URI)
.then(() => {
console.log('Connected to MongoDB');
app.listen(PORT, () => {
console.log(`Server running on http://localhost:${PORT}`);
});
})
.catch((err) => {
console.error('MongoDB connection error:', err.message);
process.exit(1);
});
}

module.exports = app;