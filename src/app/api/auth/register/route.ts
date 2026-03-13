import { NextResponse } from 'next/server';
import { registerUser } from '@/services/auth.service';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const result = await registerUser(body);

        return NextResponse.json(result, { status: 201 });
    } catch (error: any) {
        console.error('Registration Error:', error);
        return NextResponse.json(
            { message: error.message || 'Something went wrong' },
            { status: 400 }
        );
    }
}
