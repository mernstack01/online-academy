import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { getCourseById, updateCourse, deleteCourse } from '@/services/course.service';
import { UserRole } from '@/types';
import { verifyToken } from '@/lib/auth-utils';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';

/**
 * @route GET /api/courses/[id]
 * @desc Get course details with modules and lessons
 * @access Public for published courses, Private for drafts (Admin/Teacher or enrolled Student)
 */
export const GET = async (
    req: Request,
    context: { params: { id?: string } | Promise<{ id?: string }> }
) => {
    try {
        const params = await context.params;
        const courseId = params?.id;
        if (!courseId) {
            return NextResponse.json({ message: 'Course id is required' }, { status: 400 });
        }
        const user = getOptionalUser(req);
        const course = await getCourseById(courseId);
        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }
        if (!course.isPublished) {
            const instructorId =
                typeof course.instructor === 'string'
                    ? course.instructor
                    : (course.instructor as any)?._id?.toString();
            const isAdmin = user?.role === UserRole.ADMIN;
            const isInstructor = user?.role === UserRole.TEACHER && instructorId && user?.id === instructorId;

            if (!isAdmin && !isInstructor) {
                return NextResponse.json({ message: 'Course not available' }, { status: 403 });
            }
        }
        return NextResponse.json(course);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
};

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

function getOptionalUser(req: Request) {
    const authHeader = req.headers.get('authorization');
    const cookieToken = req.headers.get('cookie')
        ?.split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
    const token = cookieToken || authHeader?.replace('Bearer ', '');
    if (!token) return null;
    return verifyToken(token);
}

async function hasEnrollment(studentId?: string, courseId?: string) {
    if (!studentId || !courseId) return false;
    await dbConnect();
    const enrollment = await Enrollment.findOne({ studentId, courseId });
    return !!enrollment;
}
