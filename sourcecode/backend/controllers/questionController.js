const Question = require('../models/Question');
const Exam = require('../models/Exam');

// POST /api/questions  — admin only, add a question to an exam
const addQuestion = async (req, res) => {
  try {
    const { examId, text, options, correctOption, marks } = req.body;
    if (!examId || !text || !options || correctOption === undefined)
      return res.status(400).json({ message: 'examId, text, options and correctOption required' });

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const question = await Question.create({ exam: examId, text, options, correctOption, marks });

    // Update totalMarks on the exam
    await Exam.findByIdAndUpdate(examId, { $inc: { totalMarks: marks || 1 } });

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/questions/:id  — admin only
const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.json(question);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/questions/:id  — admin only
const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    await Exam.findByIdAndUpdate(question.exam, { $inc: { totalMarks: -(question.marks || 1) } });
    res.json({ message: 'Question deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { addQuestion, updateQuestion, deleteQuestion };
