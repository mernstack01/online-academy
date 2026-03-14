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
