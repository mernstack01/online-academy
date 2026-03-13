import { NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/api-middleware';
import { gradeSubmission } from '../../../../services/assignment.service';
import { UserRole } from '../../../../types';

/**
 * @route PUT /api/submissions/grade
 * @desc Grade a student submission
 * @access Private (Admin, Teacher)
 */
export const PUT = withAuth(async (req: Request) => {
    try {
        const body = await req.json();
        const { submissionId, grade, teacherComment } = body;

        if (!submissionId) {
            return NextResponse.json({ message: 'submissionId is required' }, { status: 400 });
        }

        if (grade === undefined) {
            return NextResponse.json({ message: 'Grade is required' }, { status: 400 });
        }

        const submission = await gradeSubmission(submissionId, grade, teacherComment);
        return NextResponse.json(submission);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
