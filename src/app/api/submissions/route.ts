import { NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/api-middleware';
import { submitAssignment } from '../../../../services/assignment.service';
import { UserRole } from '../../../../types';

/**
 * @route POST /api/submissions
 * @desc Submit an assignment
 * @access Private (Student)
 */
export const POST = withAuth(async (req: Request, { user }: { user: any }) => {
    try {
        const body = await req.json();
        const submission = await submitAssignment({
            ...body,
            studentId: user.id,
        });
        return NextResponse.json(submission, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}, [UserRole.STUDENT]);
