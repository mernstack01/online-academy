'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import GoogleAuthButton from '@/components/GoogleAuthButton';
import { useI18n } from '@/context/LanguageContext';

export default function RegisterPage() {
    const { t } = useI18n();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [oauthLoading, setOauthLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Registration failed');
            }

            login(data.token, data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleCredential = async (credential: string) => {
        setError('');
        setOauthLoading(true);

        try {
            const res = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ credential }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Google sign up failed');
            }

            login(data.token, data.user);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setOauthLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full glass p-8 rounded-2xl animate-fade-in">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-foreground">{t('auth.register.title')}</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        {t('auth.register.subtitle')}
                    </p>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground ml-1">{t('auth.labels.name')}</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder={t('auth.placeholders.name')}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground ml-1">{t('auth.labels.email')}</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder={t('auth.placeholders.email')}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm font-medium text-muted-foreground ml-1">{t('auth.labels.password')}</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                            placeholder={t('auth.placeholders.passwordMin')}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 mt-2"
                    >
                        {loading ? t('auth.register.submitting') : t('auth.register.submit')}
                    </button>
                </form>

                <div className="my-6 flex items-center gap-3">
                    <span className="h-px flex-1 bg-white/10" />
                    <span className="text-xs uppercase tracking-widest text-muted-foreground">{t('auth.or')}</span>
                    <span className="h-px flex-1 bg-white/10" />
                </div>

                <GoogleAuthButton onCredential={handleGoogleCredential} label={t('auth.googleButton')} />
                {oauthLoading && (
                    <p className="mt-3 text-xs text-muted-foreground text-center">
                        {t('auth.register.googleLoading')}
                    </p>
                )}

                <div className="mt-8 text-center">
                    <p className="text-sm text-muted-foreground">
                        {t('auth.register.haveAccount')}{' '}
                        <Link href="/login" className="font-medium text-primary hover:text-primary-hover transition-colors">
                            {t('auth.register.loginLink')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
