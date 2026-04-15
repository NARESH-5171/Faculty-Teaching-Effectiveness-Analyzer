const StudentFeedback = require('../../models/StudentFeedback');
const TeacherProfile = require('../../models/TeacherProfile');
const { analyzeSentiment } = require('./sentimentController');

exports.submitFeedback = async (req, res) => {
  try {
    const existing = await StudentFeedback.findOne({
      teacherId: req.body.teacherId,
      studentId: req.user._id,
      subject: req.body.subject,
      semester: req.body.semester,
      academicYear: req.body.academicYear,
    });
    if (existing)
      return res.status(400).json({ message: 'Feedback already submitted for this teacher/subject/semester' });

    const sentiment = analyzeSentiment(req.body.comments);
    const feedback = await StudentFeedback.create({
      ...req.body,
      studentId: req.user._id,
      ...(sentiment && { sentiment }),
    });
    res.status(201).json(feedback);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeedbackForTeacher = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    const teacherId = req.params.teacherId;

    const feedbacks = await StudentFeedback.find({ teacherId })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await StudentFeedback.countDocuments({ teacherId });
    res.json({ feedbacks, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMyFeedbacks = async (req, res) => {
  try {
    const feedbacks = await StudentFeedback.find({ studentId: req.user._id })
      .populate('teacherId', 'name');
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAvailableTeachers = async (req, res) => {
  try {
    const profiles = await TeacherProfile.find().populate('userId', 'name email');
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
