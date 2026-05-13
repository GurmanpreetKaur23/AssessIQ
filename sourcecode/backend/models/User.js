const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const topicStatSchema = new mongoose.Schema({
  topic: String,
  correct: { type: Number, default: 0 },
  total: { type: Number, default: 0 },
  total_time: { type: Number, default: 0 },
}, { _id: false });

const analyticsSchema = new mongoose.Schema({
  total_questions: { type: Number, default: 0 },
  correct: { type: Number, default: 0 },
  total_time: { type: Number, default: 0 },
  behavior: {
    answer_changes: { type: Number, default: 0 },
    tab_switches: { type: Number, default: 0 },
  },
  topic_stats: { type: [topicStatSchema], default: [] },
}, { _id: false });

const userSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    status: { type: String, enum: ['online', 'offline'], default: 'offline' },
    analytics: { type: analyticsSchema, default: () => ({}) },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
