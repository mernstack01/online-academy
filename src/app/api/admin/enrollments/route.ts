import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { UserRole } from '@/types';
import dbConnect from '@/lib/db';
import Enrollment from '@/models/Enrollment';
import User from '@/models/User';
import Course from '@/models/Course';

/**
 * @route POST /api/admin/enrollments
 * @desc Manually enroll a student into a course
 * @access Private (Admin)
 */
export const POST = withAuth(async (req) => {
    try {
        const body = await req.json();
        const studentIdentifier = body.studentId || body.studentEmail || body.student;
        const courseId = body.courseId;

        if (!studentIdentifier || !courseId) {
            return NextResponse.json(
                { message: 'student and courseId are required' },
                { status: 400 }
            );
        }

        await dbConnect();

        const course = await Course.findById(courseId);
        if (!course) {
            return NextResponse.json({ message: 'Course not found' }, { status: 404 });
        }

        const isEmail = typeof studentIdentifier === 'string' && studentIdentifier.includes('@');
        const student = isEmail
            ? await User.findOne({ email: studentIdentifier.toLowerCase() })
            : await User.findById(studentIdentifier);

        if (!student) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        if (student.role !== UserRole.STUDENT) {
            return NextResponse.json(
                { message: 'User is not a student' },
                { status: 400 }
            );
        }

        const existingEnrollment = await Enrollment.findOne({
            studentId: student._id.toString(),
            courseId: courseId.toString(),
        });

        if (existingEnrollment) {
            return NextResponse.json({ message: 'Already enrolled' }, { status: 400 });
        }

        const enrollment = await Enrollment.create({
            studentId: student._id.toString(),
            courseId: courseId.toString(),
            status: 'active',
        });

        return NextResponse.json(enrollment, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN]);
