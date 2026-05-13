// POST /api/ml/predict-performance
const predictPerformance = async (req, res) => {
  try {
    const { accuracy = 0, avg_time = 30, avg_difficulty = 2, answer_changes = 0, tab_switches = 0 } = req.body;

    // Simple heuristic model (no external ML library needed)
    const speed_score = Math.max(0, 1 - avg_time / 90);           // faster = better
    const difficulty_bonus = ((avg_difficulty - 1) / 4) * 0.1;   // harder questions = slight bonus
    const behavior_penalty = Math.min(0.25, answer_changes * 0.01 + tab_switches * 0.02);

    const raw = accuracy * 0.65 + speed_score * 0.2 + difficulty_bonus - behavior_penalty;
    const predicted_score = Math.min(100, Math.max(0, Math.round(raw * 100)));
    const pass_probability = Math.min(1, Math.max(0, raw * 1.1));

    res.json({ predicted_score, pass_probability });
  } catch (err) {
    res.status(500).json({ detail: err.message });
  }
};

module.exports = { predictPerformance };
