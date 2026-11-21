const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const mongoose = require('mongoose');
const { Lead, LEAD_SOURCES, LEAD_STATUSES } = require('../models/Lead');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Protect all lead routes
router.use(authMiddleware);

const leadValidationRules = [
body('name')
.trim()
.notEmpty()
.withMessage('Name is required')
.isLength({ min: 2, max: 100 })
.withMessage('Name must be between 2 and 100 characters'),
body('email')
.trim()
.notEmpty()
.withMessage('Email is required')
.isEmail()
.withMessage('Please enter a valid email address')
.normalizeEmail(),
body('phone')
.trim()
.notEmpty()
.withMessage('Phone number is required')
.matches(/^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,16}$/)
.withMessage('Please enter a valid phone number (7-20 digits)'),
body('company')
.trim()
.notEmpty()
.withMessage('Company is required')
.isLength({ max: 120 })
.withMessage('Company cannot exceed 120 characters'),
body('source')
.trim()
.isIn(LEAD_SOURCES)
.withMessage(`Source must be one of: ${LEAD_SOURCES.join(', ')}`),
body('status')
.optional()
.trim()
.isIn(LEAD_STATUSES)
.withMessage(`Status must be one of: ${LEAD_STATUSES.join(', ')}`),
];

// GET /api/leads - List leads with search, status filter, sorting, pagination & status counts
router.get(
'/',
[
query('search').optional().trim(),
query('status').optional().trim(),
query('sort').optional().isIn(['newest', 'oldest', 'name_asc', 'name_desc']),
query('page').optional().isInt({ min: 1 }).toInt(),
query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
],
async (req, res, next) => {
try {
const userId = new mongoose.Types.ObjectId(req.user.id);
const { search = '', status = '', sort = 'newest', page = 1, limit = 10 } = req.query;

  const filter = { user: userId };

  if (status && LEAD_STATUSES.includes(status)) {
    filter.status = status;
  }

  if (search) {
    const safeRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    filter.$or = [{ name: safeRegex }, { email: safeRegex }, { company: safeRegex }];
  }

  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    name_asc: { name: 1 },
    name_desc: { name: -1 },
  };

  const skip = (page - 1) * limit;

  const [leads, totalFiltered, statusAggregation] = await Promise.all([
    Lead.find(filter)
      .sort(sortMap[sort] || { createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Lead.countDocuments(filter),
    Lead.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const counts = {
    Total: 0,
    New: 0,
    Contacted: 0,
    Qualified: 0,
    Lost: 0,
  };

  for (const item of statusAggregation) {
    if (Object.prototype.hasOwnProperty.call(counts, item._id)) {
      counts[item._id] = item.count;
      counts.Total += item.count;
    }
  }

  res.json({
    success: true,
    data: leads,
    counts,
    pagination: {
      page,
      limit,
      total: totalFiltered,
      totalPages: Math.max(1, Math.ceil(totalFiltered / limit)),
    },
  });
} catch (err) {
  next(err);
}
}
);

// POST /api/leads - Create a new lead
router.post('/', leadValidationRules, async (req, res, next) => {
try {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({
success: false,
message: 'Validation failed',
errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
});
}

const { name, email, phone, company, source, status } = req.body;

const lead = await Lead.create({
  user: req.user.id,
  name,
  email,
  phone,
  company,
  source,
  status: status || 'New',
});

res.status(201).json({
  success: true,
  message: 'Lead created successfully',
  data: lead,
});
} catch (err) {
next(err);
}
});

// PUT /api/leads/:id - Update an existing lead
router.put(
'/:id',
[param('id').isMongoId().withMessage('Invalid lead ID'), ...leadValidationRules],
async (req, res, next) => {
try {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({
success: false,
message: 'Validation failed',
errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
});
}

  const { name, email, phone, company, source, status } = req.body;

  const updatedLead = await Lead.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { name, email, phone, company, source, status },
    { new: true, runValidators: true }
  );

  if (!updatedLead) {
    return res.status(404).json({
      success: false,
      message: 'Lead not found',
    });
  }

  res.json({
    success: true,
    message: 'Lead updated successfully',
    data: updatedLead,
  });
} catch (err) {
  next(err);
}
}
);

// PATCH /api/leads/:id/status - Quick status update from table
router.patch(
'/:id/status',
[
param('id').isMongoId().withMessage('Invalid lead ID'),
body('status')
.trim()
.isIn(LEAD_STATUSES)
.withMessage(`Status must be one of: ${LEAD_STATUSES.join(', ')}`),
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

  const updatedLead = await Lead.findOneAndUpdate(
    { _id: req.params.id, user: req.user.id },
    { status: req.body.status },
    { new: true }
  );

  if (!updatedLead) {
    return res.status(404).json({
      success: false,
      message: 'Lead not found',
    });
  }

  res.json({
    success: true,
    message: 'Status updated',
    data: updatedLead,
  });
} catch (err) {
  next(err);
}
}
);

// DELETE /api/leads/:id - Delete a lead
router.delete(
'/:id',
[param('id').isMongoId().withMessage('Invalid lead ID')],
async (req, res, next) => {
try {
const errors = validationResult(req);
if (!errors.isEmpty()) {
return res.status(400).json({
success: false,
message: 'Invalid lead ID',
});
}

  const deleted = await Lead.findOneAndDelete({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!deleted) {
    return res.status(404).json({
      success: false,
      message: 'Lead not found',
    });
  }

  res.json({
    success: true,
    message: 'Lead deleted successfully',
  });
} catch (err) {
  next(err);
}
}
);

module.exports = router;