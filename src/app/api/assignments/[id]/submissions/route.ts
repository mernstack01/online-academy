import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { getSubmissionsByAssignment } from '@/services/assignment.service';
import { UserRole } from '@/types';
import {
    assertAssignmentManageAccess,
    AuthenticatedUser,
    getErrorMessage,
    getErrorStatus,
} from '@/lib/access-control';

/**
 * @route GET /api/assignments/[id]/submissions
 * @desc List all submissions for a specific assignment
 * @access Private (Admin, Teacher)
 */
export const GET = withAuth(async (req, { params, user }: { params: { id: string }, user: AuthenticatedUser }) => {
    try {
        await assertAssignmentManageAccess(user, params.id);
        const submissions = await getSubmissionsByAssignment(params.id);
        return NextResponse.json(submissions);
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
