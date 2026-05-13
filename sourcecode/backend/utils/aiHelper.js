const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Generate MCQ questions for a given topic using GPT.
 * @param {string} topic - Subject/topic for questions
 * @param {number} count - Number of questions to generate
 * @returns {Array} Array of question objects { text, options[4], correctOption }
 */
const generateQuestions = async (topic, count = 5) => {
  const prompt = `Generate ${count} multiple choice questions about "${topic}".
Return a valid JSON array only, no extra text. Each item must have:
- "text": question string
- "options": array of exactly 4 strings
- "correctOption": index (0-3) of the correct option
- "marks": number (default 1)

Example format:
[{"text":"...","options":["a","b","c","d"],"correctOption":2,"marks":1}]`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
  });

  const raw = response.choices[0].message.content.trim();
  // Strip markdown code fences if present
  const json = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
  return JSON.parse(json);
};

module.exports = { generateQuestions };
