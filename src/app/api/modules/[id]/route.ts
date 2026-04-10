import { NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/api-middleware';
import { updateModule, deleteModule, findCourseByModuleId } from '../../../../services/course.service';
import { UserRole } from '../../../../types';
import { assertCourseManageAccess, getErrorMessage, getErrorStatus } from '@/lib/access-control';

/**
 * @route PUT /api/modules/[id]
 * @desc Update a module
 * @access Private (Admin, Teacher)
 */
export const PUT = withAuth(async (req, { params, user }) => {
    try {
        const course = await findCourseByModuleId(params.id);
        if (!course) throw new Error('Course containing this module not found');
        await assertCourseManageAccess(user, course._id.toString());

        const body = await req.json();
        const module = await updateModule(course._id.toString(), params.id, body);
        return NextResponse.json(module);
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error, 400) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);

/**
 * @route DELETE /api/modules/[id]
 * @desc Delete a module
 * @access Private (Admin, Teacher)
 */
export const DELETE = withAuth(async (req, { params, user }) => {
    try {
        const course = await findCourseByModuleId(params.id);
        if (!course) throw new Error('Course containing this module not found');
        await assertCourseManageAccess(user, course._id.toString());

        await deleteModule(course._id.toString(), params.id);
        return NextResponse.json({ message: 'Module deleted successfully' });
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error, 400) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
