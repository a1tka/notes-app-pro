const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { User } = require('../_lib/models');
const { sign } = require('../_lib/auth');

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !emailRe.test(email || '') || typeof password !== 'string' || password.length < 8)
      return res.status(400).json({ message: 'Valid name, email and a password of 8+ chars required' });
    if (await User.findOne({ email: email.toLowerCase() }))
      return res.status(409).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12) });
    res.status(201).json({ token: sign(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch (e) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const user = typeof email === 'string' && (await User.findOne({ email: email.toLowerCase() }));
    const ok = user && typeof password === 'string' && (await bcrypt.compare(password, user.password));
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });
    res.json({ token: sign(user._id), user: { id: user._id, name: user.name, email: user.email } });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
