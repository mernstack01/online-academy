'use client';

import Link from 'next/link';
import { useI18n } from '@/context/LanguageContext';

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-16 pb-10">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="glass rounded-3xl px-6 py-10 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-bold">
                  🎨
                </div>
                <span className="text-lg font-bold tracking-tight text-foreground">
                  Grafik<span className="text-primary"> Ta'lim</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                {t('footer.summary')}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t('footer.quickLinks')}
              </p>
              <div className="flex flex-col gap-2 text-sm">
                <Link href="/courses" className="text-foreground/80 hover:text-foreground transition-colors">
                  {t('footer.courses')}
                </Link>
                <Link href="/login" className="text-foreground/80 hover:text-foreground transition-colors">
                  {t('footer.login')}
                </Link>
                <Link href="/register" className="text-foreground/80 hover:text-foreground transition-colors">
                  {t('footer.register')}
                </Link>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {t('footer.contact')}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t('footer.contactDesc')}
              </p>
              <a
                href={process.env.NEXT_PUBLIC_ADMIN_TELEGRAM}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center px-5 py-3 rounded-2xl bg-primary text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:bg-primary-hover transition-colors"
              >
                {t('footer.contactCta')}
              </a>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>
              © {new Date().getFullYear()} Grafik Ta'lim. {t('footer.rights')}
            </span>
            <span className="text-foreground/70">{t('footer.tagline')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
