const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 60 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
}, { timestamps: true });

const noteSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  content: { type: String, required: true }, // stored encrypted
}, { timestamps: true });

exports.User = mongoose.models.User || mongoose.model('User', userSchema);
exports.Note = mongoose.models.Note || mongoose.model('Note', noteSchema);
