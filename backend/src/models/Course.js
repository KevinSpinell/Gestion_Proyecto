const mongoose = require('mongoose');

// ── COURSE ────────────────────────────────────────────────────────────────────
const CourseSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String },
  category:    { type: String },
  teacherId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  studentIds:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status:      { type: String, enum: ['active', 'inactive'], default: 'active' },
  createdAt:   { type: Date, default: Date.now },
});

module.exports = mongoose.model('Course', CourseSchema);
