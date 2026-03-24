const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc  Get all users
// @route GET /api/users
exports.getAll = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get single user
// @route GET /api/users/:id
exports.getById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create user
// @route POST /api/users
exports.create = async (req, res) => {
  try {
    const { name, email, username, password, role, avatar } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, username, password: hashed, role, avatar });
    res.status(201).json({ ...user.toObject(), password: undefined });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Update user
// @route PUT /api/users/:id
exports.update = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// @desc  Delete user
// @route DELETE /api/users/:id
exports.remove = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Login
// @route POST /api/users/login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ ...user.toObject(), password: undefined });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
