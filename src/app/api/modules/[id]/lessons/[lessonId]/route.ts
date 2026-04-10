import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../../lib/api-middleware';
import { updateLesson, deleteLesson, findCourseByModuleId } from '../../../../../../services/course.service';
import { UserRole } from '../../../../../../types';
import { assertCourseManageAccess, getErrorMessage, getErrorStatus } from '@/lib/access-control';

/**
 * @route PUT /api/modules/[id]/lessons/[lessonId]
 * @desc Update a lesson
 * @access Private (Admin, Teacher)
 */
export const PUT = withAuth(async (req, { params, user }) => {
    try {
        const course = await findCourseByModuleId(params.id);
        if (!course) throw new Error('Course containing this module not found');
        await assertCourseManageAccess(user, course._id.toString());

        const body = await req.json();
        const lesson = await updateLesson(course._id.toString(), params.id, params.lessonId, body);
        return NextResponse.json(lesson);
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error, 400) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);

/**
 * @route DELETE /api/modules/[id]/lessons/[lessonId]
 * @desc Delete a lesson
 * @access Private (Admin, Teacher)
 */
export const DELETE = withAuth(async (req, { params, user }) => {
    try {
        const course = await findCourseByModuleId(params.id);
        if (!course) throw new Error('Course containing this module not found');
        await assertCourseManageAccess(user, course._id.toString());

        await deleteLesson(course._id.toString(), params.id, params.lessonId);
        return NextResponse.json({ message: 'Lesson deleted successfully' });
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error, 400) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
