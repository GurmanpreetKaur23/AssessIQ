const Question = require('../models/Question');
const TestAttempt = require('../models/TestAttempt');

const QUESTION_LIMIT = 10;

const formatQuestion = (q) => ({
  id: q._id.toString(),
  text: q.text,
  options: q.options,
  topic: q.topic,
  subtopic: q.subtopic,
  difficulty: q.difficulty,
});

// Pick a question at target difficulty not yet answered in this attempt
async function pickQuestion(difficulty, excludeIds) {
  // Try exact difficulty first
  let q = await Question.findOne({
    active: true,
    difficulty,
    _id: { $nin: excludeIds },
  });

  // Fallback: widen search ±1 then ±2
  if (!q) {
    for (let delta = 1; delta <= 4; delta++) {
      const d = [difficulty + delta, difficulty - delta].filter((v) => v >= 1 && v <= 5);
      q = await Question.findOne({ active: true, difficulty: { $in: d }, _id: { $nin: excludeIds } });
      if (q) break;
    }
  }
  return q || null;
}

// GET /api/tests
const getTests = async (req, res) => {
  try {
    const count = await Question.countDocuments({ active: true });
    res.json([
      {
        id: 'default',
        title: 'AssessIQ Adaptive Diagnostic',
        mode: 'adaptive',
        time_limit_minutes: 30,
        question_limit: Math.min(QUESTION_LIMIT, count),
      },
    ]);
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// POST /api/tests/start
const startTest = async (req, res) => {
  try {
    const question_limit = QUESTION_LIMIT;
    const firstQuestion = await pickQuestion(2, []);
    if (!firstQuestion)
      return res.status(404).json({ detail: 'No questions available. Ask an admin to add questions first.' });

    const attempt = await TestAttempt.create({
      user: req.user._id,
      test_id: req.body.test_id || 'default',
      current_difficulty: 2,
      answered_question_ids: [firstQuestion._id],
      question_limit,
    });

    res.json({ attempt_id: attempt._id.toString(), question: formatQuestion(firstQuestion) });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// POST /api/tests/answer
const answerQuestion = async (req, res) => {
  try {
    const {
      attempt_id, question_id, selected_option,
      time_taken, revisit_count, answer_changes, tab_switches, inactivity_seconds,
    } = req.body;

    const attempt = await TestAttempt.findById(attempt_id);
    if (!attempt) return res.status(404).json({ detail: 'Test attempt not found' });
    if (attempt.user.toString() !== req.user._id.toString())
      return res.status(403).json({ detail: 'Not authorized' });

    const question = await Question.findById(question_id);
    if (!question) return res.status(404).json({ detail: 'Question not found' });

    const is_correct = selected_option === question.correct_option;

    attempt.answers.push({
      question: question._id,
      topic: question.topic,
      selected_option,
      is_correct,
      time_taken: time_taken || 0,
      answer_changes: answer_changes || 0,
      tab_switches: tab_switches || 0,
      inactivity_seconds: inactivity_seconds || 0,
    });

    // Adaptive difficulty
    const new_difficulty = is_correct
      ? Math.min(attempt.current_difficulty + 1, 5)
      : Math.max(attempt.current_difficulty - 1, 1);
    attempt.current_difficulty = new_difficulty;

    const completed = attempt.answers.length >= attempt.question_limit;

    if (completed) {
      attempt.completed = true;
      await attempt.save();
      await _updateUserAnalytics(req.user._id, attempt);
      return res.json({ is_correct, explanation: question.explanation, difficulty: new_difficulty, completed: true });
    }

    const nextQuestion = await pickQuestion(new_difficulty, attempt.answered_question_ids);
    if (!nextQuestion) {
      attempt.completed = true;
      await attempt.save();
      await _updateUserAnalytics(req.user._id, attempt);
      return res.json({ is_correct, explanation: question.explanation, difficulty: new_difficulty, completed: true });
    }

    attempt.answered_question_ids.push(nextQuestion._id);
    await attempt.save();

    res.json({
      is_correct,
      explanation: question.explanation,
      difficulty: new_difficulty,
      completed: false,
      next_question: formatQuestion(nextQuestion),
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

async function _updateUserAnalytics(userId, attempt) {
  try {
    const User = require('../models/User');
    const user = await User.findById(userId);
    if (!user) return;

    const a = user.analytics;
    a.total_questions += attempt.answers.length;
    a.correct += attempt.answers.filter((x) => x.is_correct).length;
    a.total_time += attempt.answers.reduce((s, x) => s + (x.time_taken || 0), 0);
    a.behavior.answer_changes += attempt.answers.reduce((s, x) => s + (x.answer_changes || 0), 0);
    a.behavior.tab_switches += attempt.answers.reduce((s, x) => s + (x.tab_switches || 0), 0);

    for (const ans of attempt.answers) {
      const stat = a.topic_stats.find((t) => t.topic === ans.topic);
      if (stat) {
        stat.total++;
        if (ans.is_correct) stat.correct++;
        stat.total_time += ans.time_taken || 0;
      } else {
        a.topic_stats.push({
          topic: ans.topic,
          correct: ans.is_correct ? 1 : 0,
          total: 1,
          total_time: ans.time_taken || 0,
        });
      }
    }

    user.markModified('analytics');
    await user.save();
  } catch (err) {
    console.error('Analytics update error:', err.message);
  }
}

module.exports = { getTests, startTest, answerQuestion };
