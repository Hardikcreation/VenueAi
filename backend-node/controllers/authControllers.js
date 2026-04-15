const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getPool } = require('../config/db');

const normalizeRole = (role) => (role === 'vendor' ? 'vendor' : 'user');

const signup = async (req, res) => {
  const db = getPool();
  let connection;

  try {
    const { name, email, password, role, businessName, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const normalizedRole = normalizeRole(role);

    if (normalizedRole === 'vendor' && !businessName?.trim()) {
      return res.status(400).json({ message: 'Business name is required for vendor signup' });
    }

    const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existingUser.length > 0) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    connection = await db.getConnection();
    await connection.beginTransaction();

    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name.trim(), normalizedEmail, hashedPassword, normalizedRole]
    );

    let vendor = null;
    if (normalizedRole === 'vendor') {
      const [vendorResult] = await connection.query(
        'INSERT INTO vendors (user_id, business_name, phone, address) VALUES (?, ?, ?, ?)',
        [
          userResult.insertId,
          businessName.trim(),
          phone?.trim() || null,
          address?.trim() || null
        ]
      );

      vendor = {
        id: vendorResult.insertId,
        business_name: businessName.trim(),
        phone: phone?.trim() || null,
        address: address?.trim() || null
      };
    }

    await connection.commit();

    return res.status(201).json({
      message: `${normalizedRole === 'vendor' ? 'Vendor' : 'User'} registered successfully`,
      user: {
        id: userResult.insertId,
        name: name.trim(),
        email: normalizedEmail,
        role: normalizedRole,
        vendor
      }
    });
  } catch (error) {
    if (connection) {
      await connection.rollback();
    }

    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  } finally {
    if (connection) {
      connection.release();
    }
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const [users] = await getPool().query('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    const responseUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    };

    if (user.role === 'vendor') {
      const [vendors] = await getPool().query(
        'SELECT id, business_name, phone, address, created_at FROM vendors WHERE user_id = ?',
        [user.id]
      );
      responseUser.vendor = vendors[0] || null;
    }

    return res.json({
      token,
      user: responseUser
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { signup, login };
