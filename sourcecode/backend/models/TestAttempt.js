const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
  topic: String,
  selected_option: String,  // "A" | "B" | "C" | "D"
  is_correct: Boolean,
  time_taken: { type: Number, default: 0 },     // seconds
  answer_changes: { type: Number, default: 0 },
  tab_switches: { type: Number, default: 0 },
  inactivity_seconds: { type: Number, default: 0 },
}, { _id: false });

const testAttemptSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    test_id: { type: String, default: 'default' },
    current_difficulty: { type: Number, default: 2 },
    answered_question_ids: [{ type: mongoose.Schema.Types.ObjectId }],
    answers: [answerSchema],
    question_limit: { type: Number, default: 10 },
    completed: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('TestAttempt', testAttemptSchema);
