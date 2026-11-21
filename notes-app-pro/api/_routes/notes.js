const router = require('express').Router();
const mongoose = require('mongoose');
const { Note } = require('../_lib/models');
const { protect } = require('../_lib/auth');
const { encrypt, decrypt } = require('../_lib/crypto');

router.use(protect);

const out = (n) => ({ _id: n._id, title: n.title, content: decrypt(n.content), updatedAt: n.updatedAt });
const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(400).json({ message: 'Bad id' });
const valid = (b) => b && typeof b.title === 'string' && b.title.trim() && typeof b.content === 'string' && b.content.length <= 20000;

router.get('/', async (req, res) => {
  const notes = await Note.find({ user: req.userId }).sort({ updatedAt: -1 });
  res.json(notes.map(out));
});

router.post('/', async (req, res) => {
  if (!valid(req.body)) return res.status(400).json({ message: 'Title and content required' });
  const note = await Note.create({ user: req.userId, title: req.body.title, content: encrypt(req.body.content) });
  res.status(201).json(out(note));
});

// Every query includes `user: req.userId`, so users can only touch their own notes
router.put('/:id', validId, async (req, res) => {
  if (!valid(req.body)) return res.status(400).json({ message: 'Title and content required' });
  const note = await Note.findOneAndUpdate(
    { _id: req.params.id, user: req.userId },
    { title: req.body.title, content: encrypt(req.body.content) },
    { new: true }
  );
  if (!note) return res.status(404).json({ message: 'Not found' });
  res.json(out(note));
});

router.delete('/:id', validId, async (req, res) => {
  const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!note) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
});

module.exports = router;
