import { NextResponse } from 'next/server';
import { withAuth } from '../../../../lib/api-middleware';
import { removeFromPortfolio } from '../../../../services/portfolio.service';
import { UserRole } from '../../../../types';

/**
 * @route DELETE /api/portfolio/[id]
 * @desc Remove an item from portfolio
 * @access Private (Student)
 */
export const DELETE = withAuth(async (req: Request, { params, user }: { params: { id: string }, user: any }) => {
    try {
        await removeFromPortfolio(params.id, user.id);
        return NextResponse.json({ message: 'Portfolio item removed' });
    } catch (error: any) {
        return NextResponse.json({ message: error.message }, { status: 400 });
    }
}, [UserRole.STUDENT]);
