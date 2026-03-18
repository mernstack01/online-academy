import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { gradeSubmission } from '@/services/assignment.service';
import { UserRole } from '@/types';
import { assertSubmissionManageAccess, getErrorMessage, getErrorStatus } from '@/lib/access-control';

/**
 * @route PUT /api/submissions/grade
 * @desc Grade a student submission
 * @access Private (Admin, Teacher)
 */
export const PUT = withAuth(async (req: Request, { user }) => {
    try {
        const body = await req.json();
        const { submissionId, grade, teacherComment } = body;

        if (!submissionId) {
            return NextResponse.json({ message: 'submissionId is required' }, { status: 400 });
        }

        if (grade === undefined) {
            return NextResponse.json({ message: 'Grade is required' }, { status: 400 });
        }

        const numericGrade = Number(grade);
        if (Number.isNaN(numericGrade) || numericGrade < 0 || numericGrade > 100) {
            return NextResponse.json({ message: 'Grade must be between 0 and 100' }, { status: 400 });
        }

        await assertSubmissionManageAccess(user, submissionId);

        const submission = await gradeSubmission(submissionId, numericGrade, teacherComment);
        if (!submission) {
            return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
        }
        return NextResponse.json(submission);
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error, 400) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
