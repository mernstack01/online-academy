import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/api-middleware';
import { addModule } from '../../../../../services/course.service';
import { UserRole } from '../../../../../types';

/**
 * @route POST /api/courses/[id]/modules
 * @desc Add a module to a course
 * @access Private (Admin, Teacher)
 */
export const POST = withAuth(async (req, { params }) => {
    try {
        const body = await req.json();
        const module = await addModule(params.id, body);
        return NextResponse.json(module, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
