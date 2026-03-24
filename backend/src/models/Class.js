const mongoose = require('mongoose');

// ── SUB-SCHEMAS ───────────────────────────────────────────────────────────────
const TranscriptionSegmentSchema = new mongoose.Schema({
  text:      String,
  timestamp: String,
  isFinal:   Boolean,
});

const QuestionSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName:     String,
  userAvatar:   String,
  text:         String,
  isQuickReply: Boolean,
  status:       { type: String, enum: ['pending', 'answered'], default: 'pending' },
  upvotes:      { type: Number, default: 0 },
  sentAt:       { type: Date, default: Date.now },
  answeredAt:   Date,
});

const AttendanceSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  joinedAt: { type: Date, default: Date.now },
});

// ── CLASS ─────────────────────────────────────────────────────────────────────
const ClassSchema = new mongoose.Schema({
  courseId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:              { type: String, required: true },
  date:               String,
  startTime:          String,
  sessionType:        { type: String, enum: ['Live', 'In-Person', 'Workshop'], default: 'Live' },
  isActive:           { type: Boolean, default: false },
  transcription:      [TranscriptionSegmentSchema],
  savedTranscription: String,
  summary:            String,
  participantIds:     [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  questions:          [QuestionSchema],
  attendance:         [AttendanceSchema],
  createdAt:          { type: Date, default: Date.now },
});

module.exports = mongoose.model('Class', ClassSchema);
