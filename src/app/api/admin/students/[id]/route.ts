import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { UserRole } from '@/types';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * @route PATCH /api/admin/students/[id]
 * @desc Update student
 * @access Private (Admin)
 */
export const PATCH = withAuth(async (req, { params }) => {
    try {
        const body = await req.json();
        const name = body.name ? String(body.name).trim() : undefined;
        const email = body.email ? String(body.email).toLowerCase().trim() : undefined;
        const password = body.password ? String(body.password) : undefined;
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

        await dbConnect();
        const student = await User.findById(params.id).select('+password');
        if (!student) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        if (student.role !== UserRole.STUDENT) {
            return NextResponse.json({ message: 'User is not a student' }, { status: 400 });
        }

        if (email) {
            if (adminEmail && email === adminEmail) {
                return NextResponse.json({ message: 'Email is reserved' }, { status: 400 });
            }
            const exists = await User.findOne({ email, _id: { $ne: student._id } });
            if (exists) {
                return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
            }
            student.email = email;
        }

        if (name) student.name = name;
        if (password) student.password = password;

        await student.save();

        return NextResponse.json({
            _id: student._id,
            name: student.name,
            email: student.email,
            role: student.role,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN]);

/**
 * @route DELETE /api/admin/students/[id]
 * @desc Delete student
 * @access Private (Admin)
 */
export const DELETE = withAuth(async (req, { params }) => {
    try {
        await dbConnect();
        const student = await User.findById(params.id);
        if (!student) {
            return NextResponse.json({ message: 'Student not found' }, { status: 404 });
        }

        if (student.role !== UserRole.STUDENT) {
            return NextResponse.json({ message: 'User is not a student' }, { status: 400 });
        }

        await student.deleteOne();
        return NextResponse.json({ message: 'Student deleted' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN]);
