const express = require('express');
const cors = require('cors');
const path = require('path');

const userRoutes     = require('./routes/userRoutes');
const courseRoutes   = require('./routes/courseRoutes');
const classRoutes    = require('./routes/classRoutes');
const teacherRoutes  = require('./routes/teacherRoutes');
const studentRoutes  = require('./routes/studentRoutes');
const authRoutes     = require('./routes/authRoutes');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Serve static uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ── Rutas ────────────────────────────────────────────────────────────────
app.use('/api/auth',     authRoutes);
app.use('/api/users',    userRoutes);
app.use('/api/courses',  courseRoutes);
app.use('/api/classes',  classRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/students', studentRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
