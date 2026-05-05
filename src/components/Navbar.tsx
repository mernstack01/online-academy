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
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <svg
                                className="logo-3d"
                                width="38"
                                height="38"
                                viewBox="0 0 36 36"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <defs>
                                    <linearGradient id="cubeTop" x1="5" y1="10" x2="31" y2="10" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#c084fc" />
                                        <stop offset="1" stopColor="#818cf8" />
                                    </linearGradient>
                                    <linearGradient id="cubeLeft" x1="5" y1="18" x2="18" y2="33" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#7c3aed" />
                                        <stop offset="1" stopColor="#4c1d95" />
                                    </linearGradient>
                                    <linearGradient id="cubeRight" x1="18" y1="18" x2="31" y2="33" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#a78bfa" />
                                        <stop offset="1" stopColor="#6d28d9" />
                                    </linearGradient>
                                    <radialGradient id="glowDot" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#e9d5ff" stopOpacity="0.8" />
                                    </radialGradient>
                                </defs>
                                {/* Cube top face */}
                                <polygon points="18,4 31,11 18,18 5,11" fill="url(#cubeTop)" />
                                {/* Cube left face */}
                                <polygon points="5,11 18,18 18,32 5,25" fill="url(#cubeLeft)" />
                                {/* Cube right face */}
                                <polygon points="31,11 31,25 18,32 18,18" fill="url(#cubeRight)" />
                                {/* Edge highlights */}
                                <polyline points="18,4 31,11 31,25 18,32 5,25 5,11 18,4" stroke="white" strokeOpacity="0.18" strokeWidth="0.6" fill="none" />
                                <line x1="18" y1="4" x2="18" y2="32" stroke="white" strokeOpacity="0.12" strokeWidth="0.5" />
                                <line x1="5" y1="11" x2="31" y2="11" stroke="white" strokeOpacity="0.22" strokeWidth="0.5" />
                                {/* AI Neural nodes */}
                                <circle cx="18" cy="11" r="2.5" fill="url(#glowDot)" />
                                <circle cx="11" cy="14.5" r="1.5" fill="white" fillOpacity="0.7" />
                                <circle cx="25" cy="14.5" r="1.5" fill="white" fillOpacity="0.7" />
                                <circle cx="18" cy="25" r="1.5" fill="white" fillOpacity="0.5" />
                                {/* Connection lines */}
                                <line x1="18" y1="11" x2="11" y2="14.5" stroke="white" strokeOpacity="0.45" strokeWidth="0.8" />
                                <line x1="18" y1="11" x2="25" y2="14.5" stroke="white" strokeOpacity="0.45" strokeWidth="0.8" />
                                <line x1="11" y1="14.5" x2="18" y2="25" stroke="white" strokeOpacity="0.3" strokeWidth="0.7" />
                                <line x1="25" y1="14.5" x2="18" y2="25" stroke="white" strokeOpacity="0.3" strokeWidth="0.7" />
                                <line x1="11" y1="14.5" x2="25" y2="14.5" stroke="white" strokeOpacity="0.2" strokeWidth="0.6" />
                            </svg>
                            <span className="text-xl font-bold tracking-tight text-foreground">
                                Grafik<span className="text-primary"> Ta'lim</span>
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
