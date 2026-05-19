import { useRef, useEffect, useState } from 'react';
import { Brush, Eraser, RotateCcw, Send, X } from 'lucide-react';
import { useT } from '@/i18n/useT';

interface Props {
  imageUrl: string;
  onCancel: () => void;
  onSubmit: (payload: { maskBase64: string; mimeType: 'image/png'; annotationText: string }) => void;
  busy?: boolean;
}

type Tool = 'brush' | 'eraser';

export function AnnotationCanvas({ imageUrl, onCancel, onSubmit, busy }: Props) {
  const t = useT();
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const [tool, setTool] = useState<Tool>('brush');
  const [brushSize, setBrushSize] = useState(40);
  const [text, setText] = useState('');
  const [hasStrokes, setHasStrokes] = useState(false);

  const handleImageLoad = () => {
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!img || !canvas) return;
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const toCanvasCoord = (clientX: number, clientY: number) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * canvas.width,
      y: ((clientY - rect.top) / rect.height) * canvas.height
    };
  };

  const drawSegment = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = 'rgba(245, 200, 60, 0.4)';
    }
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    setHasStrokes(true);
  };

  const start = (clientX: number, clientY: number) => {
    drawingRef.current = true;
    const p = toCanvasCoord(clientX, clientY);
    lastPointRef.current = p;
    drawSegment(p, p);
  };
  const move = (clientX: number, clientY: number) => {
    if (!drawingRef.current) return;
    const p = toCanvasCoord(clientX, clientY);
    if (lastPointRef.current) drawSegment(lastPointRef.current, p);
    lastPointRef.current = p;
  };
  const stop = () => {
    drawingRef.current = false;
    lastPointRef.current = null;
  };

  useEffect(() => {
    const onMouseUp = () => stop();
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('touchend', onMouseUp);
    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchend', onMouseUp);
    };
  }, []);

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const exportMask = (): string => {
    const src = canvasRef.current;
    if (!src) return '';
    const out = document.createElement('canvas');
    out.width = src.width;
    out.height = src.height;
    const sctx = src.getContext('2d')!;
    const octx = out.getContext('2d')!;
    octx.fillStyle = '#000000';
    octx.fillRect(0, 0, out.width, out.height);
    const data = sctx.getImageData(0, 0, src.width, src.height);
    const out2 = octx.getImageData(0, 0, out.width, out.height);
    for (let i = 0; i < data.data.length; i += 4) {
      if (data.data[i + 3] > 30) {
        out2.data[i] = 255;
        out2.data[i + 1] = 230;
        out2.data[i + 2] = 60;
        out2.data[i + 3] = 255;
      }
    }
    octx.putImageData(out2, 0, 0);
    const url = out.toDataURL('image/png');
    return url.split(',')[1];
  };

  const handleSubmit = () => {
    if (!hasStrokes) return;
    const maskBase64 = exportMask();
    onSubmit({ maskBase64, mimeType: 'image/png', annotationText: text.trim() });
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 overflow-auto">
      <div className="bg-surface-page rounded-card shadow-modal w-full max-w-5xl flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-[18px] font-semibold text-ink-primary">{t('hv.ac.title')}</h2>
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-full hover:bg-surface-muted flex items-center justify-center text-ink-secondary"
            aria-label={t('hv.ac.close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-[13px] text-ink-muted -mt-2">
          {t('hv.ac.body')}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          <ToolButton active={tool === 'brush'} onClick={() => setTool('brush')} icon={<Brush className="w-4 h-4" />} label={t('hv.ac.tool.brush')} />
          <ToolButton active={tool === 'eraser'} onClick={() => setTool('eraser')} icon={<Eraser className="w-4 h-4" />} label={t('hv.ac.tool.eraser')} />
          <div className="flex items-center gap-2 ml-2">
            <span className="text-[12px] text-ink-muted">{t('hv.ac.tool.size')}</span>
            <input
              type="range"
              min={8}
              max={120}
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-[12px] text-ink-secondary w-8 text-right">{brushSize}</span>
          </div>
          <button
            onClick={handleClear}
            className="ml-auto inline-flex items-center gap-2 px-3 h-9 rounded-input border border-outline text-[13px] text-ink-secondary hover:bg-surface-muted"
          >
            <RotateCcw className="w-4 h-4" /> {t('hv.ac.tool.clear')}
          </button>
        </div>

        <div className="relative w-full bg-surface-muted rounded-card overflow-hidden border border-outline">
          <img
            ref={imgRef}
            src={imageUrl}
            alt={t('hv.rs.alt.house')}
            onLoad={handleImageLoad}
            className="block w-full h-auto select-none"
            draggable={false}
          />
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full cursor-crosshair touch-none"
            onMouseDown={(e) => start(e.clientX, e.clientY)}
            onMouseMove={(e) => move(e.clientX, e.clientY)}
            onTouchStart={(e) => { const tt = e.touches[0]; if (tt) start(tt.clientX, tt.clientY); }}
            onTouchMove={(e) => { const tt = e.touches[0]; if (tt) move(tt.clientX, tt.clientY); }}
          />
        </div>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('hv.ac.text.ph')}
          rows={2}
          className="w-full rounded-input border border-outline px-3 py-2 text-[14px] text-ink-primary bg-surface-card focus:outline-none focus:border-brand-primary"
        />

        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onCancel}
            className="h-10 px-4 rounded-input border border-outline text-[14px] text-ink-secondary hover:bg-surface-muted"
            disabled={busy}
          >
            {t('hv.ac.btn.cancel')}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!hasStrokes || busy}
            className="h-10 px-4 rounded-input bg-brand-primary hover:bg-brand-primaryHover text-white text-[14px] font-medium inline-flex items-center gap-2 disabled:bg-ink-disabled/60 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            {busy ? t('hv.ac.btn.applying') : t('hv.ac.btn.apply')}
          </button>
        </div>
      </div>
    </div>
  );
}

function ToolButton({ active, onClick, icon, label }: {
  active: boolean; onClick: () => void; icon: React.ReactNode; label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 h-9 px-3 rounded-input border text-[13px] transition-colors ${
        active
          ? 'bg-brand-primary border-brand-primary text-white'
          : 'bg-surface-card border-outline text-ink-secondary hover:bg-surface-muted'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
