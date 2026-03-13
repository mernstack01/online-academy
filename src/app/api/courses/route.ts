import { NextResponse } from 'next/server';
import { withAuth } from '../../../lib/api-middleware';
import { createCourse, getCourses } from '../../../services/course.service';
import { UserRole } from '../../../types';

/**
 * @route GET /api/courses
 * @desc Get all courses
 * @access Private (Admin, Teacher, Student)
 */
export const GET = withAuth(async () => {
    try {
        const courses = await getCourses();
        return NextResponse.json(courses);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]);

/**
 * @route POST /api/courses
 * @desc Create a new course
 * @access Private (Admin, Teacher)
 */
export const POST = withAuth(async (req, { user }) => {
    try {
        const body = await req.json();
        const course = await createCourse({
            ...body,
            instructor: user.id,
        });
        return NextResponse.json(course, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
