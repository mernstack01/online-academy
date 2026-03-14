'use client';

import Link from 'next/link';
import { ShieldOff, ArrowLeft } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center px-6">
            <div className="max-w-xl w-full text-center space-y-6 glass p-10 rounded-3xl border border-white/10">
                <div className="mx-auto w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center">
                    <ShieldOff className="h-8 w-8 text-red-400" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tighter italic">
                    Access Denied
                </h1>
                <p className="text-muted-foreground">
                    You don’t have permission to view this page. If you think this is a mistake,
                    contact your administrator.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                    <Link
                        href="/"
                        className="px-5 py-3 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-all"
                    >
                        Go Home
                    </Link>
                    <Link
                        href="/login"
                        className="px-5 py-3 rounded-xl bg-white/10 text-foreground font-semibold hover:bg-white/20 transition-all border border-white/10 flex items-center gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
