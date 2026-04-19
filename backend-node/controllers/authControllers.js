// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Vendor = require('../models/Vendor');

const normalizeRole = (role) => (role === 'vendor' ? 'vendor' : 'user');

const signup = async (req, res) => {
  try {
    const { name, email, password, role, businessName, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = normalizeRole(role);

    if (normalizedRole === 'vendor' && !businessName?.trim()) {
      return res.status(400).json({ message: 'Business name is required' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      role: normalizedRole
    });

    let vendor = null;

    if (normalizedRole === 'vendor') {
      vendor = await Vendor.create({
        user_id: user._id,
        business_name: businessName.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null
      });
    }

    res.status(201).json({
      message: `${normalizedRole === 'vendor' ? 'Vendor' : 'User'} registered successfully`,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        vendor
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    let responseUser = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === 'vendor') {
      const vendor = await Vendor.findOne({ user_id: user._id });
      responseUser.vendor = vendor;
    }

    res.json({
      token,
      user: responseUser
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signup, login };