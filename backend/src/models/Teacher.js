const mongoose = require('mongoose');

// ── Shared domain areas (keep in sync with frontend DOMAIN_AREAS) ─────────────
const DOMAIN_AREAS = [
  'Informática',
  'Matemáticas',
  'Ciencias',
  'Historia',
  'Idiomas',
  'Arte',
  'Ingeniería',
  'Física',
  'Química',
  'Literatura',
  'Educación Física',
  'General',
];

// ── Teacher Schema ─────────────────────────────────────────────────────────────
const TeacherSchema = new mongoose.Schema({
  // 11-digit numeric string, unique
  documento: {
    type: String,
    required: [true, 'El documento es obligatorio'],
    unique: true,
    match: [/^\d{8,11}$/, 'El documento debe tener entre 8 y 11 dígitos numéricos'],
  },

  // Max 32 chars, no special characters
  nombre: {
    type: String,
    required: [true, 'El nombre es obligatorio'],
    maxlength: [32, 'El nombre no puede superar 32 caracteres'],
    match: [/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'El nombre solo puede contener letras y espacios'],
    trim: true,
  },

  apellido: {
    type: String,
    required: [true, 'El apellido es obligatorio'],
    maxlength: [32, 'El apellido no puede superar 32 caracteres'],
    match: [/^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/, 'El apellido solo puede contener letras y espacios'],
    trim: true,
  },

  // 10-digit numeric string, unique
  telefono: {
    type: String,
    required: [true, 'El teléfono es obligatorio'],
    unique: true,
    match: [/^\d{10}$/, 'El teléfono debe tener exactamente 10 dígitos numéricos'],
  },

  // Email format, unique
  correo: {
    type: String,
    required: [true, 'El correo es obligatorio'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Formato de correo inválido'],
  },

  // Stored pre-hashed by the controller
  clave: {
    type: String,
    required: [true, 'La clave es obligatoria'],
    minlength: [8, 'La clave debe tener al menos 8 caracteres'],
  },

  // Must be one of the approved domain areas
  areaDominio: {
    type: String,
    required: [true, 'El área de dominio es obligatoria'],
    enum: { values: DOMAIN_AREAS, message: 'Área de dominio no válida' },
  },

  // 4-digit year (e.g. "2024")
  anioInicio: {
    type: String,
    required: [true, 'El año de inicio es obligatorio'],
    match: [/^\d{4}$/, 'El año de inicio debe tener exactamente 4 dígitos'],
  },

  estado: {
    type: Boolean,
    default: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = { Teacher: mongoose.model('Teacher', TeacherSchema), DOMAIN_AREAS };
