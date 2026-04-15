const Sentiment = require('sentiment');
const StudentFeedback = require('../../models/StudentFeedback');

const analyzer = new Sentiment();

// Known issue keywords to detect from feedback text
const ISSUE_KEYWORDS = {
  'too fast': ['fast', 'quick', 'rush', 'speed', 'hurry', 'rapid'],
  'unclear explanation': ['unclear', 'confusing', 'confused', 'vague', 'hard to understand', 'difficult to follow'],
  'boring': ['boring', 'dull', 'monotone', 'uninteresting', 'sleep', 'sleepy'],
  'not engaging': ['not engaging', 'passive', 'no interaction', 'one-sided'],
  'too slow': ['slow', 'dragging', 'repetitive', 'repeat'],
  'good examples': ['example', 'examples', 'illustration', 'practical', 'real-world'],
  'helpful': ['helpful', 'supportive', 'approachable', 'available', 'responsive'],
  'well structured': ['structured', 'organized', 'clear', 'systematic', 'logical'],
};

const analyzeSentiment = (text) => {
  if (!text || !text.trim()) return null;

  const result = analyzer.analyze(text);
  const lower = text.toLowerCase();

  // Determine label
  let label = 'neutral';
  if (result.score > 1) label = 'positive';
  else if (result.score < -1) label = 'negative';

  // Extract matched issue keywords
  const keywords = Object.entries(ISSUE_KEYWORDS)
    .filter(([, variants]) => variants.some((v) => lower.includes(v)))
    .map(([key]) => key);

  return { label, score: result.score, keywords };
};

exports.analyzeSentiment = analyzeSentiment;

// GET /api/sentiment/:teacherId — sentiment summary for a teacher
exports.getSentimentSummary = async (req, res) => {
  try {
    const feedbacks = await StudentFeedback.find({
      teacherId: req.params.teacherId,
      'sentiment.label': { $exists: true },
    });

    if (!feedbacks.length) return res.json({ data: null, message: 'No sentiment data yet' });

    const distribution = { positive: 0, negative: 0, neutral: 0 };
    const keywordCount = {};

    feedbacks.forEach((f) => {
      if (f.sentiment?.label) distribution[f.sentiment.label]++;
      f.sentiment?.keywords?.forEach((k) => {
        keywordCount[k] = (keywordCount[k] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([keyword, count]) => ({ keyword, count }));

    res.json({ data: { distribution, topKeywords, total: feedbacks.length } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/sentiment/overall — institution-wide sentiment (admin)
exports.getOverallSentiment = async (req, res) => {
  try {
    const TeacherProfile = require('../../models/TeacherProfile');
    const profiles = await TeacherProfile.find({ adminId: req.user._id }).select('userId');
    const teacherIds = profiles.map((p) => p.userId);

    const feedbacks = await StudentFeedback.find({
      teacherId: { $in: teacherIds },
      'sentiment.label': { $exists: true },
    });

    if (!feedbacks.length) return res.json({ data: null });

    const distribution = { positive: 0, negative: 0, neutral: 0 };
    const keywordCount = {};

    feedbacks.forEach((f) => {
      if (f.sentiment?.label) distribution[f.sentiment.label]++;
      f.sentiment?.keywords?.forEach((k) => {
        keywordCount[k] = (keywordCount[k] || 0) + 1;
      });
    });

    const topKeywords = Object.entries(keywordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([keyword, count]) => ({ keyword, count }));

    res.json({ data: { distribution, topKeywords, total: feedbacks.length } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
