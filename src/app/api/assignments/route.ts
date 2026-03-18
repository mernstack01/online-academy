import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { createAssignment, getAssignmentsByCourse } from '@/services/assignment.service';
import { UserRole } from '@/types';
import {
    ensureStudentEnrollment,
    assertCourseManageAccess,
    getErrorMessage,
    getCourseOrThrow,
    getErrorStatus,
} from '@/lib/access-control';

/**
 * @route POST /api/assignments
 * @desc Create a new assignment
 * @access Private (Admin, Teacher)
 */
export const POST = withAuth(async (req, { user }) => {
    try {
        const body = await req.json();
        if (!body.courseId) {
            return NextResponse.json({ message: 'courseId is required' }, { status: 400 });
        }

        await assertCourseManageAccess(user, body.courseId);
        const assignment = await createAssignment(body);
        return NextResponse.json(assignment, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error, 400) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);

/**
 * @route GET /api/assignments?courseId=xxx
 * @desc List assignments for a course
 * @access Private (Admin, Teacher, Student)
 */
export const GET = withAuth(async (req, { user }) => {
    try {
        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json({ message: 'courseId is required' }, { status: 400 });
        }

        await getCourseOrThrow(courseId);

        if (user.role === UserRole.STUDENT) {
            await ensureStudentEnrollment(user.id, courseId, 'You must be enrolled in this course');
        } else {
            await assertCourseManageAccess(user, courseId);
        }

        const assignments = await getAssignmentsByCourse(courseId);
        return NextResponse.json(assignments);
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error) });
    }
}, [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]);
