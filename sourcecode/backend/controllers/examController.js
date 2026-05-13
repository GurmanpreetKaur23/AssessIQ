const Exam = require('../models/Exam');
const Question = require('../models/Question');

// GET /api/exams  — all active exams (students see list, admin sees all)
const getExams = async (req, res) => {
  try {
    const filter = req.user.role === 'admin' ? {} : { isActive: true };
    const exams = await Exam.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    res.json(exams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/exams/:id  — exam details + questions
const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name');
    if (!exam) return res.status(404).json({ message: 'Exam not found' });

    const questions = await Question.find({ exam: exam._id }).select(
      req.user.role === 'admin' ? '' : '-correctOption' // hide answer from students
    );

    res.json({ exam, questions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/exams  — admin only
const createExam = async (req, res) => {
  try {
    const { title, subject, description, duration } = req.body;
    if (!title || !subject || !duration)
      return res.status(400).json({ message: 'title, subject and duration are required' });

    const exam = await Exam.create({
      title,
      subject,
      description,
      duration,
      createdBy: req.user.id,
    });
    res.status(201).json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/exams/:id  — admin only
const updateExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    res.json(exam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/exams/:id  — admin only
const deleteExam = async (req, res) => {
  try {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return res.status(404).json({ message: 'Exam not found' });
    await Question.deleteMany({ exam: req.params.id });
    res.json({ message: 'Exam and its questions deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getExams, getExamById, createExam, updateExam, deleteExam };
