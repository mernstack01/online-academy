'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useI18n } from '@/context/LanguageContext';
import { languageLabels, supportedLanguages, type Language } from '@/lib/i18n';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
      <SelectTrigger className="h-9 w-[120px] px-3 py-1.5 text-xs">
        <SelectValue placeholder={t('nav.language')} />
      </SelectTrigger>
      <SelectContent className="bg-white text-gray-900 dark:bg-gray-900 dark:text-white border border-gray-200 dark:border-gray-700">
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang} value={lang} className="text-sm text-gray-900 dark:text-white/80 focus:bg-gray-100 dark:focus:bg-white/10">
            {languageLabels[lang]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
