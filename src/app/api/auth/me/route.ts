import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { UserRole } from '@/types';

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user info
 * @access Private (All roles)
 */
export const GET = withAuth(async (req, { user }) => {
    return NextResponse.json({
        message: 'Authenticated successfully',
        user
    });
}, [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]);
