import { NextResponse } from 'next/server';
import { loginUser } from '@/services/auth.service';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await loginUser(body);

        return NextResponse.json(result, { status: 200 });
    } catch (error: any) {
        console.error('Login Error:', error);
        return NextResponse.json(
            { message: error.message || 'Invalid credentials' },
            { status: 401 }
        );
    }
}
