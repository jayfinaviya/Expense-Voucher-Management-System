const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { dbGet, dbAll, dbRun } = require('../config/db');
const { JWT_SECRET } = require('../middleware/auth');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const user = await dbGet('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email.trim()]);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      employee_id: user.employee_id,
      default_signature: user.default_signature
    };

    return res.json({
      success: true,
      message: 'Authentication successful',
      token,
      user: safeUser
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await dbGet('SELECT id, email, name, role, department, employee_id, default_signature FROM users WHERE id = ?', [req.user.id]);
    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

const getDemoUsers = async (req, res, next) => {
  try {
    const users = await dbAll('SELECT id, email, name, role, department, employee_id FROM users ORDER BY id ASC');
    return res.json({
      success: true,
      demoUsers: users.map(u => ({
        ...u,
        defaultPassword: 'password123'
      }))
    });
  } catch (err) {
    next(err);
  }
};

const updateSignature = async (req, res, next) => {
  try {
    let signatureUrl = req.body.signature;

    if (req.file) {
      signatureUrl = `/uploads/${req.file.filename}`;
    }

    if (!signatureUrl) {
      return res.status(400).json({ success: false, message: 'No signature data provided.' });
    }

    await dbRun('UPDATE users SET default_signature = ? WHERE id = ?', [signatureUrl, req.user.id]);

    return res.json({
      success: true,
      message: 'Signature updated successfully.',
      signature: signatureUrl
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  login,
  getMe,
  getDemoUsers,
  updateSignature
};
