import { useRef, useState, useEffect } from 'react';
import { GitCompare } from 'lucide-react';

/**
 * Plynulý posuvník mezi původním a upraveným obrázkem.
 * Vlevo (0%) = originál, vpravo (100%) = upravené.
 * Drag handle uprostřed lze chytit myší / dotykem.
 *
 * Implementace přes CSS clip-path - obě images mají stejnou velikost
 * (object-contain v plném containeru), before image je oříznuta zprava
 * podle pct. Tím se zachová poměr stran a obrázek se zobrazí celý.
 */
interface Props {
  beforeUrl: string;
  afterUrl: string;
  alt?: string;
}

export function BeforeAfterSlider({ beforeUrl, afterUrl, alt = 'House' }: Props) {
  const [pct, setPct] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    const handleMove = (clientX: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = clientX - rect.left;
      const next = Math.max(0, Math.min(100, (x / rect.width) * 100));
      setPct(next);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!draggingRef.current) return;
      handleMove(e.clientX);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!draggingRef.current || !e.touches[0]) return;
      handleMove(e.touches[0].clientX);
    };
    const stop = () => { draggingRef.current = false; };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', stop);
    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', stop);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', stop);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', stop);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative select-none rounded-card overflow-hidden bg-surface-muted border border-outline cursor-ew-resize"
      onMouseDown={(e) => { draggingRef.current = true; e.preventDefault(); }}
      onTouchStart={() => { draggingRef.current = true; }}
    >
      {/* After image - definuje výšku containeru, vždy se vejde celý */}
      <img
        src={afterUrl}
        alt={alt}
        className="block w-full max-h-[60vh] object-contain select-none pointer-events-none"
      />

      {/* Before image - absolutně překrývá After, clip-path ořízne pravou stranu */}
      <img
        src={beforeUrl}
        alt={alt}
        className="absolute inset-0 w-full h-full object-contain select-none pointer-events-none"
        style={{ clipPath: `inset(0 ${100 - pct}% 0 0)` }}
      />

      {/* Drag handle - vertikální linka */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white/80 pointer-events-none"
        style={{ left: `${pct}%` }}
      />
      {/* Drag handle - kruh uprostřed */}
      <div
        className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-surface-card shadow-card flex items-center justify-center pointer-events-none"
        style={{ left: `${pct}%` }}
      >
        <GitCompare className="w-4 h-4 text-brand-primary" />
      </div>

      {/* Popisky */}
      <span className="absolute top-3 left-3 text-[11px] font-medium uppercase tracking-wider bg-black/55 text-white px-2 py-1 rounded-full pointer-events-none">
        Before
      </span>
      <span className="absolute top-3 right-3 text-[11px] font-medium uppercase tracking-wider bg-black/55 text-white px-2 py-1 rounded-full pointer-events-none">
        After
      </span>
    </div>
  );
}
