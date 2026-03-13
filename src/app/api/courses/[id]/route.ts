import { NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/api-middleware';
import { getCourseById, updateCourse, deleteCourse } from '../../../../services/course.service';
import { UserRole } from '../../../../types';

/**
 * @route GET /api/courses/[id]
 * @desc Get course details with modules and lessons
 * @access Private (Admin, Teacher, Student)
 */
export const GET = withAuth(async (req, { params }) => {
    try {
        const course = await getCourseById(params.id);
        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }
        return NextResponse.json(course);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]);

/**
 * @route PUT /api/courses/[id]
 * @desc Update course details
 * @access Private (Admin, Teacher)
 */
export const PUT = withAuth(async (req, { params }) => {
    try {
        const body = await req.json();
        const course = await updateCourse(params.id, body);
        return NextResponse.json(course);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);

/**
 * @route DELETE /api/courses/[id]
 * @desc Delete course
 * @access Private (Admin)
 */
export const DELETE = withAuth(async (req, { params }) => {
    try {
        await deleteCourse(params.id);
        return NextResponse.json({ message: 'Course deleted successfully' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN]);

