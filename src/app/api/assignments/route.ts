import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { createAssignment, getAssignmentsByCourse } from '@/services/assignment.service';
import { UserRole } from '@/types';

/**
 * @route POST /api/assignments
 * @desc Create a new assignment
 * @access Private (Admin, Teacher)
 */
export const POST = withAuth(async (req) => {
    try {
        const body = await req.json();
        const assignment = await createAssignment(body);
        return NextResponse.json(assignment, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);

/**
 * @route GET /api/assignments?courseId=xxx
 * @desc List assignments for a course
 * @access Private (Admin, Teacher, Student)
 */
export const GET = withAuth(async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json({ message: 'courseId is required' }, { status: 400 });
        }

        const assignments = await getAssignmentsByCourse(courseId);
        return NextResponse.json(assignments);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]);
