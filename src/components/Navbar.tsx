'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { UserRole } from '@/types';
import ThemeToggle from '@/components/ThemeToggle';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useI18n } from '@/context/LanguageContext';

export default function Navbar() {
    const { t } = useI18n();
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const dashboardHref =
        user?.role === UserRole.ADMIN
            ? '/admin'
            : user?.role === UserRole.TEACHER
                ? '/teacher/dashboard'
                : user?.role === UserRole.STUDENT
                    ? '/student/dashboard'
                    : null;

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                                A
                            </div>
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                Skynet<span className="text-primary">Academy</span>
                            </span>
                        </Link>
                    </div>

                    <div className="hidden md:block">
                        <div className="ml-10 flex items-baseline space-x-4">
                            <Link
                                href="/courses"
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname === '/courses' ? 'text-foreground bg-white/10' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                                {t('nav.courses')}
                            </Link>
                            {dashboardHref && (
                                <Link
                                    href={dashboardHref}
                                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${pathname.startsWith(dashboardHref) ? 'text-foreground bg-white/10' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    {t('nav.dashboard')}
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <LanguageSwitcher />
                        <ThemeToggle />
                        {user ? (
                            <div className="flex items-center gap-4">
                                <span className="text-sm text-muted-foreground hidden sm:inline">
                                    {t('nav.greeting')}{' '}
                                    <span className="text-foreground font-medium">{user.name}</span>
                                </span>
                                <button
                                    onClick={logout}
                                    className="px-4 py-2 text-sm font-medium text-foreground bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/10"
                                >
                                    {t('nav.logout')}
                                </button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {t('nav.login')}
                                </Link>
                                <Link
                                    href="/register"
                                    className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-hover rounded-lg transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                                >
                                    {t('nav.signup')}
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
