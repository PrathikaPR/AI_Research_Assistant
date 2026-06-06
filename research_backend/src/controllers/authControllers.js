const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ======================================================
// 📝 REGISTER
// ======================================================
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(400).json({ success: false, message: 'Email already registered' });

    // ✅ hash password here directly
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({ name, email, password: hashedPassword });
    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// ======================================================
// 🔑 LOGIN
// ======================================================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, message: 'All fields are required' });

    const user = await User.findOne({ email });
    if (!user)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    // ✅ compare directly
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });

  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
// ======================================================
// 👤 GET CURRENT USER
// ======================================================
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    return res.status(200).json({ success: true, user });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { register, login, getMe };