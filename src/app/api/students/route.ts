import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { UserRole } from '@/types';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

/**
 * @route GET /api/students?q=...&limit=...
 * @desc List students (admin: all, teacher: only their course students)
 * @access Private (Admin, Teacher)
 */
export const GET = withAuth(async (req, { user }) => {
    try {
        const { searchParams } = new URL(req.url);
        const q = (searchParams.get('q') || '').trim();
        const limit = Math.min(Number(searchParams.get('limit')) || 30, 100);

        await dbConnect();

        let studentIds: string[] | null = null;

        if (user.role === UserRole.TEACHER) {
            const courses = await Course.find({ instructor: user.id }).select('_id');
            const courseIds = courses.map((c) => c._id);
            if (courseIds.length === 0) {
                return NextResponse.json([]);
            }

            const enrollments = await Enrollment.find({ courseId: { $in: courseIds } }).select('studentId');
            studentIds = enrollments.map((e) => e.studentId.toString());
            if (studentIds.length === 0) {
                return NextResponse.json([]);
            }
        }

        const query: any = { role: UserRole.STUDENT };
        if (studentIds) {
            query._id = { $in: studentIds };
        }

        if (q) {
            const isObjectId = /^[a-f0-9]{24}$/i.test(q);
            if (isObjectId) {
                query._id = q;
            } else {
                const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                query.$or = [{ name: regex }, { email: regex }];
            }
        }

        const students = await User.find(query)
            .select('name email')
            .limit(limit)
            .sort({ createdAt: -1 });

        return NextResponse.json(students);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN, UserRole.TEACHER]);
