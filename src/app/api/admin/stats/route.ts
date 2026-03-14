import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { getAdminStats } from '@/services/dashboard.service';
import { UserRole } from '@/types';

/**
 * @route GET /api/admin/stats
 * @desc Get administrative statistics
 * @access Private (Admin)
 */
export const GET = withAuth(async () => {
    try {
        const stats = await getAdminStats();
        return NextResponse.json(stats);
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}, [UserRole.ADMIN]);
