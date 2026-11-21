require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const connect = require('./_lib/db');

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_ORIGIN || true }));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use(async (req, res, next) => {
  try { await connect(); next(); } catch { res.status(500).json({ message: 'Database unavailable' }); }
});

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), require('./_routes/auth'));
app.use('/api/notes', require('./_routes/notes'));

app.use((err, req, res, next) => res.status(500).json({ message: 'Server error' }));

module.exports = app;

// Local dev only (Vercel imports the exported app instead)
if (require.main === module) app.listen(5000, () => console.log('API on http://localhost:5000'));
