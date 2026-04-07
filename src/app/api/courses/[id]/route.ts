import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { updateCourse, deleteCourse } from '@/services/course.service';
import { UserRole } from '@/types';
import { verifyToken } from '@/lib/auth-utils';
import {
    assertCourseManageAccess,
    assertCourseReadAccess,
    AuthenticatedUser,
    getErrorMessage,
    getErrorStatus,
} from '@/lib/access-control';
import { getDevFallbackCourseById } from '@/lib/dev-course-fallback';
import { isDatabaseConnectionError } from '@/lib/db-errors';

/**
 * @route GET /api/courses/[id]
 * @desc Get course details with modules and lessons
 * @access Public for published courses, Private for drafts (Admin/Teacher or enrolled Student)
 */
export const GET = async (
    req: Request,
    context: { params: { id?: string } | Promise<{ id?: string }> }
) => {
    const params = await context.params;
    const courseId = params?.id;

    if (!courseId) {
        return NextResponse.json({ message: 'Course id is required' }, { status: 400 });
    }

    try {
        const user = getOptionalUser(req);
        const course = await assertCourseReadAccess(user, courseId);
        return NextResponse.json(course);
    } catch (error: unknown) {
        if (process.env.NODE_ENV === 'development' && isDatabaseConnectionError(error)) {
            const fallbackCourse = getDevFallbackCourseById(courseId);
            if (fallbackCourse) {
                return NextResponse.json(fallbackCourse);
            }
        }

        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error) });
    }
};

/**
 * @route PUT /api/courses/[id]
 * @desc Update course details
 * @access Private (Admin, Teacher)
 */
export const PUT = withAuth(async (req, { params, user }) => {
    try {
        await assertCourseManageAccess(user, params.id);
        const body = await req.json();
        const course = await updateCourse(params.id, body);
        return NextResponse.json(course);
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error, 400) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);

/**
 * @route DELETE /api/courses/[id]
 * @desc Delete course
 * @access Private (Admin)
 */
export const DELETE = withAuth(async (req, { params, user }) => {
    try {
        await assertCourseManageAccess(user, params.id);
        await deleteCourse(params.id);
        return NextResponse.json({ message: 'Course deleted successfully' });
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error) });
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
    return verifyToken(token) as AuthenticatedUser | null;
}
