import { useAppContext, type LanguageCode } from '@/state/AppContext';

export function useLanguage() {
  const { language, setLanguage } = useAppContext();
  return { language, change: (next: LanguageCode) => setLanguage(next) };
}
