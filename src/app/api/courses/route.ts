import { NextResponse } from 'next/server';
import { withAuth } from '../../../lib/api-middleware';
import { createCourse, getCourses } from '../../../services/course.service';
import { UserRole } from '../../../types';
import { verifyToken } from '../../../lib/auth-utils';
import { AuthenticatedUser, getErrorMessage } from '@/lib/access-control';
import { getDevFallbackCourses } from '@/lib/dev-course-fallback';
import { isDatabaseConnectionError } from '@/lib/db-errors';

/**
 * @route GET /api/courses
 * @desc Get all courses
 * @access Public (returns published courses). Admin can include drafts via includeDrafts=true.
 */
export const GET = async (req: Request) => {
    const user = getOptionalUser(req);
    const { searchParams } = new URL(req.url);
    const includeDraftsParam = searchParams.get('includeDrafts') === 'true';

    try {
        let query: Record<string, unknown> = { isPublished: true };

        if (includeDraftsParam && user?.role === UserRole.ADMIN) {
            query = {};
        } else if (includeDraftsParam && user?.role === UserRole.TEACHER) {
            query = {
                $or: [
                    { isPublished: true },
                    { instructor: user.id },
                ],
            };
        }

        const courses = await getCourses(query);
        return NextResponse.json(courses);
    } catch (error: unknown) {
        if (!includeDraftsParam && process.env.NODE_ENV === 'development' && isDatabaseConnectionError(error)) {
            return NextResponse.json(getDevFallbackCourses());
        }

        return NextResponse.json({ message: getErrorMessage(error) }, { status: 500 });
    }
};

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
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: 400 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);

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
