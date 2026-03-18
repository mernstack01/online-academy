import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { UserRole } from '@/types';
import { assertSubmissionManageAccess, getErrorMessage, getErrorStatus } from '@/lib/access-control';

/**
 * @route GET /api/submissions/[id]
 * @desc Get a single submission with student and assignment details
 * @access Private (Admin, Teacher)
 */
export const GET = withAuth(async (req, { params, user }) => {
    try {
        const submission = await assertSubmissionManageAccess(user, params.id);
        return NextResponse.json(submission);
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
