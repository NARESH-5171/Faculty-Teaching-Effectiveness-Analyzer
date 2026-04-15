const mongoose = require('mongoose');

const liveEngagementSchema = new mongoose.Schema(
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
    sessionId: {
      type: String,
      required: true,
      trim: true,
    },
    response: {
      type: String,
      enum: ['understand', 'confused'],
      required: true,
    },
  },
  { timestamps: true }
);

liveEngagementSchema.index(
  { teacherId: 1, studentId: 1, sessionId: 1 },
  { unique: true }
);

module.exports =
  mongoose.models.LiveEngagement ||
  mongoose.model('LiveEngagement', liveEngagementSchema);
