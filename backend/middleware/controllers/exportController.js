const StudentFeedback = require('../../models/StudentFeedback');
const TeacherProfile = require('../../models/TeacherProfile');

exports.exportCSV = async (req, res) => {
  try {
    const profiles = await TeacherProfile.find({ adminId: req.user._id }).select('userId');
    const teacherIds = profiles.map((p) => p.userId);
    const feedbacks = await StudentFeedback.find({ teacherId: { $in: teacherIds } })
      .populate('teacherId', 'name')
      .populate('studentId', 'name');

    const rows = feedbacks.map((f) => ({
      Teacher: f.teacherId?.name || '',
      Student: f.studentId?.name || '',
      Subject: f.subject,
      Communication: f.ratings.communication,
      Clarity: f.ratings.clarity,
      Engagement: f.ratings.engagement,
      Knowledge: f.ratings.knowledge,
      Punctuality: f.ratings.punctuality,
      Overall: f.overallRating?.toFixed(2),
      Comments: f.comments || '',
      Date: new Date(f.createdAt).toLocaleDateString(),
    }));

    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(','),
      ...rows.map((r) => headers.map((h) => `"${r[h]}"`).join(',')),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=feedback_report.csv');
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.exportPDF = async (req, res) => {
  try {
    const PDFDocument = require('pdfkit');
    const profiles = await TeacherProfile.find({ adminId: req.user._id }).populate('userId', 'name');
    const doc = new PDFDocument({ margin: 40 });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=analytics_report.pdf');
    doc.pipe(res);

    doc.fontSize(20).text('Faculty Teaching Effectiveness Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    for (const p of profiles) {
      const feedbacks = await StudentFeedback.find({ teacherId: p.userId._id });
      if (!feedbacks.length) continue;

      const avg = (key) =>
        (feedbacks.reduce((s, f) => s + f.ratings[key], 0) / feedbacks.length).toFixed(2);
      const overall = (feedbacks.reduce((s, f) => s + f.overallRating, 0) / feedbacks.length).toFixed(2);

      doc.fontSize(14).fillColor('#2563eb').text(p.userId.name);
      doc.fontSize(11).fillColor('black')
        .text(`Department: ${p.department}  |  Feedbacks: ${feedbacks.length}  |  Overall: ${overall}/5`)
        .text(`Communication: ${avg('communication')}  Clarity: ${avg('clarity')}  Engagement: ${avg('engagement')}`)
        .text(`Knowledge: ${avg('knowledge')}  Punctuality: ${avg('punctuality')}`);
      doc.moveDown();
    }

    doc.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
