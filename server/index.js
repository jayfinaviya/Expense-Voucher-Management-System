require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDatabase, uploadsDir, dbPath } = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const voucherRoutes = require('./routes/voucherRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const upload = require('./middleware/upload');
const { authenticate } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for all local development origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsers with support for base64 signature strings
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static uploads serving
app.use('/uploads', express.static(uploadsDir));

// Standalone File Upload API for Signatures
app.post('/api/upload/signature', authenticate, upload.single('signatureFile'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No signature file uploaded.' });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  return res.json({
    success: true,
    message: 'Signature uploaded successfully',
    url: fileUrl,
    filename: req.file.filename
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/vouchers', voucherRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Prachay Securities Expense Voucher Management API',
    database: 'SQLite (expense_vouchers.db) Connected',
    port: PORT
  });
});

// JSON API Directory
app.get('/api', (req, res) => {
  res.json({
    service: 'Prachay Securities Expense Voucher Management API',
    status: 'online',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      auth: {
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        demoUsers: 'GET /api/auth/demo-users'
      },
      vouchers: {
        list: 'GET /api/vouchers',
        get: 'GET /api/vouchers/:id',
        create: 'POST /api/vouchers',
        update: 'PUT /api/vouchers/:id',
        delete: 'DELETE /api/vouchers/:id',
        submit: 'POST /api/vouchers/:id/submit',
        approve: 'POST /api/vouchers/:id/approve',
        reject: 'POST /api/vouchers/:id/reject'
      },
      dashboard: {
        stats: 'GET /api/dashboard/stats'
      }
    }
  });
});

// Root route handler: Displays a status dashboard when visited in browser
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Backend Status | Prachay Securities Expense Voucher API</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; max-width: 680px; width: 100%; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3); }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; font-size: 0.8125rem; font-weight: 700; background: #065f46; color: #a7f3d0; text-transform: uppercase; }
    h1 { margin: 16px 0 8px 0; font-size: 1.5rem; color: #ffffff; }
    p { color: #94a3b8; font-size: 0.9375rem; line-height: 1.5; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 20px 0; }
    .box { background: #0f172a; padding: 14px; border-radius: 8px; border: 1px solid #334155; }
    .box-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 4px; }
    .box-val { font-size: 0.9375rem; color: #f8fafc; font-weight: 600; word-break: break-all; }
    .btn { display: inline-block; padding: 10px 20px; background: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 10px; }
    .btn:hover { background: #1d4ed8; }
    ul { padding-left: 20px; color: #cbd5e1; font-size: 0.875rem; }
    li { margin-bottom: 6px; }
    code { background: #0f172a; padding: 2px 6px; border-radius: 4px; color: #93c5fd; font-family: monospace; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">● Backend Server Online</span>
    <h1>Prachay Securities EVMS API</h1>
    <p>The Express.js REST API server is healthy, active, and responding to HTTP requests.</p>
    
    <div class="grid">
      <div class="box">
        <div class="box-label">Port & Protocol</div>
        <div class="box-val">Port ${PORT} (HTTP)</div>
      </div>
      <div class="box">
        <div class="box-label">Database Engine</div>
        <div class="box-val">SQLite (expense_vouchers.db)</div>
      </div>
    </div>

    <div style="margin: 20px 0;">
      <a href="http://localhost:3000" class="btn">🚀 Open Frontend Application (Port 3000)</a>
    </div>

    <div class="box" style="margin-top: 24px;">
      <div class="box-label">Available REST Endpoints</div>
      <ul>
        <li><code>GET /api/health</code> - Service health check</li>
        <li><code>GET /api/auth/demo-users</code> - Pre-seeded test accounts list</li>
        <li><code>POST /api/auth/login</code> - JWT User authentication</li>
        <li><code>GET /api/vouchers</code> - Organization vouchers list with filtering</li>
        <li><code>GET /api/dashboard/stats</code> - Role-based analytics</li>
      </ul>
    </div>
  </div>
</body>
</html>
  `);
});

// Centralized Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('[API Error]:', err);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum signature image size is 5MB.' });
    }
    return res.status(400).json({ success: false, message: err.message });
  }

  const statusCode = err.status || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Initialize database and start listening
initDatabase().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`====================================================`);
    console.log(`  Expense Voucher Management Server running on port ${PORT}`);
    console.log(`  Health API: http://localhost:${PORT}/api/health`);
    console.log(`  Web App: http://localhost:3000`);
    console.log(`====================================================`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});
