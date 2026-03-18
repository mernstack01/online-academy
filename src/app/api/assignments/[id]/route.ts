import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { getAssignmentById } from '@/services/assignment.service';
import { UserRole } from '@/types';
import { assertAssignmentReadAccess, getErrorMessage, getErrorStatus } from '@/lib/access-control';

/**
 * @route GET /api/assignments/[id]
 * @desc Get a single assignment
 * @access Private (Admin, Teacher, Student)
 */
export const GET = withAuth(async (req, { params, user }) => {
    try {
        await assertAssignmentReadAccess(user, params.id);
        const assignment = await getAssignmentById(params.id);
        if (!assignment) {
            return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
        }
        return NextResponse.json(assignment);
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]);
