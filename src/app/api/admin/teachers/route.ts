import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { UserRole } from '@/types';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * @route GET /api/admin/teachers
 * @desc List mentors/teachers
 * @access Private (Admin)
 */
export const GET = withAuth(async () => {
    try {
        await dbConnect();
        const teachers = await User.find({ role: UserRole.TEACHER })
            .select('name email role')
            .sort({ createdAt: -1 });

        return NextResponse.json(teachers);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN]);

/**
 * @route POST /api/admin/teachers
 * @desc Create mentor/teacher
 * @access Private (Admin)
 */
export const POST = withAuth(async (req) => {
    try {
        const body = await req.json();
        const name = String(body.name || '').trim();
        const email = String(body.email || '').toLowerCase().trim();
        const password = String(body.password || '');
        const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();

        if (!name || !email || !password) {
            return NextResponse.json({ message: 'Name, email and password are required' }, { status: 400 });
        }

        if (adminEmail && email === adminEmail) {
            return NextResponse.json({ message: 'Email is reserved' }, { status: 400 });
        }

        await dbConnect();
        const exists = await User.findOne({ email });
        if (exists) {
            return NextResponse.json({ message: 'User already exists' }, { status: 400 });
        }

        const teacher = await User.create({
            name,
            email,
            password,
            role: UserRole.TEACHER,
        });

        return NextResponse.json({
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            role: teacher.role,
        }, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN]);
