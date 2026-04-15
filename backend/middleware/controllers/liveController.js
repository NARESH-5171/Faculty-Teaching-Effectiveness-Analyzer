const LiveEngagement = require('../../models/LiveEngagement');

// POST /api/live/respond — student sends understand/confused
exports.submitResponse = async (req, res) => {
  try {
    const { teacherId, sessionId, response } = req.body;
    if (!['understand', 'confused'].includes(response))
      return res.status(400).json({ message: 'Invalid response type' });

    // Upsert: one response per student per session
    await LiveEngagement.findOneAndUpdate(
      { teacherId, studentId: req.user._id, sessionId },
      { response },
      { upsert: true, new: true }
    );

    // Emit updated counts via Socket.IO
    const io = req.app.get('io');
    const counts = await getSessionCounts(teacherId, sessionId);
    io.to(`teacher_${teacherId}`).emit('engagement_update', { sessionId, ...counts });

    res.json({ message: 'Response recorded', ...counts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/live/stats/:teacherId/:sessionId
exports.getSessionStats = async (req, res) => {
  try {
    const { teacherId, sessionId } = req.params;
    const counts = await getSessionCounts(teacherId, sessionId);
    res.json(counts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/live/sessions/:teacherId — list all sessions
exports.getSessions = async (req, res) => {
  try {
    const sessions = await LiveEngagement.aggregate([
      { $match: { teacherId: require('mongoose').Types.ObjectId.createFromHexString(req.params.teacherId) } },
      { $group: { _id: '$sessionId', total: { $sum: 1 }, date: { $first: '$createdAt' } } },
      { $sort: { date: -1 } },
      { $limit: 10 },
    ]);
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSessionCounts = async (teacherId, sessionId) => {
  const results = await LiveEngagement.aggregate([
    { $match: { teacherId: require('mongoose').Types.ObjectId.createFromHexString(String(teacherId)), sessionId } },
    { $group: { _id: '$response', count: { $sum: 1 } } },
  ]);
  const understand = results.find((r) => r._id === 'understand')?.count || 0;
  const confused = results.find((r) => r._id === 'confused')?.count || 0;
  return { understand, confused, total: understand + confused };
};
