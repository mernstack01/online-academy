import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/api-middleware';
import { addLesson, findCourseByModuleId } from '../../../../../services/course.service';
import { UserRole } from '../../../../../types';
import { assertCourseManageAccess, getErrorMessage, getErrorStatus } from '@/lib/access-control';

/**
 * @route POST /api/modules/[id]/lessons
 * @desc Add a lesson to a module
 * @access Private (Admin, Teacher)
 */
export const POST = withAuth(async (req, { params, user }) => {
    try {
        const body = await req.json();
        if (body.videoUrl && !isValidVideoUrl(body.videoUrl)) {
            return NextResponse.json(
                { message: 'Video URL must be a valid Vimeo or YouTube link' },
                { status: 400 }
            );
        }
        const course = await findCourseByModuleId(params.id);
        if (!course) throw new Error('Course containing this module not found');
        await assertCourseManageAccess(user, course._id.toString());

        const lesson = await addLesson(course._id.toString(), params.id, body);
        return NextResponse.json(lesson, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error, 400) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);

function isValidVideoUrl(url: string) {
    const vimeo = /vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/;
    const youtube = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/;
    return vimeo.test(url) || youtube.test(url);
}
