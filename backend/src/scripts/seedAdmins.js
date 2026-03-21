/**
 * seedAdmins.js — Inserta las 4 cuentas de administrador en MongoDB.
 * Uso: node src/scripts/seedAdmins.js
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt    = require('bcryptjs');
const User      = require('../models/User');

const ADMINS = [
  { name: 'Mauricio',     email: 'mauricio@classai.edu',  username: 'mauricio' },
  { name: 'Kevin',        email: 'kevin@classai.edu',     username: 'kevin'    },
  { name: 'Jose',         email: 'jose@classai.edu',      username: 'jose'     },
  { name: 'Andres',       email: 'andres@classai.edu',    username: 'andres'   },
];

const DEFAULT_PASSWORD = 'Admin2024!';

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('✅ Conectado a MongoDB');

  const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);

  for (const admin of ADMINS) {
    const existing = await User.findOne({ email: admin.email });
    if (existing) {
      console.log(`⚠️  Ya existe: ${admin.email} — se omite`);
      continue;
    }
    await User.create({
      name:      admin.name,
      email:     admin.email,
      username:  admin.username,
      password:  hashed,
      role:      'admin',
      avatar:    admin.name.slice(0, 2).toUpperCase(),
    });
    console.log(`✅ Admin creado: ${admin.name} <${admin.email}>`);
  }

  console.log('\n🎉 Seed de administradores completado.');
  console.log(`   Contraseña inicial para todos: ${DEFAULT_PASSWORD}`);
  await mongoose.disconnect();
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
