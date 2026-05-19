import { ChevronDown, Globe } from 'lucide-react';
import { DropdownItem, DropdownMenu } from '@/components/DropdownMenu';
import { useDropdown } from '@/hooks/useDropdown';
import { useLanguage } from '@/hooks/useLanguage';
import type { LanguageCode } from '@/state/AppContext';
import { cn } from '@/utils/classNames';

export type LanguageDropdownVariant = 'onDark' | 'onLight';

const triggerClass: Record<LanguageDropdownVariant, string> = {
  onDark: 'text-white/90 hover:bg-white/10 hover:text-white',
  onLight: 'text-ink-secondary hover:bg-surface-muted hover:text-ink-primary',
};

const OPTIONS: { code: LanguageCode; label: string }[] = [
  { code: 'cs', label: 'Česky' },
  { code: 'en', label: 'English' },
  { code: 'sk', label: 'Slovensky' },
];

export function LanguageDropdown({ variant = 'onDark' }: { variant?: LanguageDropdownVariant }) {
  const dropdown = useDropdown(false);
  const { language, change } = useLanguage();
  const current = OPTIONS.find((o) => o.code === language) ?? OPTIONS[0];

  return (
    <div className="relative" ref={dropdown.containerRef}>
      <button
        type="button"
        onClick={dropdown.onToggle}
        aria-haspopup="menu"
        aria-expanded={dropdown.open}
        className={cn(
          'inline-flex items-center gap-2 h-9 px-3 rounded-full text-[14px] font-medium transition-colors',
          triggerClass[variant],
        )}
      >
        <Globe className="w-4 h-4" />
        <span>{current.label}</span>
        <ChevronDown className={cn('w-4 h-4 transition-transform', dropdown.open && 'rotate-180')} />
      </button>
      <DropdownMenu open={dropdown.open} onClose={dropdown.onClose} align="right">
        {OPTIONS.map((opt) => (
          <DropdownItem
            key={opt.code}
            active={opt.code === language}
            onSelect={() => {
              change(opt.code);
              dropdown.onClose();
            }}
          >
            {opt.label}
          </DropdownItem>
        ))}
      </DropdownMenu>
    </div>
  );
}
