# Faculty Teaching Effectiveness Analyzer

A full-stack MERN application for evaluating teacher performance through student feedback and analytics.

## Features

- **3-Role System**: Admin (institution), Teacher, Student
- **3-Day Free Trial** for new admin accounts
- **Analytics Dashboard** with Radar, Line, and Bar charts
- **Student Feedback** with 5-category star ratings
- **Export** reports as CSV or PDF
- **Search & Filter** teachers with pagination
- **JWT Authentication** with bcrypt password hashing

---

## Prerequisites

- Node.js v18+
- MongoDB (local or Atlas)
- npm

---

## Setup Instructions

### 1. Clone / Open the project

```
cd "faculty teaching analyzer"
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the env example and configure:
```bash
copy .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/faculty_analyzer
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

### 4. Seed Sample Data (optional)

```bash
cd backend
node seed.js
```

This creates:
| Role    | Email                        | Password    |
|---------|------------------------------|-------------|
| Admin   | admin@university.edu         | admin123    |
| Teacher | alice@university.edu         | Teacher@123 |
| Teacher | bob@university.edu           | Teacher@123 |
| Teacher | carol@university.edu         | Teacher@123 |
| Student | student1@university.edu      | student123  |

---

## Running the Application

### Start Backend
```bash
cd backend
npm run dev
```
Backend runs on: http://localhost:5000

### Start Frontend
```bash
cd frontend
npm start
```
Frontend runs on: http://localhost:3000

---

## API Documentation

### Auth
| Method | Endpoint           | Description        | Auth |
|--------|--------------------|--------------------|------|
| POST   | /api/auth/register | Register user      | No   |
| POST   | /api/auth/login    | Login              | No   |
| GET    | /api/auth/me       | Get current user   | Yes  |

### Teachers (Admin only)
| Method | Endpoint              | Description         |
|--------|-----------------------|---------------------|
| GET    | /api/teachers         | List all teachers   |
| POST   | /api/teachers         | Add teacher         |
| GET    | /api/teachers/:id     | Get teacher         |
| PUT    | /api/teachers/:id     | Update teacher      |
| DELETE | /api/teachers/:id     | Delete teacher      |
| GET    | /api/teachers/:id/stats | Teacher stats     |

### Feedback
| Method | Endpoint                    | Description              |
|--------|-----------------------------|--------------------------|
| POST   | /api/feedback               | Submit feedback (student)|
| GET    | /api/feedback/my            | My feedbacks (student)   |
| GET    | /api/feedback/teachers      | Available teachers       |
| GET    | /api/feedback/:teacherId    | Teacher feedbacks        |

### Analytics (Admin/Teacher)
| Method | Endpoint                          | Description            |
|--------|-----------------------------------|------------------------|
| GET    | /api/analytics/overall            | Institution analytics  |
| GET    | /api/analytics/top-teachers       | Top teachers           |
| GET    | /api/analytics/teacher/:teacherId | Teacher analytics      |

### Export (Admin)
| Method | Endpoint       | Description     |
|--------|----------------|-----------------|
| GET    | /api/export/csv | Export CSV      |
| GET    | /api/export/pdf | Export PDF      |

---

## Project Structure

```
faculty teaching analyzer/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── teacherController.js
│   │   ├── feedbackController.js
│   │   ├── analyticsController.js
│   │   └── exportController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── TeacherProfile.js
│   │   └── StudentFeedback.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── teachers.js
│   │   ├── feedback.js
│   │   ├── analytics.js
│   │   └── export.js
│   ├── seed.js
│   ├── server.js
│   ├── .env
│   └── package.json
└── frontend/
    ├── src/
    │   ├── api/axios.js
    │   ├── context/AuthContext.js
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   └── ProtectedRoute.js
    │   ├── pages/
    │   │   ├── AuthPage.js
    │   │   ├── Dashboard.js
    │   │   ├── Teachers.js
    │   │   ├── TeacherForm.js
    │   │   ├── AnalyticsPage.js
    │   │   ├── FeedbackForm.js
    │   │   ├── TeacherDashboard.js
    │   │   └── TrialExpired.js
    │   ├── App.js
    │   ├── App.css
    │   └── index.js
    └── package.json
```

---

## Trial System

- When an Admin registers, `trialStartDate` is set to the current date
- A middleware checks if `Date.now() - trialStartDate > 3 days`
- If expired: analytics, teacher management, and export routes return `403`
- Frontend redirects to `/trial-expired` page with upgrade option
