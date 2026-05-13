const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { adminOnly } = require('../middleware/roleMiddleware');
const { generateQuestions } = require('../utils/aiHelper');
const Question = require('../models/Question');
const Exam = require('../models/Exam');

// POST /api/ai/generate  — admin only
// Body: { examId, topic, count }
router.post('/generate', protect, adminOnly, async (req, res) => {
  try {
    const { examId, topic, count } = req.body;
    if (!examId || !topic) return res.status(400).json({ message: 'examId and topic are required' });

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const generated = await generateQuestions(topic, count || 5);

    // Bulk insert into DB
    const docs = generated.map((q) => ({ ...q, exam: examId }));
    const inserted = await Question.insertMany(docs);

    // Update totalMarks
    const addedMarks = inserted.reduce((s, q) => s + (q.marks || 1), 0);
    await Exam.findByIdAndUpdate(examId, { $inc: { totalMarks: addedMarks } });

    res.status(201).json({ inserted: inserted.length, questions: inserted });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
