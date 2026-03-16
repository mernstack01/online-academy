'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  getTranslation,
  supportedLanguages,
  type Language,
  type TranslationParams,
} from '@/lib/i18n';

const DEFAULT_LANGUAGE: Language = 'uz';
const STORAGE_KEY = 'language';

interface LanguageContextValue {
  language: Language;
  setLanguage: (next: Language) => void;
  t: (key: string, params?: TranslationParams, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && supportedLanguages.includes(stored)) {
      setLanguageState(stored);
      return;
    }

    const browser = navigator.language.toLowerCase();
    if (browser.startsWith('uz')) {
      setLanguageState('uz');
    } else {
      setLanguageState('en');
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    if (!supportedLanguages.includes(next)) return;
    setLanguageState(next);
  }, []);

  const t = useCallback(
    (key: string, params?: TranslationParams, fallback?: string) =>
      getTranslation(language, key, params, fallback),
    [language]
  );

  const value = useMemo(() => ({ language, setLanguage, t }), [language, setLanguage, t]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useI18n() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider');
  }
  return context;
}
