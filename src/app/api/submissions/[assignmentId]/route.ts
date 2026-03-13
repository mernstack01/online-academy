import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/api-middleware';
import { getSubmissionsByAssignment } from '../../../../../services/assignment.service';
import { UserRole } from '../../../../../types';

/**
 * @route GET /api/submissions/[assignmentId]
 * @desc List all submissions for a specific assignment
 * @access Private (Admin, Teacher)
 */
export const GET = withAuth(async (req: Request, { params }: { params: { assignmentId: string } }) => {
    try {
        const submissions = await getSubmissionsByAssignment(params.assignmentId);
        return NextResponse.json(submissions);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
