const User = require('../models/User');

// GET /api/analytics/me
const getMyAnalytics = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const a = user.analytics;

    const accuracy = a.total_questions > 0 ? a.correct / a.total_questions : 0;
    const avg_time = a.total_questions > 0 ? a.total_time / a.total_questions : 0;

    const topic_stats = a.topic_stats.map((t) => ({
      topic: t.topic,
      accuracy: t.total > 0 ? t.correct / t.total : 0,
      avg_time: t.total > 0 ? t.total_time / t.total : 0,
    }));

    // Generate insight messages
    const insights = [];
    if (a.total_questions === 0) {
      insights.push('Complete a test to generate behavioral insights.');
    } else {
      if (accuracy >= 0.8) insights.push('Excellent accuracy! You are above 80%.');
      else if (accuracy >= 0.6) insights.push('Good performance. Target above 80% accuracy.');
      else insights.push('Keep practicing. Focus on understanding fundamentals.');

      if (a.behavior.tab_switches > 5)
        insights.push('High tab-switch count detected — stay focused during tests.');
      if (avg_time > 60) insights.push('Your average response time is high. Try to improve speed.');
    }

    // Recommendations
    const recommendations = [];
    const weak = topic_stats.filter((t) => t.accuracy < 0.5).map((t) => t.topic);
    if (weak.length) recommendations.push({ message: `Focus on: ${weak.slice(0, 3).join(', ')}` });
    if (accuracy < 0.6 && a.total_questions >= 5)
      recommendations.push({ message: 'Revisit foundational concepts before advanced topics.' });
    if (!recommendations.length)
      recommendations.push({ message: 'Keep taking tests to build your performance profile.' });

    res.json({
      accuracy,
      total_questions: a.total_questions,
      avg_time,
      behavior: {
        answer_changes: a.behavior.answer_changes,
        tab_switches: a.behavior.tab_switches,
      },
      topic_stats,
      insights,
      recommendations,
    });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

// GET /api/analytics/admin
const getAdminAnalytics = async (req, res) => {
  try {
    const students = await User.find({ role: 'student' });

    const anomalies = students
      .filter((u) => u.analytics.behavior.tab_switches > 10)
      .map((u) => ({ user_id: u._id.toString(), reason: 'High tab switches' }));

    const clusters = students.map((u) => {
      const acc =
        u.analytics.total_questions > 0
          ? u.analytics.correct / u.analytics.total_questions
          : 0;
      const cluster = acc >= 0.8 ? 'High Performer' : acc >= 0.5 ? 'Moderate' : 'Needs Help';
      return { user_id: u._id.toString(), cluster };
    });

    res.json({ students: students.length, anomalies, clusters });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

module.exports = { getMyAnalytics, getAdminAnalytics };
