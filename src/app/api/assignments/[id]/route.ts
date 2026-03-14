import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { getAssignmentById } from '@/services/assignment.service';
import { UserRole } from '@/types';

/**
 * @route GET /api/assignments/[id]
 * @desc Get a single assignment
 * @access Private (Admin, Teacher, Student)
 */
export const GET = withAuth(async (req, { params }) => {
    try {
        const assignment = await getAssignmentById(params.id);
        if (!assignment) {
            return NextResponse.json({ message: 'Assignment not found' }, { status: 404 });
        }
        return NextResponse.json(assignment);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]);
