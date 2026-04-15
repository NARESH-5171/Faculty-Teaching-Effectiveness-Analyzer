const mongoose = require('mongoose');

const ratingField = {
  type: Number,
  required: true,
  min: 1,
  max: 5,
};

const studentFeedbackSchema = new mongoose.Schema(
  {
    teacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
    },
    ratings: {
      communication: ratingField,
      clarity: ratingField,
      engagement: ratingField,
      knowledge: ratingField,
      punctuality: ratingField,
    },
    overallRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    comments: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: String,
      required: true,
      trim: true,
    },
    academicYear: {
      type: String,
      required: true,
      trim: true,
    },
    sentiment: {
      label: {
        type: String,
        enum: ['positive', 'negative', 'neutral'],
      },
      score: Number,
      keywords: {
        type: [String],
        default: [],
      },
    },
  },
  { timestamps: true }
);

studentFeedbackSchema.index(
  { teacherId: 1, studentId: 1, subject: 1, semester: 1, academicYear: 1 },
  { unique: true }
);

studentFeedbackSchema.pre('validate', function setOverallRating(next) {
  if (!this.ratings) {
    next();
    return;
  }

  const values = [
    this.ratings.communication,
    this.ratings.clarity,
    this.ratings.engagement,
    this.ratings.knowledge,
    this.ratings.punctuality,
  ].filter((value) => typeof value === 'number');

  if (values.length) {
    this.overallRating = values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  next();
});

module.exports =
  mongoose.models.StudentFeedback ||
  mongoose.model('StudentFeedback', studentFeedbackSchema);
