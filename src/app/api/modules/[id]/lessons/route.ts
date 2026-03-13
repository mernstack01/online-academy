import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/api-middleware';
import { addLesson, findCourseByModuleId } from '../../../../../services/course.service';
import { UserRole } from '../../../../../types';

/**
 * @route POST /api/modules/[id]/lessons
 * @desc Add a lesson to a module
 * @access Private (Admin, Teacher)
 */
export const POST = withAuth(async (req, { params }) => {
    try {
        const body = await req.json();
        const course = await findCourseByModuleId(params.id);
        if (!course) throw new Error('Course containing this module not found');

        const lesson = await addLesson(course._id.toString(), params.id, body);
        return NextResponse.json(lesson, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
