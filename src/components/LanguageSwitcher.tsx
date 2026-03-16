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
      <SelectContent>
        {supportedLanguages.map((lang) => (
          <SelectItem key={lang} value={lang}>
            {languageLabels[lang]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
