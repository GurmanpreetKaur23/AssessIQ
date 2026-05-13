const Question = require('../models/Question');

// GET /api/admin/questions
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.find({}).sort({ createdAt: -1 });
    res.json(
      questions.map((q) => ({
        id: q._id.toString(),
        text: q.text,
        options: q.options,
        correct_option: q.correct_option,
        explanation: q.explanation,
        topic: q.topic,
        subtopic: q.subtopic,
        difficulty: q.difficulty,
        active: q.active,
      }))
    );
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// POST /api/admin/questions
const createQuestion = async (req, res) => {
  try {
    const { text, options, correct_option, explanation, topic, subtopic, difficulty, active } = req.body;
    if (!text || !options || !correct_option || !topic)
      return res.status(400).json({ detail: 'text, options, correct_option and topic are required' });

    const question = await Question.create({
      text, options, correct_option, explanation, topic, subtopic, difficulty, active,
    });

    res.status(201).json({
      id: question._id.toString(),
      text: question.text,
      options: question.options,
      correct_option: question.correct_option,
      explanation: question.explanation,
      topic: question.topic,
      subtopic: question.subtopic,
      difficulty: question.difficulty,
      active: question.active,
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

module.exports = { getQuestions, createQuestion };
