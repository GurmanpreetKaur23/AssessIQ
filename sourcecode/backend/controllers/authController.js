const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name)
      return res.status(400).json({ detail: 'full_name, email and password are required' });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ detail: 'Email already registered' });

    const role =
      req.body.role === 'admin' && req.body.adminSecret === process.env.ADMIN_SECRET
        ? 'admin'
        : 'student';

    const user = await User.create({ full_name, email, password, role });
    res.status(201).json({ access_token: generateToken(user._id), role: user.role });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ detail: 'Email and password required' });

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ detail: 'Invalid email or password' });

    user.status = 'online';
    await user.save();

    res.json({ access_token: generateToken(user._id), role: user.role });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// GET /api/auth/users  — all users (authenticated)
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password -analytics').sort({ createdAt: -1 });
    res.json(
      users.map((u) => ({
        name: u.full_name,
        email: u.email,
        role: u.role,
        status: u.status,
        created_at: u.createdAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

module.exports = { register, login, getUsers };
