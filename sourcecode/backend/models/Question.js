const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: {
      type: [String],
      validate: { validator: (v) => v.length === 4, message: '4 options required' },
    },
    correct_option: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    explanation: { type: String, default: '' },
    topic: { type: String, required: true },
    subtopic: { type: String, default: '' },
    difficulty: { type: Number, min: 1, max: 5, default: 2 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', questionSchema);
