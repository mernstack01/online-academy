import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { getStudentDashboardStats } from '@/services/student.service';
import { UserRole } from '@/types';

/**
 * @route GET /api/student/dashboard
 * @desc Get student dashboard statistics and lists
 * @access Private (Student)
 */
export const GET = withAuth(async (req, { user }) => {
    try {
        const stats = await getStudentDashboardStats(user.id);
        return NextResponse.json(stats);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.STUDENT]);
