const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const TeacherProfile = require('./models/TeacherProfile');
const StudentFeedback = require('./models/StudentFeedback');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    TeacherProfile.deleteMany({}),
    StudentFeedback.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Create Admin
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@university.edu',
    password: 'admin123',
    role: 'admin',
    institution: 'Tech University',
  });

  // Create Teachers
  const teacherData = [
    { name: 'Dr. Alice Johnson', email: 'alice@university.edu', dept: 'Computer Science', subjects: ['Data Structures', 'Algorithms'], exp: 8, qual: 'Ph.D. CS' },
    { name: 'Prof. Bob Smith', email: 'bob@university.edu', dept: 'Mathematics', subjects: ['Calculus', 'Linear Algebra'], exp: 12, qual: 'M.Sc. Mathematics' },
    { name: 'Dr. Carol White', email: 'carol@university.edu', dept: 'Physics', subjects: ['Mechanics', 'Thermodynamics'], exp: 6, qual: 'Ph.D. Physics' },
  ];

  const teachers = [];
  for (const t of teacherData) {
    const user = await User.create({
      name: t.name, email: t.email, password: 'Teacher@123',
      role: 'teacher', institution: 'Tech University',
    });
    const profile = await TeacherProfile.create({
      userId: user._id, department: t.dept, subjects: t.subjects,
      experience: t.exp, qualification: t.qual,
      institution: 'Tech University', adminId: admin._id,
    });
    teachers.push({ user, profile });
  }

  // Create Students
  const students = [];
  for (let i = 1; i <= 5; i++) {
    const s = await User.create({
      name: `Student ${i}`, email: `student${i}@university.edu`,
      password: 'student123', role: 'student', institution: 'Tech University',
    });
    students.push(s);
  }

  // Create Feedback
  const semesters = ['Sem 1', 'Sem 2'];
  const years = ['2023-24', '2024-25'];
  let feedbackCount = 0;

  for (const teacher of teachers) {
    for (const student of students) {
      for (const sem of semesters) {
        const year = years[Math.floor(Math.random() * years.length)];
        const r = () => Math.floor(Math.random() * 2) + 3; // 3-5
        try {
          await StudentFeedback.create({
            teacherId: teacher.user._id,
            studentId: student._id,
            subject: teacher.profile.subjects[0],
            ratings: { communication: r(), clarity: r(), engagement: r(), knowledge: r(), punctuality: r() },
            comments: `Great teaching style. Very helpful and knowledgeable.`,
            semester: sem,
            academicYear: year,
          });
          feedbackCount++;
        } catch {}
      }
    }
  }

  console.log(`\n✅ Seed complete!`);
  console.log(`   Admin:    admin@university.edu / admin123`);
  console.log(`   Teachers: alice@university.edu, bob@university.edu, carol@university.edu / Teacher@123`);
  console.log(`   Students: student1@university.edu ... student5@university.edu / student123`);
  console.log(`   Feedbacks created: ${feedbackCount}`);

  await mongoose.disconnect();
};

seed().catch((err) => { console.error(err); process.exit(1); });
