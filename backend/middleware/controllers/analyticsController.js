const StudentFeedback = require('../../models/StudentFeedback');
const TeacherProfile = require('../../models/TeacherProfile');
const User = require('../../models/User');

exports.getOverallAnalytics = async (req, res) => {
  try {
    const profiles = await TeacherProfile.find({ adminId: req.user._id }).select('userId');
    const teacherIds = profiles.map((p) => p.userId);

    const feedbacks = await StudentFeedback.find({ teacherId: { $in: teacherIds } });
    if (!feedbacks.length) return res.json({ message: 'No data yet', data: null });

    const categories = ['communication', 'clarity', 'engagement', 'knowledge', 'punctuality'];
    const categoryAvgs = {};
    categories.forEach((c) => {
      categoryAvgs[c] = (
        feedbacks.reduce((s, f) => s + f.ratings[c], 0) / feedbacks.length
      ).toFixed(2);
    });

    const overallAvg = (
      feedbacks.reduce((s, f) => s + f.overallRating, 0) / feedbacks.length
    ).toFixed(2);

    // Trend: group by month
    const trendMap = {};
    feedbacks.forEach((f) => {
      const key = new Date(f.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!trendMap[key]) trendMap[key] = { total: 0, count: 0 };
      trendMap[key].total += f.overallRating;
      trendMap[key].count += 1;
    });
    const trend = Object.entries(trendMap).map(([month, v]) => ({
      month,
      avg: (v.total / v.count).toFixed(2),
    }));

    res.json({
      data: {
        totalTeachers: teacherIds.length,
        totalFeedbacks: feedbacks.length,
        overallAvg,
        categoryAvgs,
        trend,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeacherAnalytics = async (req, res) => {
  try {
    const feedbacks = await StudentFeedback.find({ teacherId: req.params.teacherId })
      .sort({ createdAt: 1 });

    if (!feedbacks.length) return res.json({ message: 'No feedback yet', data: null });

    const categories = ['communication', 'clarity', 'engagement', 'knowledge', 'punctuality'];
    const categoryAvgs = {};
    categories.forEach((c) => {
      categoryAvgs[c] = parseFloat(
        (feedbacks.reduce((s, f) => s + f.ratings[c], 0) / feedbacks.length).toFixed(2)
      );
    });

    const overallAvg = parseFloat(
      (feedbacks.reduce((s, f) => s + f.overallRating, 0) / feedbacks.length).toFixed(2)
    );

    // Trend over time
    const trendMap = {};
    feedbacks.forEach((f) => {
      const key = new Date(f.createdAt).toLocaleString('default', { month: 'short', year: 'numeric' });
      if (!trendMap[key]) trendMap[key] = { total: 0, count: 0 };
      trendMap[key].total += f.overallRating;
      trendMap[key].count += 1;
    });
    const trend = Object.entries(trendMap).map(([month, v]) => ({
      month,
      avg: parseFloat((v.total / v.count).toFixed(2)),
    }));

    // Strengths & weaknesses
    const sorted = Object.entries(categoryAvgs).sort((a, b) => b[1] - a[1]);
    const strengths = sorted.slice(0, 2).map(([k]) => k);
    const weaknesses = sorted.slice(-2).map(([k]) => k);
   
    const suggestions = weaknesses.map((w) => {
      const map = {
        communication: 'Consider interactive sessions and clearer verbal explanations.',
        clarity: 'Use more examples, diagrams, and structured lesson plans.',
        engagement: 'Incorporate group activities and real-world case studies.',
        knowledge: 'Stay updated with latest research and industry trends.',
        punctuality: 'Maintain consistent schedule and respect class timings.',
      };
      return map[w];
    });

    res.json({
      data: { overallAvg, categoryAvgs, trend, strengths, weaknesses, suggestions, totalFeedbacks: feedbacks.length },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTopTeachers = async (req, res) => {
  try {
    const profiles = await TeacherProfile.find({ adminId: req.user._id }).populate('userId', 'name');
    const results = [];

    for (const p of profiles) {
      const feedbacks = await StudentFeedback.find({ teacherId: p.userId._id });
      if (!feedbacks.length) continue;
      const avg = feedbacks.reduce((s, f) => s + f.overallRating, 0) / feedbacks.length;
      results.push({ teacher: p.userId.name, teacherId: p.userId._id, avg: parseFloat(avg.toFixed(2)), count: feedbacks.length });
    }

    results.sort((a, b) => b.avg - a.avg);
    res.json(results.slice(0, 10));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
