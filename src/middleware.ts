import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from './lib/auth-utils';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define protected routes and their allowed roles
    const protectedRoutes = [
        { path: '/admin', roles: ['admin'] },
        { path: '/teacher', roles: ['admin', 'teacher'] },
        { path: '/student', roles: ['admin', 'teacher', 'student'] },
    ];

    const currentProtectedRoute = protectedRoutes.find(route =>
        pathname.startsWith(route.path)
    );

    if (currentProtectedRoute) {
        // Get token from cookies or authorization header
        const tokenToken = request.cookies.get('token')?.value;
        const authHeader = request.headers.get('authorization');
        const token = tokenToken || authHeader?.replace('Bearer ', '');

        if (!token) {
            const url = request.nextUrl.clone();
            url.pathname = '/login';
            return NextResponse.redirect(url);
        }

        const decoded = verifyToken(token);

        if (!decoded || !currentProtectedRoute.roles.includes(decoded.role)) {
            const url = request.nextUrl.clone();
            url.pathname = '/unauthorized'; // You may need to create this page
            return NextResponse.redirect(url);
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        '/admin/:path*',
        '/teacher/:path*',
        '/student/:path*',
    ],
};
