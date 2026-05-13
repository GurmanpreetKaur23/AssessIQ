const Result = require('../models/Result');
const Question = require('../models/Question');
const Exam = require('../models/Exam');

// POST /api/results  — student submits exam
const submitExam = async (req, res) => {
  try {
    const { examId, answers, timeTaken } = req.body;
    // answers: [{ questionId, selectedOption }]

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    // Fetch all questions with correct answers
    const questions = await Question.find({ exam: examId });
    if (!questions.length) return res.status(400).json({ message: 'No questions found for this exam' });

    // Auto-grade
    let score = 0;
    const gradedAnswers = questions.map((q) => {
      const submitted = answers.find((a) => a.questionId === q._id.toString());
      const isCorrect =
        submitted !== undefined && submitted.selectedOption === q.correctOption;
      if (isCorrect) score += q.marks || 1;
      return {
        question: q._id,
        selectedOption: submitted ? submitted.selectedOption : null,
      };
    });

    const totalMarks = exam.totalMarks || questions.reduce((s, q) => s + (q.marks || 1), 0);
    const percentage = Math.round((score / totalMarks) * 100);

    const result = await Result.create({
      student: req.user.id,
      exam: examId,
      answers: gradedAnswers,
      score,
      totalMarks,
      percentage,
      timeTaken,
    });

    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/results/me  — student's own results
const getMyResults = async (req, res) => {
  try {
    const results = await Result.find({ student: req.user.id })
      .populate('exam', 'title subject duration')
      .sort({ submittedAt: -1 });
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/results/:resultId  — detailed result (student owns it or admin)
const getResultById = async (req, res) => {
  try {
    const result = await Result.findById(req.params.resultId)
      .populate('exam', 'title subject duration totalMarks')
      .populate('answers.question', 'text options correctOption marks');

    if (!result) return res.status(404).json({ message: 'Result not found' });

    const isOwner = result.student.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorized' });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/results/exam/:examId  — admin: all student results for an exam
const getResultsByExam = async (req, res) => {
  try {
    const results = await Result.find({ exam: req.params.examId })
      .populate('student', 'name email')
      .sort({ score: -1 });

    // Basic analytics
    if (!results.length) return res.json({ results: [], analytics: null });

    const scores = results.map((r) => r.percentage);
    const analytics = {
      totalAttempts: results.length,
      averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
      highestScore: Math.max(...scores),
      lowestScore: Math.min(...scores),
      passCount: scores.filter((s) => s >= 40).length,
    };

    res.json({ results, analytics });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { submitExam, getMyResults, getResultById, getResultsByExam };
