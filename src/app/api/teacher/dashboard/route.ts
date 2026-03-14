import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { getTeacherDashboardStats } from '@/services/teacher.service';
import { UserRole } from '@/types';

/**
 * @route GET /api/teacher/dashboard
 * @desc Get teacher dashboard statistics and links
 * @access Private (Teacher, Admin)
 */
export const GET = withAuth(async (req, { user }) => {
    try {
        const stats = await getTeacherDashboardStats(user.id);
        return NextResponse.json(stats);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.TEACHER, UserRole.ADMIN]);
