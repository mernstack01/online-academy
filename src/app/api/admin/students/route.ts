import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { UserRole } from '@/types';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * @route GET /api/admin/students?q=...&limit=...
 * @desc List students (search by name/email)
 * @access Private (Admin)
 */
export const GET = withAuth(async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const q = (searchParams.get('q') || '').trim();
        const limit = Math.min(Number(searchParams.get('limit')) || 20, 50);

        await dbConnect();

        const query: any = { role: UserRole.STUDENT };
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
            .select('name email role')
            .limit(limit)
            .sort({ createdAt: -1 });

        return NextResponse.json(students);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN]);

/**
 * @route POST /api/admin/students
 * @desc Create student
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

        const student = await User.create({
            name,
            email,
            password,
            role: UserRole.STUDENT,
        });

        return NextResponse.json(
            {
                _id: student._id,
                name: student.name,
                email: student.email,
                role: student.role,
            },
            { status: 201 }
        );
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN]);
