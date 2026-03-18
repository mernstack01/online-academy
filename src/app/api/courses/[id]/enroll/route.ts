import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { enrollInCourse } from '@/services/student.service';
import { UserRole } from '@/types';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';
import { getErrorMessage } from '@/lib/access-control';

/**
 * @route POST /api/courses/[id]/enroll
 * @desc Enroll student in a course
 * @access Private (Student)
 */
export const POST = withAuth(async (req, { params, user }) => {
    try {
        const studentId = user.id;
        const courseId = params.id;

        await dbConnect();

        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        if (!course.isPublished) {
            return NextResponse.json(
                { message: 'Only published courses can be enrolled directly' },
                { status: 403 }
            );
        }

        if (course.price > 0) {
            return NextResponse.json(
                { message: 'Paid course. Please contact admin to enroll.' },
                { status: 403 }
            );
        }

        // Check if already enrolled
        const existingEnrollment = await Enrollment.findOne({ studentId, courseId });
        if (existingEnrollment) {
            return NextResponse.json({ message: 'Already enrolled' }, { status: 400 });
        }

        const enrollment = await enrollInCourse(studentId, courseId);
        return NextResponse.json(enrollment, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: 500 });
    }
}, [UserRole.STUDENT]);

/**
 * @route GET /api/courses/[id]/enroll
 * @desc Check if student is enrolled
 * @access Private (Student)
 */
export const GET = withAuth(async (req, { params, user }) => {
    try {
        const studentId = user.id;
        const courseId = params.id;

        await dbConnect();
        const enrollment = await Enrollment.findOne({ studentId, courseId });

        return NextResponse.json({ isEnrolled: !!enrollment });
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: 500 });
    }
}, [UserRole.STUDENT]);
