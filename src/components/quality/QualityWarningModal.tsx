import { useEffect } from 'react';
import { X, AlertTriangle, Wand2, Play } from 'lucide-react';
import { useAppContext } from '@/state/AppContext';

/**
 * Modal který se zobrazí když user nahraje fotku se špatnou kvalitou.
 * Tři akce: zavřít (nic) | upscale (otevře cbre-upscale-photo v nové záložce)
 * | ignorovat (pokračovat s low-quality fotkou).
 *
 * Detekce kvality probíhá v parent komponentě přes detectImageQuality(),
 * která vrátí null (OK) nebo důvod ('small' | 'compressed' | 'blurry').
 *
 * Po upscale příchozí postMessage `upscale:result` automaticky nasadí novou
 * fotku zpět do parent state přes onUpscaled callback.
 */
const UPSCALE_URL =
  (import.meta as { env?: { VITE_UPSCALE_URL?: string } }).env?.VITE_UPSCALE_URL ||
  'https://cbre-upscale-photo-432966609797.europe-west1.run.app';

export type QualityIssue = 'small' | 'compressed' | 'blurry' | null;

interface Props {
  open: boolean;
  /** Důvod, proč warning vyskakuje. null = modal je zavřený. */
  issue: QualityIssue;
  /** Aktuální fotka — kterou pošleme do Upscale appky přes postMessage. */
  imageDataUrl: string | null;
  mimeType?: string;
  /** appSlug parent appky (např. 'profile-photo') — pro routing. */
  appSlug: string;
  /** Zavřít modal bez akce. */
  onClose: () => void;
  /** Ignorovat warning a pokračovat s aktuální fotkou. */
  onIgnore: () => void;
  /** Volitelný callback — když přijde postMessage 'upscale:result', nastav novou fotku. */
  onUpscaled?: (dataUrl: string, mimeType: string) => void;
}

const T = {
  cs: {
    title: 'Nahraná fotka je v nízké kvalitě',
    body: {
      small: 'Fotka má malé rozlišení. Výsledek aplikace nemusí být dobrý — zkus fotku nejdříve upscalovat.',
      compressed: 'Fotka je silně komprimovaná. Výsledek aplikace nemusí být dobrý — zkus fotku nejdříve upscalovat.',
      blurry: 'Fotka je rozmazaná nebo zrnitá. Výsledek aplikace nemusí být dobrý — zkus fotku nejdříve upscalovat.',
    },
    close: 'Zavřít',
    upscale: 'Upscalovat',
    ignore: 'Ignorovat',
  },
  en: {
    title: 'Uploaded photo is low quality',
    body: {
      small: 'The photo has low resolution. The result may not be great — try upscaling it first.',
      compressed: 'The photo is heavily compressed. The result may not be great — try upscaling it first.',
      blurry: 'The photo is blurry or grainy. The result may not be great — try upscaling it first.',
    },
    close: 'Close',
    upscale: 'Upscale',
    ignore: 'Ignore',
  },
  sk: {
    title: 'Nahraná fotka je v nízkej kvalite',
    body: {
      small: 'Fotka má malé rozlíšenie. Výsledok nemusí byť dobrý — skús upscalovať.',
      compressed: 'Fotka je silne komprimovaná. Výsledok nemusí byť dobrý — skús upscalovať.',
      blurry: 'Fotka je rozmazaná. Výsledok nemusí byť dobrý — skús upscalovať.',
    },
    close: 'Zavrieť',
    upscale: 'Upscale',
    ignore: 'Ignorovať',
  },
} as const;

export function QualityWarningModal({
  open,
  issue,
  imageDataUrl,
  mimeType = 'image/jpeg',
  appSlug,
  onClose,
  onIgnore,
  onUpscaled,
}: Props) {
  const { language } = useAppContext();
  const t = T[language] || T.cs;

  // Escape klávesa zavírá modal
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Naslouchej postMessage od Upscale Photo appky
  useEffect(() => {
    if (!onUpscaled) return;
    const onMsg = (e: MessageEvent) => {
      // Odpověz na initial request o fotku
      if (e.data?.type === 'upscale:request-image' && e.data?.source === appSlug && imageDataUrl) {
        const src = e.source as Window | null;
        src?.postMessage({ type: 'upscale:image', dataUrl: imageDataUrl, mimeType }, { targetOrigin: '*' });
      }
      // Přijetí výsledku
      if (e.data?.type === 'upscale:result' && e.data?.source === appSlug && typeof e.data?.dataUrl === 'string') {
        onUpscaled(e.data.dataUrl, e.data.mimeType || 'image/png');
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [appSlug, imageDataUrl, mimeType, onUpscaled]);

  if (!open || !issue) return null;

  const handleUpscale = () => {
    const url = `${UPSCALE_URL}/?source=${encodeURIComponent(appSlug)}`;
    window.open(url, '_blank', 'noopener=no,noreferrer=no'); // potřebujeme window.opener pro postMessage
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-neutral-900 rounded-2xl shadow-xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3 p-5 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{t.title}</h2>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-1 leading-relaxed">{t.body[issue]}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 -mt-1 -mr-1 p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500"
            aria-label={t.close}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 p-4 bg-neutral-50 dark:bg-neutral-950 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm rounded-lg text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800"
          >
            {t.close}
          </button>
          <button
            onClick={onIgnore}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-outline bg-white dark:bg-neutral-800 text-ink-primary hover:bg-neutral-100 dark:hover:bg-neutral-700"
          >
            <Play className="w-4 h-4" />
            {t.ignore}
          </button>
          <button
            onClick={handleUpscale}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-amber-500 hover:bg-amber-600 text-white"
          >
            <Wand2 className="w-4 h-4" />
            {t.upscale}
          </button>
        </div>
      </div>
    </div>
  );
}
