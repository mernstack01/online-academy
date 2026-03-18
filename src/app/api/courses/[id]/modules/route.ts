import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/api-middleware';
import { addModule } from '../../../../../services/course.service';
import { UserRole } from '../../../../../types';
import { assertCourseManageAccess, getErrorMessage, getErrorStatus } from '@/lib/access-control';

/**
 * @route POST /api/courses/[id]/modules
 * @desc Add a module to a course
 * @access Private (Admin, Teacher)
 */
export const POST = withAuth(async (req, { params, user }) => {
    try {
        await assertCourseManageAccess(user, params.id);
        const body = await req.json();
        const courseModule = await addModule(params.id, body);
        return NextResponse.json(courseModule, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error, 400) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
