import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Lightweight hook pro dropdown - drží open state, zavírá na click outside + Escape.
 * Vrací refy které navěsíš na trigger a panel.
 */
export function useDropdown(initial: boolean = false) {
  const [open, setOpen] = useState(initial);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return {
    open,
    onToggle: useCallback(() => setOpen((v) => !v), []),
    onClose: useCallback(() => setOpen(false), []),
    onOpen: useCallback(() => setOpen(true), []),
    containerRef,
  };
}
