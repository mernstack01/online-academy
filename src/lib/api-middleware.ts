import { NextResponse } from 'next/server';
import { verifyToken } from './auth-utils';
import { UserRole } from '../types';

export type AuthenticatedHandler = (
    req: Request,
    { params, user }: { params: any; user: { id: string; email: string; role: UserRole } }
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: AuthenticatedHandler, allowedRoles?: UserRole[]) {
    return async (req: Request, context: { params: Promise<any> }) => {
        try {
            const params = await context.params;
            // 1. Extract token
            const authHeader = req.headers.get('authorization');
            const cookieToken = req.headers.get('cookie')
                ?.split('; ')
                .find(row => row.startsWith('token='))
                ?.split('=')[1];

            const token = cookieToken || authHeader?.replace('Bearer ', '');

            if (!token) {
                return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
            }

            // 2. Verify token
            const decoded = verifyToken(token);
            if (!decoded) {
                return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
            }

            // 3. Check roles
            if (allowedRoles && !allowedRoles.includes(decoded.role as UserRole)) {
                return NextResponse.json({ message: 'Forbidden: Insufficient permissions' }, { status: 403 });
            }

            // 4. Attach user and call handler
            return handler(req, { ...context, params, user: decoded as any });
        } catch (error) {
            console.error('Auth Error:', error);
            return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
        }
    };
}
