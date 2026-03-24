const express = require('express');
const bcrypt  = require('bcryptjs');
const router  = express.Router();
const Student = require('../models/Student');

// ── POST /api/students/register ───────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const {
      documento, nombre, apellido, anioNacimiento,
      telefono, correo, clave, institucion,
    } = req.body;

    // ── [1] Required fields ────────────────────────────────────────────────────
    const required = { documento, nombre, apellido, anioNacimiento, telefono, correo, clave, institucion };
    const missing  = Object.entries(required).find(([, v]) => !v || v.toString().trim() === '');
    if (missing) {
      return res.status(400).json({ code: 'EMPTY_FIELDS', message: 'Este campo es obligatorio', field: missing[0] });
    }

    // ── [2] Uniqueness checks ──────────────────────────────────────────────────
    if (await Student.findOne({ documento })) {
      return res.status(409).json({ code: 'DUP_DOCUMENTO', message: 'El dato ya se encuentra registrado', field: 'documento' });
    }
    if (await Student.findOne({ telefono })) {
      return res.status(409).json({ code: 'DUP_TELEFONO', message: 'El dato ya se encuentra registrado', field: 'telefono' });
    }
    if (await Student.findOne({ correo: correo.toLowerCase() })) {
      return res.status(409).json({ code: 'DUP_CORREO', message: 'El dato ya se encuentra registrado', field: 'correo' });
    }

    // ── [3] Hash password ──────────────────────────────────────────────────────
    const hashedClave = await bcrypt.hash(clave, 10);

    // ── [4] Persist (aprobado defaults to false via schema) ───────────────────
    const student = await Student.create({
      documento,
      nombre:         nombre.trim(),
      apellido:       apellido.trim(),
      anioNacimiento,
      telefono,
      correo:         correo.toLowerCase(),
      clave:          hashedClave,
      institucion:    institucion.trim(),
    });

    // Return without exposing the hashed password
    const { clave: _omit, ...safe } = student.toObject();
    res.status(201).json(safe);

  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: messages.join('. ') });
    }
    if (err.code === 11000) {
      const field   = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ code: 'DUP_KEY', message: 'El dato ya se encuentra registrado', field });
    }
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/students/pending — list unapproved students (admin) ──────────────
router.get('/pending', async (_req, res) => {
  try {
    const students = await Student.find({ aprobado: false }).select('-clave').sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/students — list all students (admin) ─────────────────────────────
router.get('/', async (_req, res) => {
  try {
    const students = await Student.find().select('-clave').sort({ createdAt: -1 });
    res.json(students);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/students/:id/approve — admin approves a student ──────────────────
router.put('/:id/approve', async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { aprobado: true },
      { new: true }
    ).select('-clave');
    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json(student);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/students/:id — admin updates student details ─────────────────────
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    
    // If password is being changed, hash it
    if (updates.clave && updates.clave.trim() !== '') {
      updates.clave = await bcrypt.hash(updates.clave, 10);
    } else {
      delete updates.clave; // Don't overwrite with empty string
    }

    const student = await Student.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select('-clave');

    if (!student) return res.status(404).json({ message: 'Estudiante no encontrado' });
    res.json(student);
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join('. ') });
    }
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/students/:id — reject / remove student ────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: 'Solicitud eliminada' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
