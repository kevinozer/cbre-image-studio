import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Eraser, Paintbrush, RotateCcw } from 'lucide-react';
import { useT } from '@/i18n/useT';

export interface MaskCanvasHandle {
  exportMask: () => string | null;
  clear: () => void;
}

interface Props {
  imageDataUrl: string;
  onMaskChange?: (mask: string | null) => void;
}

/**
 * Canvas překryvný nad obrázkem pro kreslení masky.
 * White pixels = oblast k editaci, transparent = preserve.
 * exportMask() vrací PNG dataURL (white-on-black), nebo null pokud nic není namalováno.
 */
export const MaskCanvas = forwardRef<MaskCanvasHandle, Props>(function MaskCanvas(
  { imageDataUrl, onMaskChange },
  ref,
) {
  const t = useT();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [brushSize, setBrushSize] = useState(30);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);

  // Setup canvas po načtení obrázku
  useEffect(() => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;

    function setupCanvas() {
      const w = img!.naturalWidth;
      const h = img!.naturalHeight;
      canvas!.width = w;
      canvas!.height = h;
      setNaturalSize({ w, h });
      const ctx = canvas!.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, w, h);
      setHasContent(false);
      onMaskChange?.(null);
    }
    if (img.complete && img.naturalWidth) setupCanvas();
    else img.onload = setupCanvas;
  }, [imageDataUrl, onMaskChange]);

  function getCanvasCoords(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function paintAt(x: number, y: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.fillStyle = 'rgba(34, 160, 107, 0.55)'; // brand green s průhledností pro UI
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
    if (!hasContent) {
      setHasContent(true);
    }
  }

  function handlePointerDown(e: React.PointerEvent) {
    setIsDrawing(true);
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (coords) paintAt(coords.x, coords.y);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }
  function handlePointerMove(e: React.PointerEvent) {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e.clientX, e.clientY);
    if (coords) paintAt(coords.x, coords.y);
  }
  function handlePointerUp() {
    if (!isDrawing) return;
    setIsDrawing(false);
    // Notify parent — exportujeme až when needed
    onMaskChange?.(hasContent ? 'paint' : null);
  }

  function clear() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasContent(false);
    onMaskChange?.(null);
  }

  // Export jako binární maska (white = paint, black = empty)
  function exportMask(): string | null {
    const canvas = canvasRef.current;
    if (!canvas || !naturalSize || !hasContent) return null;
    const off = document.createElement('canvas');
    off.width = naturalSize.w;
    off.height = naturalSize.h;
    const ctx = off.getContext('2d');
    if (!ctx) return null;
    // Black background
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, off.width, off.height);
    // Read original canvas — kde je alpha > 0, nastav white
    const srcCtx = canvas.getContext('2d');
    if (!srcCtx) return null;
    const srcData = srcCtx.getImageData(0, 0, canvas.width, canvas.height);
    const dstData = ctx.getImageData(0, 0, off.width, off.height);
    for (let i = 0; i < srcData.data.length; i += 4) {
      const alpha = srcData.data[i + 3];
      if (alpha > 0) {
        dstData.data[i] = 255;
        dstData.data[i + 1] = 255;
        dstData.data[i + 2] = 255;
        dstData.data[i + 3] = 255;
      }
    }
    ctx.putImageData(dstData, 0, 0);
    return off.toDataURL('image/png');
  }

  useImperativeHandle(ref, () => ({ exportMask, clear }), [naturalSize, hasContent]);

  return (
    <div className="space-y-3">
      <p className="text-[12px] text-ink-muted leading-relaxed">{t('app.mask.hint')}</p>
      <div ref={containerRef} className="relative rounded-card overflow-hidden border border-outline bg-surface-muted">
        <img
          ref={imgRef}
          src={imageDataUrl}
          alt="Reference"
          className="block w-full h-auto pointer-events-none select-none"
          draggable={false}
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Paintbrush className="w-4 h-4 text-ink-muted" />
        <label className="flex items-center gap-2 text-[12px] text-ink-secondary">
          {t('app.mask.brush')}:
          <input
            type="range"
            min={10}
            max={120}
            step={2}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="accent-brand-green"
          />
          <span className="w-8 text-right">{brushSize}px</span>
        </label>
        <button
          type="button"
          onClick={clear}
          disabled={!hasContent}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-input border border-outline bg-surface-card text-ink-secondary text-[12px] font-medium hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eraser className="w-3.5 h-3.5" />
          {t('app.mask.clear')}
        </button>
      </div>
    </div>
  );
});
