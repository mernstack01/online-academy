# Online Academy Routes (Ordered)

## Pages (UI)

1. `/`  
   Landing page, hero section and entry point.

2. `/courses`  
   Public course catalog (published courses).

3. `/courses/[id]`  
   Course detail page, enrollment CTA.

4. `/login`  
   Login form.

5. `/register`  
   Registration form (role selection for dev).

6. `/student/dashboard`  
   Student overview: enrollments, grades, deadlines, portfolio.

7. `/student/courses/[id]`  
   Course player for enrolled students.

8. `/student/assignments/[id]`  
   Student assignment submission page.

9. `/teacher/dashboard`  
   Teacher overview: courses, grading queue, assignments.

10. `/teacher/courses/new`  
    Create a new course.

11. `/teacher/courses/[id]`  
    Course editor: modules, lessons, assignments, publish.

12. `/teacher/assignments/[id]`  
    Assignment detail + list of submissions.

13. `/teacher/submissions/[id]`  
    Single submission grading view.

14. `/admin`  
    Admin dashboard with platform stats.

15. `/unauthorized`  
    Access denied page.

## API Routes

### Auth

1. `POST /api/auth/register`  
   Register user (name, email, password, role). Returns JWT + user.

2. `POST /api/auth/login`  
   Login user. Returns JWT + user.

3. `GET /api/auth/me`  
   Validate token and return authenticated user.

### Courses

4. `GET /api/courses`  
   Public: list published courses. Teacher/Admin: list all courses.

5. `POST /api/courses`  
   Create course (Teacher/Admin).

6. `GET /api/courses/[id]`  
   Get course detail. Draft access limited to teacher/admin or enrolled student.

7. `PUT /api/courses/[id]`  
   Update course (Teacher/Admin).

8. `DELETE /api/courses/[id]`  
   Delete course (Admin only).

### Modules & Lessons

9. `POST /api/courses/[id]/modules`  
   Add a module to a course (Teacher/Admin).

10. `POST /api/modules/[id]/lessons`  
    Add a lesson to a module (Teacher/Admin).

### Enrollment

11. `POST /api/courses/[id]/enroll`  
    Enroll student in a course (Student).

12. `GET /api/courses/[id]/enroll`  
    Check enrollment status (Student).

### Assignments

13. `POST /api/assignments`  
    Create assignment (Teacher/Admin).

14. `GET /api/assignments?courseId=...`  
    List assignments for a course (Student/Teacher/Admin).

15. `GET /api/assignments/[id]`  
    Get assignment detail (Student/Teacher/Admin).

16. `GET /api/assignments/[id]/submissions`  
    List all submissions for an assignment (Teacher/Admin).

### Submissions

17. `POST /api/submissions`  
    Submit an assignment (Student).

18. `GET /api/submissions?assignmentId=...`  
    Get current student’s own submission for an assignment (Student).

19. `GET /api/submissions/[id]`  
    Get submission detail (Teacher/Admin).

20. `PUT /api/submissions/grade`  
    Grade a submission (Teacher/Admin).

### Portfolio

21. `POST /api/portfolio`  
    Add submission to portfolio (Student).

22. `GET /api/portfolio`  
    List student portfolio items (Student).

23. `DELETE /api/portfolio/[id]`  
    Remove portfolio item (Student).

### Admin

24. `GET /api/admin/stats`  
    Platform statistics (Admin).

### Dev Helper (non-production)

25. `POST /api/dev/seed-course`  
    Create demo course for current teacher/admin.
