import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { UserRole } from '@/types';
import dbConnect from '@/lib/db';
import User from '@/models/User';

/**
 * @route GET /api/auth/me
 * @desc Get current authenticated user info
 * @access Private (All roles)
 */
export const GET = withAuth(async (req, { user }) => {
    await dbConnect();
    const fullUser = await User.findById(user.id).select('name email role image');

    if (!fullUser) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
        message: 'Authenticated successfully',
        user: {
            id: fullUser._id,
            _id: fullUser._id,
            name: fullUser.name,
            email: fullUser.email,
            role: fullUser.role,
            image: fullUser.image,
        }
    });
}, [UserRole.ADMIN, UserRole.TEACHER, UserRole.STUDENT]);
