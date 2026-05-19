import { useAppContext } from '@/state/AppContext';

export function useDarkMode() {
  const { isDark, toggleDark } = useAppContext();
  return { isDark, toggle: toggleDark };
}
