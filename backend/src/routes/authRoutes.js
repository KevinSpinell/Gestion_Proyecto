const express = require('express');
const bcrypt  = require('bcryptjs');
const router  = express.Router();
const User    = require('../models/User');
const { Teacher } = require('../models/Teacher');
const Student = require('../models/Student');

// ── POST /api/auth/login ──────────────────────────────────────────────────────
// Accepts { identifier, password }
// identifier can be: username (admin), email, or documento (teacher/student)
// Lookup order: User (admin) → Teacher → Student
router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identificador y contraseña son requeridos' });
    }

    // ── 1. Try User model (admin / legacy users) ──────────────────────────────
    const user = await User.findOne({
      $or: [{ username: identifier }, { email: identifier }],
    });

    if (user) {
      const match = await bcrypt.compare(password, user.password);
      if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

      return res.json({
        id:        user._id,
        name:      user.name,
        email:     user.email,
        username:  user.username,
        role:      user.role,
        avatar:    user.avatar || user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
      });
    }

    // ── 2. Try Teacher model ──────────────────────────────────────────────────
    const teacher = await Teacher.findOne({
      $or: [{ documento: identifier }, { correo: identifier.toLowerCase() }],
    });

    if (teacher) {
      const match = await bcrypt.compare(password, teacher.clave);
      if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

      if (!teacher.estado) {
        return res.status(403).json({ message: 'Su cuenta está inactiva. Contacte al administrador.' });
      }

      const fullName = `${teacher.nombre} ${teacher.apellido}`;
      return res.json({
        id:          teacher._id,
        name:        fullName,
        email:       teacher.correo,
        username:    teacher.documento,
        role:        'teacher',
        avatar:      fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        documento:   teacher.documento,
        telefono:    teacher.telefono,
        areaDominio: teacher.areaDominio,
        anioInicio:  teacher.anioInicio,
        estado:      teacher.estado,
      });
    }

    // ── 3. Try Student model ──────────────────────────────────────────────────
    const student = await Student.findOne({
      $or: [{ documento: identifier }, { correo: identifier.toLowerCase() }],
    });

    if (student) {
      const match = await bcrypt.compare(password, student.clave);
      if (!match) return res.status(401).json({ message: 'Credenciales incorrectas' });

      // ── [RF-01] aprobado guard ─────────────────────────────────────────────
      if (!student.aprobado) {
        return res.status(403).json({
          message: 'Su solicitud está siendo revisada por un administrador',
          code:    'PENDING_APPROVAL',
        });
      }

      if (!student.estado) {
        return res.status(403).json({ message: 'Su cuenta está inactiva. Contacte al administrador.' });
      }

      const fullName = `${student.nombre} ${student.apellido}`;
      return res.json({
        id:             student._id,
        name:           fullName,
        email:          student.correo,
        username:       student.documento,
        role:           'student',
        avatar:         fullName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        documento:      student.documento,
        telefono:       student.telefono,
        institucion:    student.institucion,
        anioNacimiento: student.anioNacimiento,
        estado:         student.estado,
        aprobado:       student.aprobado,
      });
    }

    // ── 4. No match found ─────────────────────────────────────────────────────
    return res.status(401).json({ message: 'Credenciales incorrectas' });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
