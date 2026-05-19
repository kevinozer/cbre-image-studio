import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { useT } from '@/i18n/useT';

interface Props {
  imageBase64: string;
  imageMime: string;
  onApply: (newImageBase64: string) => void;
  onClose: () => void;
}

type Position = 'top' | 'middle' | 'bottom';

const FONTS = ['Inter', 'Georgia', 'Helvetica', 'Times New Roman', 'Courier New', 'Arial Black'];

/**
 * Modal pro přidání textu na obrázek.
 * Composite je čistě client-side via Canvas API — žádné AI volání.
 */
export function TextOverlayModal({ imageBase64, imageMime, onApply, onClose }: Props) {
  const t = useT();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const [text, setText] = useState('');
  const [font, setFont] = useState('Inter');
  const [size, setSize] = useState(64);
  const [color, setColor] = useState('#FFFFFF');
  const [position, setPosition] = useState<Position>('bottom');

  // Render preview
  useEffect(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    if (!img.complete || !img.naturalWidth) {
      img.onload = () => render();
      return;
    }
    render();
    function render() {
      const w = img!.naturalWidth;
      const h = img!.naturalHeight;
      canvas!.width = w;
      canvas!.height = h;
      const ctx = canvas!.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img!, 0, 0, w, h);
      if (!text) return;
      ctx.font = `bold ${size}px ${font}, sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Shadow pro čitelnost
      ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
      ctx.shadowBlur = Math.max(8, size / 6);
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      const x = w / 2;
      const y = position === 'top' ? h * 0.15 : position === 'middle' ? h * 0.5 : h * 0.85;
      ctx.fillText(text, x, y, w * 0.92);
    }
  }, [text, font, size, color, position, imageBase64]);

  function handleApply() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const base64 = dataUrl.split(',')[1];
    onApply(base64);
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-surface-card rounded-card shadow-modal max-w-3xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-outline">
          <h3 className="text-h3 text-ink-primary">{t('app.text.heading')}</h3>
          <button type="button" onClick={onClose} className="p-1 rounded hover:bg-surface-muted">
            <X className="w-5 h-5 text-ink-muted" />
          </button>
        </header>

        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className="rounded-card overflow-hidden border border-outline bg-surface-muted">
            <img
              ref={imgRef}
              src={`data:${imageMime};base64,${imageBase64}`}
              alt=""
              className="hidden"
            />
            <canvas ref={canvasRef} className="w-full h-auto block" />
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">{t('app.text.placeholder')}</label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={t('app.text.placeholder')}
                className="w-full h-10 px-3 rounded-input border border-outline bg-surface-card text-ink-primary text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-green"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">{t('app.text.font')}</label>
              <select
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="w-full h-10 px-3 rounded-input border border-outline bg-surface-card text-ink-primary text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">{t('app.text.size')}: {size}px</label>
              <input
                type="range"
                min={16}
                max={200}
                step={2}
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full accent-brand-green"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">{t('app.text.color')}</label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-10 w-full rounded-input border border-outline bg-surface-card cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">{t('app.text.position')}</label>
              <div className="flex gap-1.5">
                {(['top', 'middle', 'bottom'] as Position[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPosition(p)}
                    className={
                      position === p
                        ? 'h-10 px-3 rounded-input border-2 border-brand-green bg-brand-greenTint text-brand-green text-[13px] font-semibold flex-1'
                        : 'h-10 px-3 rounded-input border border-outline bg-surface-card text-ink-secondary text-[13px] font-medium hover:bg-surface-muted flex-1'
                    }
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end gap-2 p-5 border-t border-outline">
          <button
            type="button"
            onClick={onClose}
            className="h-10 px-4 rounded-input border border-outline bg-surface-card text-ink-secondary text-[14px] font-medium hover:bg-surface-muted"
          >
            {t('app.text.cancel')}
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!text.trim()}
            className="h-10 px-5 rounded-input bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-green disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('app.text.apply')}
          </button>
        </footer>
      </div>
    </div>
  );
}
