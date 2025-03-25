const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const cors = require('cors');

const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(cors());

// Database setup
const db = new sqlite3.Database('./coupons.db', (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the coupons database.');
});

db.run(`CREATE TABLE IF NOT EXISTS coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE,
    is_active INTEGER DEFAULT 1,
    claimed_by TEXT,
    claimed_at DATETIME
)`);

db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)`);

// Admin login route
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const passwordMatch = await bcrypt.compare(password, row.password);
        if (passwordMatch) {
            res.json({ message: 'Login successful' });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    });
});

// Get available coupon
app.get('/coupon', (req, res) => {
    const ipAddress = req.ip;
    const sessionId = req.headers['cookie']; // Assuming session ID is sent in cookie

    // Check for abuse prevention (IP and session)

    db.get('SELECT * FROM coupons WHERE is_active = 1 AND claimed_by IS NULL LIMIT 1', [], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (row) {
            db.run('UPDATE coupons SET claimed_by = ?, claimed_at = datetime("now") WHERE id = ?', [sessionId || ipAddress, row.id], (err) => {
                if (err) {
                    return res.status(500).json({ error: err.message });
                }
                res.json({ coupon: row.code });
            });
        } else {
            res.status(404).json({ message: 'No coupons available' });
        }
    });
});

// Admin routes (add, update, view coupons, etc.) - Implement these

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});