const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const dbDir = path.resolve(__dirname, '../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const uploadsDir = path.resolve(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const dbPath = process.env.DB_PATH 
  ? path.resolve(__dirname, '../../', process.env.DB_PATH) 
  : path.join(dbDir, 'expense_vouchers.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Failed to connect to SQLite database:', err.message);
  } else {
    console.log(`Connected to SQLite database at: ${dbPath}`);
  }
});

// Promisified DB helpers
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// SVG default signatures as fallback data URLs
const createSampleSignature = (name) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="90" viewBox="0 0 300 90">
    <path d="M 20 60 Q 60 20, 100 55 T 160 40 T 220 65 T 280 45" fill="none" stroke="#1e3a8a" stroke-width="2.5" stroke-linecap="round"/>
    <text x="30" y="78" font-family="'Brush Script MT', cursive, sans-serif" font-size="22" fill="#1e3a8a">${name}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const initDatabase = async () => {
  try {
    // 1. Create tables
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL CHECK (role IN ('employee', 'director', 'accounts')),
        department TEXT,
        employee_id TEXT,
        default_signature TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await dbRun(`
      CREATE TABLE IF NOT EXISTS vouchers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voucher_number TEXT UNIQUE NOT NULL,
        voucher_date TEXT NOT NULL,
        expense_date TEXT NOT NULL,
        department TEXT NOT NULL,
        expense_title TEXT NOT NULL,
        expense_category TEXT NOT NULL,
        expense_description TEXT,
        amount REAL NOT NULL CHECK (amount > 0),
        status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Pending Approval', 'Approved', 'Rejected')),
        
        -- Employee Info
        created_by_user_id INTEGER NOT NULL,
        employee_name TEXT NOT NULL,
        employee_id TEXT,
        employee_signature TEXT,
        employee_signature_date TEXT,
        
        -- Approval Info
        approved_by_user_id INTEGER,
        director_name TEXT,
        director_signature TEXT,
        approval_date TEXT,
        rejection_reason TEXT,
        
        -- Timestamps
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        
        FOREIGN KEY (created_by_user_id) REFERENCES users(id),
        FOREIGN KEY (approved_by_user_id) REFERENCES users(id)
      )
    `);

    // Indexes
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_vouchers_user ON vouchers(created_by_user_id)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_vouchers_dept ON vouchers(department)`);
    await dbRun(`CREATE INDEX IF NOT EXISTS idx_vouchers_cat ON vouchers(expense_category)`);

    // 2. Seed Users if not present
    const existingUsers = await dbAll(`SELECT COUNT(*) as count FROM users`);
    if (existingUsers[0].count === 0) {
      console.log('Seeding initial realistic users...');
      const hashedPassword = await bcrypt.hash('password123', 10);

      const usersToSeed = [
        {
          email: 'employee@prachay.com',
          name: 'Alex Turner',
          role: 'employee',
          department: 'Engineering',
          employee_id: 'EMP-0412',
          signature: createSampleSignature('Alex Turner')
        },
        {
          email: 'priya.patel@prachay.com',
          name: 'Priya Patel',
          role: 'employee',
          department: 'Marketing',
          employee_id: 'EMP-0883',
          signature: createSampleSignature('Priya Patel')
        },
        {
          email: 'director@prachay.com',
          name: 'Sarah Jenkins',
          role: 'director',
          department: 'Executive Management',
          employee_id: 'DIR-0001',
          signature: createSampleSignature('Sarah Jenkins')
        },
        {
          email: 'accounts@prachay.com',
          name: 'Rohit Verma',
          role: 'accounts',
          department: 'Finance & Accounts',
          employee_id: 'ACC-0024',
          signature: null
        }
      ];

      for (const u of usersToSeed) {
        await dbRun(
          `INSERT INTO users (email, password_hash, name, role, department, employee_id, default_signature) 
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [u.email, hashedPassword, u.name, u.role, u.department, u.employee_id, u.signature]
        );
      }
      console.log('Users seeded successfully!');
    }

    // 3. Seed initial realistic vouchers if empty
    const existingVouchers = await dbAll(`SELECT COUNT(*) as count FROM vouchers`);
    if (existingVouchers[0].count === 0) {
      console.log('Seeding initial expense vouchers...');
      const alex = await dbGet(`SELECT * FROM users WHERE email = 'employee@prachay.com'`);
      const priya = await dbGet(`SELECT * FROM users WHERE email = 'priya.patel@prachay.com'`);
      const director = await dbGet(`SELECT * FROM users WHERE email = 'director@prachay.com'`);

      const now = new Date();
      const fmtDate = (d) => d.toISOString().split('T')[0];
      const fmtIso = (d) => d.toISOString();

      const sampleVouchers = [
        {
          voucher_number: 'EV-2026-0001',
          voucher_date: fmtDate(new Date(now.getTime() - 86400000 * 5)),
          expense_date: fmtDate(new Date(now.getTime() - 86400000 * 7)),
          department: 'Engineering',
          expense_title: 'AWS Cloud Hosting & Server Migration Fees',
          expense_category: 'Software & Subscriptions',
          expense_description: 'Monthly production cluster scale-out and database instance reservation for Q2 platform launch.',
          amount: 34500.00,
          status: 'Approved',
          created_by_user_id: alex.id,
          employee_name: alex.name,
          employee_id: alex.employee_id,
          employee_signature: alex.default_signature,
          employee_signature_date: fmtIso(new Date(now.getTime() - 86400000 * 5)),
          approved_by_user_id: director.id,
          director_name: director.name,
          director_signature: director.default_signature,
          approval_date: fmtIso(new Date(now.getTime() - 86400000 * 4)),
          rejection_reason: null,
          created_at: fmtIso(new Date(now.getTime() - 86400000 * 5)),
          updated_at: fmtIso(new Date(now.getTime() - 86400000 * 4))
        },
        {
          voucher_number: 'EV-2026-0002',
          voucher_date: fmtDate(new Date(now.getTime() - 86400000 * 2)),
          expense_date: fmtDate(new Date(now.getTime() - 86400000 * 3)),
          department: 'Engineering',
          expense_title: 'Client Technical Strategy Dinner - FinTech Summit',
          expense_category: 'Client Meeting',
          expense_description: 'Hosted meeting with institutional banking partners during the BFSI Innovation summit in Mumbai.',
          amount: 8750.00,
          status: 'Pending Approval',
          created_by_user_id: alex.id,
          employee_name: alex.name,
          employee_id: alex.employee_id,
          employee_signature: alex.default_signature,
          employee_signature_date: fmtIso(new Date(now.getTime() - 86400000 * 2)),
          approved_by_user_id: null,
          director_name: null,
          director_signature: null,
          approval_date: null,
          rejection_reason: null,
          created_at: fmtIso(new Date(now.getTime() - 86400000 * 2)),
          updated_at: fmtIso(new Date(now.getTime() - 86400000 * 2))
        },
        {
          voucher_number: 'EV-2026-0003',
          voucher_date: fmtDate(now),
          expense_date: fmtDate(now),
          department: 'Engineering',
          expense_title: 'Ergonomic Keyboards & USB-C Docking Stations',
          expense_category: 'Office Supplies',
          expense_description: 'Replacement peripherals and high-speed multi-monitor docks for the core infrastructure team.',
          amount: 14200.00,
          status: 'Draft',
          created_by_user_id: alex.id,
          employee_name: alex.name,
          employee_id: alex.employee_id,
          employee_signature: null,
          employee_signature_date: null,
          approved_by_user_id: null,
          director_name: null,
          director_signature: null,
          approval_date: null,
          rejection_reason: null,
          created_at: fmtIso(now),
          updated_at: fmtIso(now)
        },
        {
          voucher_number: 'EV-2026-0004',
          voucher_date: fmtDate(new Date(now.getTime() - 86400000 * 6)),
          expense_date: fmtDate(new Date(now.getTime() - 86400000 * 8)),
          department: 'Marketing',
          expense_title: 'Digital Ad Campaigns - Q2 Customer Acquisition',
          expense_category: 'Other',
          expense_description: 'Paid search and LinkedIn sponsored promotions for H1 brand visibility. Lodging bills attached.',
          amount: 52000.00,
          status: 'Rejected',
          created_by_user_id: priya.id,
          employee_name: priya.name,
          employee_id: priya.employee_id,
          employee_signature: priya.default_signature,
          employee_signature_date: fmtIso(new Date(now.getTime() - 86400000 * 6)),
          approved_by_user_id: director.id,
          director_name: director.name,
          director_signature: null,
          approval_date: null,
          rejection_reason: 'GST invoice is missing the corporate tax entity identifier. Please obtain a revised invoice with Prachay Securities GSTIN and re-submit.',
          created_at: fmtIso(new Date(now.getTime() - 86400000 * 6)),
          updated_at: fmtIso(new Date(now.getTime() - 86400000 * 5))
        },
        {
          voucher_number: 'EV-2026-0005',
          voucher_date: fmtDate(new Date(now.getTime() - 86400000 * 1)),
          expense_date: fmtDate(new Date(now.getTime() - 86400000 * 2)),
          department: 'Marketing',
          expense_title: 'Corporate Event Booth Setup & Banner Printing',
          expense_category: 'Office Supplies',
          expense_description: 'Standee banners, high-gloss flyers, and branded conference materials for the Wealth Management Expo.',
          amount: 19800.00,
          status: 'Pending Approval',
          created_by_user_id: priya.id,
          employee_name: priya.name,
          employee_id: priya.employee_id,
          employee_signature: priya.default_signature,
          employee_signature_date: fmtIso(new Date(now.getTime() - 86400000 * 1)),
          approved_by_user_id: null,
          director_name: null,
          director_signature: null,
          approval_date: null,
          rejection_reason: null,
          created_at: fmtIso(new Date(now.getTime() - 86400000 * 1)),
          updated_at: fmtIso(new Date(now.getTime() - 86400000 * 1))
        }
      ];

      for (const v of sampleVouchers) {
        await dbRun(
          `INSERT INTO vouchers (
            voucher_number, voucher_date, expense_date, department, expense_title, expense_category,
            expense_description, amount, status, created_by_user_id, employee_name, employee_id,
            employee_signature, employee_signature_date, approved_by_user_id, director_name,
            director_signature, approval_date, rejection_reason, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            v.voucher_number, v.voucher_date, v.expense_date, v.department, v.expense_title, v.expense_category,
            v.expense_description, v.amount, v.status, v.created_by_user_id, v.employee_name, v.employee_id,
            v.employee_signature, v.employee_signature_date, v.approved_by_user_id, v.director_name,
            v.director_signature, v.approval_date, v.rejection_reason, v.created_at, v.updated_at
          ]
        );
      }
      console.log('Sample vouchers seeded successfully!');
    }
  } catch (err) {
    console.error('Error during DB initialization:', err);
  }
};

module.exports = {
  db,
  dbRun,
  dbGet,
  dbAll,
  initDatabase,
  uploadsDir
};
