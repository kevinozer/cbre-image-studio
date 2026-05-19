import { useCallback } from 'react';
import { translations } from '@/i18n/translations';
import { useAppContext, type LanguageCode } from '@/state/AppContext';

export function resolveTranslation(
  key: string,
  language: LanguageCode,
  vars?: Record<string, string | number>,
): string {
  const entry = translations[key];
  let str = entry?.[language];
  if (str === undefined) str = entry?.en ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }
  return str;
}

export function useT() {
  const { language } = useAppContext();
  return useCallback(
    (key: string, vars?: Record<string, string | number>) => resolveTranslation(key, language, vars),
    [language],
  );
}
