const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const { Lead } = require('../models/Lead');

const router = express.Router();

const signToken = (user) =>
jwt.sign(
{ id: user._id, email: user.email, name: user.name },
process.env.JWT_SECRET,
{ expiresIn: '7d' }
);

// POST /api/auth/register
router.post(
'/register',
[
body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Name must be 2-80 characters'),
body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
],
async (req, res, next) => {
try {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({
success: false,
message: errors.array()[0].msg,
errors: errors.array(),
});
}
const { name, email, password } = req.body;
  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).json({
      success: false,
      message: 'An account with this email already exists.',
    });
  }

  const user = await User.create({ name, email, password });
  const token = signToken(user);

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
} catch (err) {
  next(err);
}
}
);

// POST /api/auth/login
router.post(
'/login',
[
body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
body('password').notEmpty().withMessage('Password is required'),
],
async (req, res, next) => {
try {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({
success: false,
message: errors.array()[0].msg,
});
}

  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.',
    });
  }

  const token = signToken(user);
  res.json({
    success: true,
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
} catch (err) {
  next(err);
}
}
);

// POST /api/auth/demo - Instant demo account with sample leads for quick evaluation
router.post('/demo', async (req, res, next) => {
try {
const demoEmail = 'demo@merutechnosoft.com';
let user = await User.findOne({ email: demoEmail });

if (!user) {
  user = await User.create({
    name: 'Sales Demo User',
    email: demoEmail,
    password: 'DemoPassword123!',
  });

  await Lead.insertMany([
    {
      user: user._id,
      name: 'Aarav Sharma',
      email: 'aarav.sharma@finbridge.in',
      phone: '+91 98765 43210',
      company: 'FinBridge Solutions',
      source: 'LinkedIn',
      status: 'Qualified',
    },
    {
      user: user._id,
      name: 'Priya Nair',
      email: 'priya@cloudnova.io',
      phone: '+91 91234 56789',
      company: 'CloudNova Systems',
      source: 'Website',
      status: 'New',
    },
    {
      user: user._id,
      name: 'Rohan Kulkarni',
      email: 'rohan.k@nexaretail.com',
      phone: '+91 99887 76655',
      company: 'Nexa Retail Pvt Ltd',
      source: 'Referral',
      status: 'Contacted',
    },
    {
      user: user._id,
      name: 'Sneha Verma',
      email: 'sneha@orbitlogistics.co',
      phone: '+91 97654 32109',
      company: 'Orbit Logistics',
      source: 'Event',
      status: 'Lost',
    },
  ]);
}

const token = signToken(user);
res.json({
  success: true,
  token,
  user: { id: user._id, name: user.name, email: user.email },
});
} catch (err) {
next(err);
}
});

module.exports = router;