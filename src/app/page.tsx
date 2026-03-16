'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useI18n } from '@/context/LanguageContext';

export default function Home() {
  const { t } = useI18n();
  const { user } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center py-20 animate-fade-in text-center">
      <div className="max-w-3xl space-y-8">
        <div className="space-y-4">
          <h2 className="text-primary font-bold tracking-widest uppercase text-sm">
            {t('home.badge')}
          </h2>
          <h1 className="text-5xl md:text-7xl font-black text-foreground leading-tight tracking-tighter">
            {t('home.titlePrefix')}{' '}
            <span className="text-primary">{t('home.titleEmphasis')}</span>{' '}
            {t('home.titleSuffix')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('home.description')}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link
            href="/courses"
            className="w-full sm:w-auto px-10 py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl transition-all shadow-xl shadow-primary/30 hover:scale-105 active:scale-95"
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-20">
          <div className="p-8 glass rounded-3xl space-y-4 text-left">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
              ★
            </div>
            <h3 className="text-xl font-bold text-foreground">{t('home.features.expertTitle')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('home.features.expertDesc')}
            </p>
          </div>
          <div className="p-8 glass rounded-3xl space-y-4 text-left">
            <div className="w-12 h-12 bg-secondary/20 rounded-2xl flex items-center justify-center text-secondary text-2xl font-bold">
              ⎙
            </div>
            <h3 className="text-xl font-bold text-foreground">{t('home.features.flexibleTitle')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('home.features.flexibleDesc')}
            </p>
          </div>
          <div className="p-8 glass rounded-3xl space-y-4 text-left">
            <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center text-primary text-2xl font-bold">
              ∞
            </div>
            <h3 className="text-xl font-bold text-foreground">{t('home.features.careerTitle')}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t('home.features.careerDesc')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
