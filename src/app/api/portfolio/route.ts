import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-middleware';
import { addToPortfolio, getStudentPortfolio } from '@/services/portfolio.service';
import { UserRole } from '@/types';
import { assertSubmissionOwnership, getErrorMessage, getErrorStatus } from '@/lib/access-control';

/**
 * @route POST /api/portfolio
 * @desc Add a submission to portfolio
 * @access Private (Student)
 */
export const POST = withAuth(async (req, { user }) => {
    try {
        const body = await req.json();
        if (!body.submissionId) {
            return NextResponse.json({ message: 'submissionId is required' }, { status: 400 });
        }

        await assertSubmissionOwnership(user.id, body.submissionId);
        const portfolioItem = await addToPortfolio({
            ...body,
            studentId: user.id,
        });
        return NextResponse.json(portfolioItem, { status: 201 });
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: getErrorStatus(error, 400) });
    }
}, [UserRole.STUDENT]);

/**
 * @route GET /api/portfolio
 * @desc Get student's portfolio items
 * @access Private (Student)
 */
export const GET = withAuth(async (req, { user }) => {
    try {
        const portfolio = await getStudentPortfolio(user.id);
        return NextResponse.json(portfolio);
    } catch (error: unknown) {
        return NextResponse.json({ message: getErrorMessage(error) }, { status: 500 });
    }
}, [UserRole.STUDENT]);
