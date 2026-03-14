import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { submitAssignment } from '@/services/assignment.service';
import { UserRole } from '@/types';

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
/**
 * @route GET /api/submissions?assignmentId=xxx
 * @desc Get student's own submission for an assignment
 * @access Private (Student)
 */
export const GET = withAuth(async (req: Request, { user }: { user: any }) => {
    try {
        const { searchParams } = new URL(req.url);
        const assignmentId = searchParams.get('assignmentId');

        if (!assignmentId) {
            return NextResponse.json({ message: 'assignmentId is required' }, { status: 400 });
        }

        const db = await import('@/lib/db');
        await db.default();
        const Submission = (await import('@/models/Submission')).default;

        const submission = await Submission.findOne({
            assignmentId,
            studentId: user.id,
        });

        return NextResponse.json(submission || null);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.STUDENT]);
