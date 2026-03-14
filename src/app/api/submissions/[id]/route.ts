import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { UserRole } from '@/types';
import dbConnect from '@/lib/db';
import Submission from '@/models/Submission';

/**
 * @route GET /api/submissions/[id]
 * @desc Get a single submission with student and assignment details
 * @access Private (Admin, Teacher)
 */
export const GET = withAuth(async (req, { params }) => {
    try {
        await dbConnect();
        const submission = await Submission.findById(params.id)
            .populate('studentId', 'name email')
            .populate('assignmentId', 'title description dueDate');

        if (!submission) {
            return NextResponse.json({ message: 'Submission not found' }, { status: 404 });
        }

        return NextResponse.json(submission);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
