'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useI18n();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center animate-fade-in">
      {/* Hero Section */}
      <section className="relative w-full min-h-[82vh] flex flex-col items-center justify-center py-16 overflow-hidden">
        {/* Gradient background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-br from-violet-50 via-purple-50 to-pink-50 dark:from-violet-950/40 dark:via-purple-950/20 dark:to-background" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-175 h-125 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute top-1/4 left-1/4 w-75 h-75 bg-violet-300/20 rounded-full blur-2xl" />
          <div className="absolute bottom-1/4 right-1/4 w-62.5 h-62.5 bg-pink-300/20 rounded-full blur-2xl" />
        </div>

        {/* Floating decorative elements — visible only md+ */}
        <div className="hidden md:block absolute top-10 left-[7%]">
          <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-2xl flex items-center justify-center shadow-lg animate-float -rotate-6">
            <span className="text-3xl">🎨</span>
          </div>
        </div>
        <div className="hidden md:block absolute top-[38%] left-[3%]">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800/50 rounded-2xl flex items-center justify-center shadow-lg animate-float-slow -rotate-3">
            <span className="text-4xl">🖥️</span>
          </div>
        </div>
        <div className="hidden md:block absolute bottom-[22%] left-[10%]">
          <div className="w-11 h-11 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-primary text-xl font-black">✦</span>
          </div>
        </div>
        <div className="hidden md:block absolute top-[14%] right-[9%]">
          <div className="w-11 h-11 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-primary text-xl font-black">✦</span>
          </div>
        </div>
        <div className="hidden md:block absolute top-[34%] right-[3%]">
          <div className="w-20 h-20 bg-amber-50 dark:bg-amber-900/30 rounded-2xl flex items-center justify-center shadow-lg animate-float rotate-6">
            <span className="text-4xl">📜</span>
          </div>
        </div>
        <div className="hidden md:block absolute bottom-[28%] right-[8%]">
          <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center shadow-lg animate-float-slow rotate-6">
            <span className="text-2xl">🎮</span>
          </div>
        </div>

        {/* Center computer icon */}
        <div className="w-24 h-24 mb-8 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl shadow-primary/20 flex items-center justify-center ring-1 ring-border">
          <span className="text-5xl">🖥️</span>
        </div>

        {/* Hero text */}
        <div className="text-center space-y-5 max-w-3xl px-4">
          <h1 className="text-6xl md:text-8xl font-black leading-none tracking-tight text-foreground">
            {t('home.titlePrefix')}{' '}
            <span className="text-primary">{t('home.titleEmphasis')}</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {t('home.description')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-3">
            <Link
              href="/courses"
              className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 text-lg"
            >
              {t('home.exploreCourses')}
            </Link>
            {!user && (
              <Link
                href="/register"
                className="w-full sm:w-auto px-10 py-4 glass text-foreground font-bold rounded-2xl hover:bg-white/10 transition-all hover:scale-105 active:scale-95"
              >
                {t('home.getStarted')}
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="w-full max-w-5xl px-4 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 glass rounded-3xl space-y-4 text-left glass-hover">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl font-bold">
              ★
            </div>
            <h3 className="text-xl font-bold text-foreground">{t('home.features.expertTitle')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('home.features.expertDesc')}
            </p>
          </div>
          <div className="p-8 glass rounded-3xl space-y-4 text-left glass-hover">
            <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary text-3xl font-bold">
              ⎙
            </div>
            <h3 className="text-xl font-bold text-foreground">{t('home.features.flexibleTitle')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('home.features.flexibleDesc')}
            </p>
          </div>
          <div className="p-8 glass rounded-3xl space-y-4 text-left glass-hover">
            <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-3xl font-bold">
              ∞
            </div>
            <h3 className="text-xl font-bold text-foreground">{t('home.features.careerTitle')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('home.features.careerDesc')}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
