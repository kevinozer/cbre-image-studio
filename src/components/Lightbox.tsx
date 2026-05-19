import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Modální lightbox pro zobrazení obsahu v plné velikosti.
 *
 * Dva režimy:
 *  - SINGLE: předáš `src` (back-compat s původní verzí)
 *  - GALLERY: předáš `items: { src, label?, type? }[]` + volitelný `startIndex`,
 *             dostaneš prev/next šipky (kliky i klávesy ←/→).
 *
 * Vždy: zavře se klikem mimo, klávesou Escape, X tlačítkem.
 */
export interface LightboxItem {
  src: string;
  label?: string;
  type?: 'image' | 'video';
}

export interface LightboxProps {
  open: boolean;
  onClose: () => void;
  /** Single mode: jediný obrázek */
  src?: string;
  videoSrc?: string;
  alt?: string;
  /** Gallery mode: pole položek pro prev/next */
  items?: LightboxItem[];
  /** Počáteční index v gallery módu */
  startIndex?: number;
}

export function Lightbox({ open, onClose, src, videoSrc, alt, items, startIndex = 0 }: LightboxProps) {
  // Sjednotíme zdroj dat
  const list: LightboxItem[] =
    items && items.length > 0
      ? items
      : videoSrc
      ? [{ src: videoSrc, label: alt, type: 'video' }]
      : src
      ? [{ src, label: alt, type: 'image' }]
      : [];

  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    if (open) setIndex(startIndex);
  }, [open, startIndex]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + list.length) % list.length);
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % list.length);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose, list.length]);

  if (!open || list.length === 0) return null;

  const current = list[Math.max(0, Math.min(index, list.length - 1))];
  const hasMultiple = list.length > 1;

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i - 1 + list.length) % list.length);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIndex((i) => (i + 1) % list.length);
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={current.label || alt || 'Lightbox'}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close"
        className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/15 hover:bg-white/25 text-white inline-flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            aria-label="Previous"
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white inline-flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>
          <button
            type="button"
            onClick={goNext}
            aria-label="Next"
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/15 hover:bg-white/25 text-white inline-flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-7 h-7" />
          </button>
        </>
      )}

      {(current.label || hasMultiple) && (
        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-white text-[13px] font-medium">
          {current.label}
          {hasMultiple && <span className="ml-2 opacity-60">{index + 1} / {list.length}</span>}
        </div>
      )}

      <div className="relative max-w-[95vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
        {current.type === 'video' ? (
          <video
            key={current.src}
            src={current.src}
            controls
            autoPlay
            className="max-w-[95vw] max-h-[90vh] rounded-card shadow-2xl"
          />
        ) : (
          <img
            key={current.src}
            src={current.src}
            alt={current.label || alt || ''}
            className="max-w-[95vw] max-h-[90vh] rounded-card shadow-2xl object-contain"
          />
        )}
      </div>
    </div>
  );
}
