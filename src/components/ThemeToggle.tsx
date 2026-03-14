'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';

type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

export default function ThemeToggle() {
    const [theme, setTheme] = useState<Theme>('dark');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initial = stored ?? (prefersDark ? 'dark' : 'light');
        applyTheme(initial);
        setTheme(initial);
        setMounted(true);
    }, []);

    const toggleTheme = () => {
        const next = theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        setTheme(next);
        localStorage.setItem(STORAGE_KEY, next);
    };

    const applyTheme = (next: Theme) => {
        document.documentElement.classList.toggle('dark', next === 'dark');
    };

    if (!mounted) {
        return <div className="h-9 w-9 rounded-lg border border-border bg-card/60" aria-hidden />;
    }

    return (
        <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-9 w-9 rounded-lg border border-border bg-card/60 text-foreground hover:bg-card/80 transition-all flex items-center justify-center"
        >
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
    );
}
