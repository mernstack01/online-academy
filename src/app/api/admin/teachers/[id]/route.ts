import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { UserRole } from '@/types';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * @route PATCH /api/admin/teachers/[id]
 * @desc Update mentor/teacher
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
        const teacher = await User.findById(params.id).select('+password');
        if (!teacher) {
            return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
        }

        if (teacher.role !== UserRole.TEACHER) {
            return NextResponse.json({ message: 'User is not a teacher' }, { status: 400 });
        }

        if (email) {
            if (adminEmail && email === adminEmail) {
                return NextResponse.json({ message: 'Email is reserved' }, { status: 400 });
            }
            const exists = await User.findOne({ email, _id: { $ne: teacher._id } });
            if (exists) {
                return NextResponse.json({ message: 'Email already in use' }, { status: 400 });
            }
            teacher.email = email;
        }

        if (name) teacher.name = name;
        if (password) teacher.password = password;

        await teacher.save();

        return NextResponse.json({
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            role: teacher.role,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN]);

/**
 * @route DELETE /api/admin/teachers/[id]
 * @desc Delete mentor/teacher
 * @access Private (Admin)
 */
export const DELETE = withAuth(async (req, { params }) => {
    try {
        await dbConnect();
        const teacher = await User.findById(params.id);
        if (!teacher) {
            return NextResponse.json({ message: 'Teacher not found' }, { status: 404 });
        }

        if (teacher.role !== UserRole.TEACHER) {
            return NextResponse.json({ message: 'User is not a teacher' }, { status: 400 });
        }

        await teacher.deleteOne();
        return NextResponse.json({ message: 'Teacher deleted' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN]);
