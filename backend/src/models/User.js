const mongoose = require('mongoose');

// ── USER ──────────────────────────────────────────────────────────────────────
const UserSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  email:     { type: String, required: true, unique: true },
  username:  { type: String, required: true, unique: true },
  password:  { type: String, required: true }, // hashed with bcrypt
  role:      { type: String, enum: ['admin', 'teacher', 'student'], required: true },
  avatar:    { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', UserSchema);
