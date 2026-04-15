const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    institution: {
      type: String,
      trim: true,
      default: '',
    },
    department: {
      type: String,
      trim: true,
      default: '',
    },
    subjects: {
      type: [String],
      default: [],
    },
    experience: {
      type: Number,
      default: 0,
    },
    qualification: {
      type: String,
      trim: true,
      default: '',
    },
    bio: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { timestamps: true }
);

module.exports =
  mongoose.models.TeacherProfile ||
  mongoose.model('TeacherProfile', teacherProfileSchema);
