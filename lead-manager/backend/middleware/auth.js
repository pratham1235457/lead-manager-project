const jwt = require('jsonwebtoken');
const authMiddleware = (req, res, next) => {
const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith('Bearer ')) {
return res.status(401).json({
success: false,
message: 'Authentication required. Please log in.',
});
}

const token = authHeader.split(' ')[1];

try {
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.user = { id: decoded.id, email: decoded.email, name: decoded.name };
next();
} catch (err) {
return res.status(401).json({
success: false,
message: 'Invalid or expired session token. Please log in again.',
});
}
};

module.exports = authMiddleware;