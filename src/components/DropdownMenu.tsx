import type { ReactNode } from 'react';
import { cn } from '@/utils/classNames';

export interface DropdownMenuProps {
  open: boolean;
  onClose: () => void;
  align?: 'left' | 'right';
  children: ReactNode;
}

export function DropdownMenu({ open, align = 'left', children }: DropdownMenuProps) {
  if (!open) return null;
  return (
    <div
      className={cn(
        'absolute top-[calc(100%+8px)] z-30 min-w-[160px] rounded-card bg-surface-card shadow-modal border border-outline py-1.5',
        align === 'right' ? 'right-0' : 'left-0',
      )}
      role="menu"
    >
      {children}
    </div>
  );
}

export interface DropdownItemProps {
  active?: boolean;
  onSelect: () => void;
  children: ReactNode;
}

export function DropdownItem({ active, onSelect, children }: DropdownItemProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      role="menuitem"
      className={cn(
        'w-full text-left px-4 py-2 text-[14px] transition-colors',
        active
          ? 'bg-brand-greenTint text-brand-primary font-semibold'
          : 'text-ink-primary hover:bg-surface-muted',
      )}
    >
      {children}
    </button>
  );
}
