const User = require('../../models/User');
const TeacherProfile = require('../../models/TeacherProfile');
const StudentFeedback = require('../../models/StudentFeedback');

exports.createTeacher = async (req, res) => {
  const { name, email, password, department, subjects, experience, qualification, bio } = req.body;
  try {
    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already exists' });

    const user = await User.create({
      name, email,
      password: password || 'Teacher@123',
      role: 'teacher',
      institution: req.user.institution,
    });

    const profile = await TeacherProfile.create({
      userId: user._id,
      department, subjects, experience, qualification, bio,
      institution: req.user.institution,
      adminId: req.user._id,
    });

    res.status(201).json({ user, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeachers = async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let profileQuery = { adminId: req.user._id };
    if (department) profileQuery.department = department;

    let profiles = await TeacherProfile.find(profileQuery)
      .populate('userId', 'name email isActive')
      .skip(skip)
      .limit(Number(limit));

    if (search) {
      profiles = profiles.filter(
        (p) =>
          p.userId?.name?.toLowerCase().includes(search.toLowerCase()) ||
          p.department?.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = await TeacherProfile.countDocuments(profileQuery);
    res.json({ teachers: profiles, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeacher = async (req, res) => {
  try {
    const profile = await TeacherProfile.findOne({ userId: req.params.id }).populate(
      'userId',
      'name email'
    );
    if (!profile) return res.status(404).json({ message: 'Teacher not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const { name, email, password, department, subjects, experience, qualification, bio } = req.body;

    const user = await User.findById(req.params.id);
    if (!user || user.role !== 'teacher') {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      user.email = email;
    }

    if (name !== undefined) user.name = name;
    if (password) user.password = password;
    await user.save();

    const profile = await TeacherProfile.findOneAndUpdate(
      { userId: req.params.id },
      { department, subjects, experience, qualification, bio },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');
    if (!profile) return res.status(404).json({ message: 'Teacher not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    await TeacherProfile.findOneAndDelete({ userId: req.params.id });
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTeacherStats = async (req, res) => {
  try {
    const feedbacks = await StudentFeedback.find({ teacherId: req.params.id });
    if (!feedbacks.length) return res.json({ message: 'No feedback yet', stats: null });

    const avg = (key) =>
      feedbacks.reduce((s, f) => s + f.ratings[key], 0) / feedbacks.length;

    res.json({
      stats: {
        totalFeedbacks: feedbacks.length,
        overallAvg: (feedbacks.reduce((s, f) => s + f.overallRating, 0) / feedbacks.length).toFixed(2),
        communication: avg('communication').toFixed(2),
        clarity: avg('clarity').toFixed(2),
        engagement: avg('engagement').toFixed(2),
        knowledge: avg('knowledge').toFixed(2),
        punctuality: avg('punctuality').toFixed(2),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
