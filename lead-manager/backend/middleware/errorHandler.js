const errorHandler = (err, req, res, next) => {
console.error('[API Error]:', err);

// Mongoose duplicate key error
if (err.code === 11000) {
const field = Object.keys(err.keyPattern || {})[1] || Object.keys(err.keyPattern || {})[0] || 'field';
return res.status(409).json({
success: false,
message: `A record with this ${field} already exists.`,
});
}

// Mongoose validation error
if (err.name === 'ValidationError') {
const errors = Object.values(err.errors).map((e) => ({
field: e.path,
message: e.message,
}));
return res.status(400).json({
success: false,
message: 'Validation failed',
errors,
});
}

// Invalid MongoDB ObjectId
if (err.name === 'CastError') {
return res.status(400).json({
success: false,
message: 'Invalid resource ID format.',
});
}

res.status(err.statusCode || 500).json({
success: false,
message: err.message || 'Internal server error',
});
};

module.exports = errorHandler;