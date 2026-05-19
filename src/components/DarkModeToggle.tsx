import { Moon, Sun } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { useT } from '@/i18n/useT';
import { cn } from '@/utils/classNames';

export type DarkModeToggleVariant = 'onDark' | 'onLight';

const variantClass: Record<DarkModeToggleVariant, string> = {
  onDark: 'text-white/85 hover:bg-white/10 hover:text-white',
  onLight: 'text-ink-secondary hover:bg-surface-muted hover:text-ink-primary',
};

export function DarkModeToggle({ variant = 'onDark' }: { variant?: DarkModeToggleVariant }) {
  const { isDark, toggle } = useDarkMode();
  const t = useT();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t('common.toggleDark')}
      className={cn(
        'inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors',
        variantClass[variant],
      )}
    >
      {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
    </button>
  );
}
