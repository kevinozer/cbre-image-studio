import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export type LanguageCode = 'cs' | 'en' | 'sk';

interface AppContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  isDark: boolean;
  toggleDark: () => void;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

/**
 * Globální app state - jazyk + dark mode.
 * Bez perzistence - po refreshi defaultuje na cs / light.
 */
export function AppProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add('dark');
    else root.classList.remove('dark');
  }, [isDark]);

  const toggleDark = useCallback(() => setIsDark((v) => !v), []);

  const value = useMemo(
    () => ({ language, setLanguage, isDark, toggleDark }),
    [language, isDark, toggleDark],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
