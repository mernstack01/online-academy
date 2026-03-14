# Online Academy (LMS) — Technical Specification

## 1. Purpose
Online Academy is a learning management platform where teachers create courses, students enroll and complete assignments, and admins monitor the system.

## 2. Roles & Permissions

### 2.1 Student
- View published courses.
- Enroll in a course.
- Access lessons for enrolled courses.
- Submit assignments (file/project URL + optional comment).
- View submission status (pending/graded) and grades.
- Manage and view portfolio items.
- Access student dashboard (progress + stats).

### 2.2 Teacher
- Create courses.
- Edit courses (title, description, price, thumbnail, publish state).
- Add modules and lessons to a course.
- Create assignments for courses.
- View submissions for their course assignments.
- Grade submissions (grade + feedback).
- Access teacher dashboard (courses + grading queue).

### 2.3 Admin
- Full teacher permissions.
- Access admin dashboard with platform statistics.
- System oversight of users/courses/submissions.

## 3. Core Features

### 3.1 Authentication
- Register + login with JWT.
- Token stored in localStorage and cookie.
- `/api/auth/me` validates session and returns user.

### 3.2 Courses
- Created by teacher/admin.
- Can be `Draft` or `Published`.
- Public users see only published courses.
- Drafts visible to teacher/admin or enrolled students.

### 3.3 Modules & Lessons
- Courses contain ordered modules.
- Modules contain ordered lessons.
- Lessons can include content, video URL, and resources.

### 3.4 Assignments
- Teacher/admin creates assignments for courses.
- Students submit assignment links.
- Teacher/admin grades submissions.

### 3.5 Portfolio
- Students can add submissions to portfolio.
- Portfolio entries show in student dashboard.

## 4. Access Matrix (Summary)

- Create Course: Teacher, Admin
- Update Course: Teacher, Admin
- Delete Course: Admin
- Add Module/Lesson: Teacher, Admin
- Create Assignment: Teacher, Admin
- Submit Assignment: Student
- Grade Submission: Teacher, Admin
- Admin Stats: Admin

## 5. Pages

### Public
- `/` (Landing)
- `/courses` (Course list)
- `/courses/[id]` (Course detail)
- `/login`
- `/register`

### Student
- `/student/dashboard`
- `/student/courses/[id]`
- `/student/assignments/[id]`

### Teacher
- `/teacher/dashboard`
- `/teacher/courses/new`
- `/teacher/courses/[id]`
- `/teacher/assignments/[id]`
- `/teacher/submissions/[id]`

### Admin
- `/admin`

### Common
- `/unauthorized`

## 6. API Endpoints

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Courses
- `GET /api/courses`  
  - Public: only published
  - Teacher/Admin: all courses
- `POST /api/courses`
- `GET /api/courses/[id]`
- `PUT /api/courses/[id]`
- `DELETE /api/courses/[id]`

### Modules & Lessons
- `POST /api/courses/[id]/modules`
- `POST /api/modules/[id]/lessons`

### Enrollment
- `POST /api/courses/[id]/enroll`
- `GET /api/courses/[id]/enroll`

### Assignments
- `POST /api/assignments`
- `GET /api/assignments?courseId=...`
- `GET /api/assignments/[id]`
- `GET /api/assignments/[id]/submissions`

### Submissions
- `POST /api/submissions`
- `GET /api/submissions?assignmentId=...` (student’s own)
- `GET /api/submissions/[id]` (teacher/admin)
- `PUT /api/submissions/grade`

### Portfolio
- `POST /api/portfolio`
- `GET /api/portfolio`
- `DELETE /api/portfolio/[id]`

### Admin
- `GET /api/admin/stats`

### Dev Helper (non-production)
- `POST /api/dev/seed-course`

## 7. Data Models (MongoDB)

### User
- `name`
- `email`
- `password`
- `role` (admin | teacher | student)
- `image`

### Course
- `title`
- `description`
- `price`
- `thumbnail`
- `instructor`
- `modules[]`
- `isPublished`

### Module
- `title`
- `lessons[]`
- `order`

### Lesson
- `title`
- `description`
- `content`
- `videoUrl`
- `resources[]`
- `order`

### Assignment
- `courseId`
- `title`
- `description`
- `dueDate`

### Submission
- `assignmentId`
- `studentId`
- `fileUrl`
- `comment`
- `status` (pending | graded)
- `grade`
- `teacherComment`

### Enrollment
- `studentId`
- `courseId`
- `status` (active | completed)

### Portfolio
- `studentId`
- `submissionId`
- `title`
- `description`

## 8. Workflow (Business Flow)

1. Teacher/Admin registers and logs in.
2. Teacher creates a course.
3. Teacher adds modules and lessons.
4. Teacher sets course to Published.
5. Student browses courses and enrolls.
6. Student views lessons and completes assignments.
7. Teacher grades submissions and leaves feedback.
8. Student reviews grades and adds best work to portfolio.

## 9. Current Notes

- Register page allows choosing any role (including admin) for development.
- Middleware is removed due to Edge JWT compatibility; auth is enforced in API + client.
- Recommended for production: seed admin via DB and restrict admin registration.

## 10. Recommended Next Steps

- Enforce admin creation via seed script.
- Add secure server-side middleware using `jose`.
- Add file upload support (S3/Cloudinary).
- Add course review/publish workflow.
