import { useState, useRef, useEffect } from 'react';
import {
  Loader2, Upload, Image as ImageIcon, RotateCcw,
  RotateCw, Download, RefreshCw, Eye, Layers, Camera, Wand2, ChevronDown,
  Send
} from 'lucide-react';
import { BeforeAfterSlider } from './BeforeAfterSlider';
import { CAMERA_ANGLES } from './stylePresets';
import { useT } from '@/i18n/useT';

import { Lightbox } from './Lightbox';
type ViewMode = 'single' | 'compare' | 'original';

interface Props {
  loading: boolean;
  loadingLabel: string;
  originalDataUrl: string | null;
  currentDataUrl: string | null;
  hasResultEdit: boolean;
  canUndo: boolean;
  canRedo: boolean;
  canDownload: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onDownload: () => void;
  canRetry: boolean;
  onRetry: () => void;
  onAnnotate: () => void;
  onChangeCamera: (id: string) => void;
  onLastChange: (text: string) => void;
  onUploadClick: () => void;
}

export function ResultStage(p: Props) {
  const t = useT();
  const [view, setView] = useState<ViewMode>('single');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);
  const [lastChangeText, setLastChangeText] = useState('');

  useEffect(() => {
    if (!p.hasResultEdit) setView('single');
  }, [p.hasResultEdit]);

  const handleLastChange = () => {
    const txt = lastChangeText.trim();
    if (!txt) return;
    p.onLastChange(txt);
    setLastChangeText('');
  };

  return (
    <>
    <main className="flex-1 px-4 md:px-8 py-4 md:py-6 flex flex-col gap-4 min-w-0">
      <header className="flex items-baseline gap-3">
        <h1 className="text-[20px] md:text-[24px] font-bold text-ink-primary">{t('hv.rs.title')}</h1>
        <span className="text-[13px] text-ink-muted">
          {t('hv.rs.subtitle')}
        </span>
      </header>

      <div className="rounded-card bg-surface-muted border border-outline min-h-[200px] md:min-h-[440px] relative overflow-hidden flex items-center justify-center">
        {!p.currentDataUrl && (
          <button
            type="button"
            onClick={p.onUploadClick}
            className="flex flex-col items-center gap-2 text-ink-muted hover:text-ink-primary p-6 md:p-10"
          >
            <Upload className="w-10 h-10" />
            <p className="text-[15px] text-ink-secondary">{t('hv.rs.upload')}</p>
          </button>
        )}

        {p.currentDataUrl && view === 'single' && (
          <img
            src={p.currentDataUrl}
            alt={t('hv.rs.alt.house')}
            onClick={() => { setLightboxStart(1); setLightboxOpen(true); }}
            className="block max-w-full max-h-[60vh] rounded-input object-contain cursor-zoom-in"
          />
        )}

        {p.currentDataUrl && view === 'original' && p.originalDataUrl && (
          <div className="relative">
            <img
              src={p.originalDataUrl}
              alt={t('hv.rs.alt.original')}
              onClick={() => { setLightboxStart(0); setLightboxOpen(true); }}
              className="block max-w-full max-h-[60vh] rounded-input object-contain cursor-zoom-in"
            />
            <span className="absolute top-3 left-3 text-[11px] font-medium uppercase tracking-wider bg-black/55 text-white px-2 py-1 rounded-full">
              {t('hv.rs.label.original')}
            </span>
          </div>
        )}

        {p.currentDataUrl && view === 'compare' && p.originalDataUrl && (
          <div className="w-full max-h-[60vh]">
            <BeforeAfterSlider beforeUrl={p.originalDataUrl} afterUrl={p.currentDataUrl} />
          </div>
        )}

        {p.loading && (
          <div className="absolute inset-0 bg-white/70 backdrop-blur-sm rounded-card flex flex-col items-center justify-center gap-3 z-10">
            <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
            <p className="text-[14px] text-ink-primary font-medium">{p.loadingLabel}</p>
          </div>
        )}
      </div>

      {p.hasResultEdit && (
        <div className="rounded-card bg-surface-card border border-outline p-3 flex flex-col gap-2 shadow-card">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
            {t('hv.rs.lastChanges')}
          </div>
          <div className="flex items-stretch gap-2">
            <textarea
              value={lastChangeText}
              onChange={(e) => setLastChangeText(e.target.value)}
              placeholder={t('hv.rs.lastChanges.ph')}
              rows={2}
              className="flex-1 rounded-input border border-outline px-3 py-2 text-[13px] text-ink-primary focus:outline-none focus:border-brand-primary resize-none"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleLastChange();
              }}
            />
            <button
              type="button"
              onClick={handleLastChange}
              disabled={!lastChangeText.trim() || p.loading}
              className="self-stretch px-4 rounded-input bg-brand-primary hover:bg-brand-primaryHover text-white text-[13px] font-medium inline-flex items-center gap-2 disabled:bg-ink-disabled/60 disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>{t('hv.rs.applyTweak')}</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center gap-1.5 lg:gap-3 flex-wrap">
        <IconBtn icon={RotateCcw} label={t('hv.rs.btn.undo')} onClick={p.onUndo} disabled={!p.canUndo} />
        <IconBtn icon={RotateCw}  label={t('hv.rs.btn.redo')} onClick={p.onRedo} disabled={!p.canRedo} />
        <IconBtn icon={Download}  label={t('hv.rs.btn.download')} onClick={p.onDownload} disabled={!p.canDownload} />

        <span className="mx-1 h-8 w-px bg-outline" />

        <ActionBtn
          icon={RefreshCw}
          label={t('hv.rs.btn.retry')}
          onClick={p.onRetry}
          disabled={!p.canRetry || p.loading}
          title={t('hv.rs.btn.retry.title')}
        />
        <ViewToggle
          view={view}
          setView={setView}
          hasResult={p.hasResultEdit && !!p.originalDataUrl}
        />
        <CameraAngleButton
          onPick={p.onChangeCamera}
          disabled={!p.canRetry || p.loading}
        />
        <ActionBtn
          icon={Wand2}
          label={t('hv.rs.btn.highlight')}
          onClick={p.onAnnotate}
          disabled={!p.currentDataUrl || p.loading}
          title={t('hv.rs.btn.highlight.title')}
        />
      </div>
    </main>
  
      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        items={[
          ...(p.originalDataUrl ? [{ src: p.originalDataUrl, label: t('hv.rs.label.original'), type: 'image' as const }] : []),
          ...(p.currentDataUrl ? [{ src: p.currentDataUrl, label: t('hv.rs.alt.house'), type: 'image' as const }] : []),
        ]}
        startIndex={lightboxStart}
      />
    </>
    );
}

function IconBtn({ icon: Icon, label, onClick, disabled }: {
  icon: any; label: string; onClick: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="w-9 h-9 lg:w-11 lg:h-11 rounded-card border border-outline bg-surface-card text-ink-primary flex items-center justify-center disabled:text-ink-disabled disabled:cursor-not-allowed enabled:hover:bg-surface-muted transition-colors"
    >
      <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
    </button>
  );
}

function ActionBtn({ icon: Icon, label, onClick, disabled, title }: {
  icon: any; label: string; onClick: () => void; disabled?: boolean; title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="h-9 lg:h-11 px-3 lg:px-4 rounded-card border border-outline bg-surface-card text-ink-primary text-[12px] lg:text-[13px] font-medium inline-flex items-center gap-1.5 lg:gap-2 disabled:text-ink-disabled disabled:cursor-not-allowed enabled:hover:bg-surface-muted transition-colors"
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function ViewToggle({ view, setView, hasResult }: {
  view: ViewMode; setView: (v: ViewMode) => void; hasResult: boolean;
}) {
  const t = useT();
  if (!hasResult) {
    return <ActionBtn icon={Eye} label={t('hv.rs.btn.showOriginal')} onClick={() => {}} disabled />;
  }
  return (
    <div className="inline-flex rounded-card border border-outline bg-surface-card overflow-hidden h-9 lg:h-11">
      <ToggleBtn icon={ImageIcon} label={t('hv.rs.btn.edited')}      active={view === 'single'}   onClick={() => setView('single')} />
      <ToggleBtn icon={Eye}        label={t('hv.rs.label.original')} active={view === 'original'} onClick={() => setView('original')} />
      <ToggleBtn icon={Layers}     label={t('hv.rs.btn.compare')}    active={view === 'compare'}  onClick={() => setView('compare')} />
    </div>
  );
}

function ToggleBtn({ icon: Icon, label, active, onClick }: {
  icon: any; label: string; active: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-2 lg:px-3 inline-flex items-center gap-1 lg:gap-1.5 text-[12px] lg:text-[13px] font-medium transition-colors ${
        active
          ? 'bg-brand-primary text-white'
          : 'text-ink-secondary hover:bg-surface-muted'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function CameraAngleButton({ onPick, disabled }: { onPick: (id: string) => void; disabled?: boolean; }) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    if (open) window.addEventListener('mousedown', close);
    return () => window.removeEventListener('mousedown', close);
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={disabled}
        title={t('hv.rs.btn.cameraAngle.title')}
        className="h-9 lg:h-11 px-3 lg:px-4 rounded-card border border-outline bg-surface-card text-ink-primary text-[12px] lg:text-[13px] font-medium inline-flex items-center gap-1.5 lg:gap-2 disabled:text-ink-disabled disabled:cursor-not-allowed enabled:hover:bg-surface-muted transition-colors"
      >
        <Camera className="w-4 h-4" />
        <span>{t('hv.rs.btn.cameraAngle')}</span>
        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 bottom-12 w-56 bg-surface-card border border-outline rounded-card shadow-modal z-20 py-1">
          {CAMERA_ANGLES.map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => { onPick(a.id); setOpen(false); }}
              className="w-full text-left px-3 py-2 text-[13px] text-ink-primary hover:bg-surface-muted"
            >
              {t(a.labelKey)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
