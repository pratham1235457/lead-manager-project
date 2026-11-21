const mongoose = require('mongoose');

const LEAD_SOURCES = ['Website', 'Referral', 'LinkedIn', 'Cold Outreach', 'Event', 'Other'];
const LEAD_STATUSES = ['New', 'Contacted', 'Qualified', 'Lost'];

const leadSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true, maxlength: 120 },
    source: { type: String, enum: LEAD_SOURCES, default: 'Website' },
    status: { type: String, enum: LEAD_STATUSES, default: 'New', index: true },
  },
  { timestamps: true }
);

const Lead = mongoose.model('Lead', leadSchema);

module.exports = { Lead, LEAD_SOURCES, LEAD_STATUSES };
