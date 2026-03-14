'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (!token) {
                setUser(null);
                setLoading(false);
                return;
            }

            if (storedUser) {
                try {
                    const parsed = JSON.parse(storedUser);
                    const normalized = normalizeUser(parsed);
                    setUser(normalized);
                } catch {
                    localStorage.removeItem('user');
                }
            }

            try {
                const res = await fetch('/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('Session expired');
                }

                const data = await res.json();
                const normalized = normalizeUser(data.user);
                setUser(normalized);
                localStorage.setItem('user', JSON.stringify(normalized));
                document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
            } catch {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = (token: string, user: User) => {
        const normalized = normalizeUser(user);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(normalized));
        document.cookie = `token=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
        setUser(normalized);
        router.refresh();
        router.push('/');
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        setUser(null);
        router.refresh();
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

function normalizeUser(user: User | null): User | null {
    if (!user) return null;
    const id = user.id || user._id;
    return {
        ...user,
        id,
        _id: id,
    };
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
