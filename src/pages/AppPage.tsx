import { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Upload, X, Sparkles, Download, RotateCcw, Type, Paintbrush } from 'lucide-react';
import { AppNavBar } from '@/components/AppNavBar';
import { useT } from '@/i18n/useT';
import { MaskCanvas, type MaskCanvasHandle } from '@/components/MaskCanvas';
import { TextOverlayModal } from '@/components/TextOverlayModal';
import { compositeCbreLogo } from '@/utils/compositeImage';

type ModelKey = 'gemini-3-pro-image-preview' | 'gemini-3.1-flash-image-preview' | 'gemini-2.5-flash-image' | 'imagen-4.0-generate-001';
type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4';
type LogoPosition = 'br' | 'bl' | 'tr' | 'tl';

const MODELS: { id: ModelKey; labelKey: string }[] = [
  { id: 'gemini-3-pro-image-preview',     labelKey: 'app.model.gemini3pro' },
  { id: 'gemini-3.1-flash-image-preview', labelKey: 'app.model.gemini31flash' },
  { id: 'gemini-2.5-flash-image',         labelKey: 'app.model.gemini25flash' },
  { id: 'imagen-4.0-generate-001',        labelKey: 'app.model.imagen4' },
];

const ASPECTS: AspectRatio[] = ['1:1', '16:9', '9:16', '4:3', '3:4'];

export function AppPage() {
  const t = useT();

  // Inputs
  const [userPrompt, setUserPrompt] = useState('');
  const [referenceImage, setReferenceImage] = useState<{ dataUrl: string; mimeType: string } | null>(null);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const [model, setModel] = useState<ModelKey>('gemini-3-pro-image-preview');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [addCbreLogo, setAddCbreLogo] = useState(false);
  const [logoPosition, setLogoPosition] = useState<LogoPosition>('br');

  // State
  const [generating, setGenerating] = useState(false);
  const [generatingStage, setGeneratingStage] = useState<'enhance' | 'render' | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null); // base64, no data: prefix
  const [resultMime, setResultMime] = useState<string>('image/png');
  const [error, setError] = useState<string | null>(null);
  const [showTextModal, setShowTextModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const maskRef = useRef<MaskCanvasHandle>(null);

  // Derived
  const hasReferenceImage = !!referenceImage;
  const hasMask = !!maskDataUrl;
  // Imagen-4 nepřijímá reference image ani masku — varovat uživatele
  const isImagen = model === 'imagen-4.0-generate-001';

  // Auto-clear mask when reference image is removed
  useEffect(() => {
    if (!referenceImage && maskDataUrl) {
      setMaskDataUrl(null);
      maskRef.current?.clear();
    }
  }, [referenceImage, maskDataUrl]);

  function handleFileSelect(file: File) {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setReferenceImage({ dataUrl, mimeType: file.type });
      setMaskDataUrl(null);
    };
    reader.readAsDataURL(file);
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }
  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  }

  // Automaticky vylepší prompt v pozadí. Volá se uvnitř handleGenerate.
  // Pokud user napíše už hodně dlouhý prompt (>=240 znaků), enhance přeskočíme — pravděpodobně už ví, co chce.
  async function enhanceInBackground(): Promise<string> {
    const raw = userPrompt.trim();
    if (raw.length >= 240) return raw;
    try {
      const resp = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userPrompt: raw,
          hasReferenceImage,
          hasMask,
        }),
      });
      if (!resp.ok) {
        // Fallback: použij raw prompt
        return raw;
      }
      const data = await resp.json();
      const enhanced = (data.enhanced || '').trim();
      return enhanced.length >= 50 ? enhanced : raw;
    } catch {
      return raw;
    }
  }

  async function handleGenerate() {
    if (!userPrompt.trim()) return;
    setGenerating(true);
    setError(null);
    setResultImage(null);

    try {
      // Krok 1: enhance v pozadí (silent, automatic)
      setGeneratingStage('enhance');
      const finalPrompt = await enhanceInBackground();

      // Krok 2: vygenerovat obrázek
      setGeneratingStage('render');
      const maskNow = maskRef.current?.exportMask() || null;
      const useReference = hasReferenceImage && !isImagen; // Imagen nepřijímá referenci
      const mode = useReference && maskNow ? 'edit-mask' : useReference ? 'edit' : 'text';

      const body: Record<string, unknown> = {
        mode,
        prompt: finalPrompt,
        model,
        aspectRatio,
      };
      if (useReference && referenceImage) {
        body.imageBase64 = referenceImage.dataUrl.split(',')[1];
        body.mimeType = referenceImage.mimeType;
      }
      if (mode === 'edit-mask' && maskNow) {
        body.maskBase64 = maskNow.split(',')[1];
        body.maskMimeType = 'image/png';
      }

      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!resp.ok) {
        const data = await resp.json().catch(() => ({}));
        throw new Error(data.error || `HTTP ${resp.status}`);
      }
      const data = await resp.json();
      let finalImageBase64 = data.imageBase64;
      const mime = data.mimeType || 'image/png';

      // CBRE logo overlay (client-side composite)
      if (addCbreLogo) {
        finalImageBase64 = await compositeCbreLogo(finalImageBase64, mime, logoPosition);
      }

      setResultImage(finalImageBase64);
      setResultMime(mime);
    } catch (e) {
      setError((e as Error).message || t('app.error.generic'));
      console.error(e);
    } finally {
      setGenerating(false);
      setGeneratingStage(null);
    }
  }

  function handleDownload() {
    if (!resultImage) return;
    const a = document.createElement('a');
    a.href = `data:${resultMime};base64,${resultImage}`;
    a.download = `image-studio-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function handleIterate() {
    if (!resultImage) return;
    // Použij výsledek jako nový reference image
    setReferenceImage({ dataUrl: `data:${resultMime};base64,${resultImage}`, mimeType: resultMime });
    setResultImage(null);
    setMaskDataUrl(null);
    maskRef.current?.clear();
    setUserPrompt('');
    setError(null);
    // Scroll back to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleNewAttempt() {
    setResultImage(null);
    setError(null);
  }

  function handleTextOverlayApply(updatedBase64: string) {
    setResultImage(updatedBase64);
    setShowTextModal(false);
  }

  const canGenerate = userPrompt.trim().length > 0 && !generating;

  return (
    <div className="min-h-screen flex flex-col bg-surface-page">
      <AppNavBar />

      <main className="flex-1 max-w-container mx-auto w-full px-4 md:px-6 py-6 md:py-10 space-y-6">
        {/* Step 1: Prompt */}
        <section className="bg-surface-card rounded-card shadow-card border border-outline p-5 md:p-7">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-brand-green" />
            <h2 className="text-[14px] uppercase tracking-wider text-ink-secondary font-semibold">{t('app.section.prompt')}</h2>
          </div>
          <textarea
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            placeholder={t('app.prompt.placeholder')}
            rows={2}
            className="w-full px-4 py-3 rounded-input border border-outline bg-surface-card text-ink-primary text-[15px] focus:outline-none focus:ring-2 focus:ring-brand-green focus:border-transparent resize-none"
          />
          <p className="mt-2 text-[12px] text-ink-muted">
            {/* Hint: vylepšení promptu se děje automaticky před generováním */}
            {t('app.prompt.autoEnhanceHint')}
          </p>
        </section>

        {/* Step 2: Reference image + mask */}
        <section className="bg-surface-card rounded-card shadow-card border border-outline p-5 md:p-7">
          <div className="flex items-center gap-2 mb-3">
            <ImageIcon className="w-4 h-4 text-brand-green" />
            <h2 className="text-[14px] uppercase tracking-wider text-ink-secondary font-semibold">{t('app.section.reference')}</h2>
          </div>

          {!referenceImage ? (
            <div
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-outline rounded-card p-10 text-center cursor-pointer hover:border-brand-green hover:bg-surface-muted/50 transition-colors"
            >
              <Upload className="w-8 h-8 mx-auto text-ink-muted mb-3" />
              <p className="text-[14px] text-ink-secondary">{t('app.reference.drop')}</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <MaskCanvas
                ref={maskRef}
                imageDataUrl={referenceImage.dataUrl}
                onMaskChange={(mask) => setMaskDataUrl(mask)}
              />
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-input border border-outline bg-surface-card text-ink-secondary text-[13px] font-medium hover:bg-surface-muted transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  {t('app.reference.replace')}
                </button>
                <button
                  type="button"
                  onClick={() => { setReferenceImage(null); setMaskDataUrl(null); }}
                  className="inline-flex items-center gap-1.5 h-9 px-3 rounded-input border border-outline bg-surface-card text-ink-secondary text-[13px] font-medium hover:bg-surface-muted transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  {t('app.reference.remove')}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>
              {isImagen && hasReferenceImage && (
                <p className="text-[12px] text-amber-700 bg-amber-50 border border-amber-200 rounded-input p-2">
                  {t('app.imagen.refWarning')}
                </p>
              )}
            </div>
          )}
        </section>

        {/* Step 3: Settings */}
        <section className="bg-surface-card rounded-card shadow-card border border-outline p-5 md:p-7">
          <div className="flex items-center gap-2 mb-4">
            <Paintbrush className="w-4 h-4 text-brand-green" />
            <h2 className="text-[14px] uppercase tracking-wider text-ink-secondary font-semibold">{t('app.section.options')}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">{t('app.model.label')}</label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value as ModelKey)}
                className="w-full h-10 px-3 rounded-input border border-outline bg-surface-card text-ink-primary text-[14px] focus:outline-none focus:ring-2 focus:ring-brand-green"
              >
                {MODELS.map((m) => (
                  <option key={m.id} value={m.id}>{t(m.labelKey)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wider text-ink-muted font-semibold mb-1.5">{t('app.aspect.label')}</label>
              <div className="flex gap-1.5 flex-wrap">
                {ASPECTS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => setAspectRatio(a)}
                    disabled={!isImagen}
                    title={!isImagen ? 'Aspect ratio applies to Imagen 4 only' : ''}
                    className={
                      aspectRatio === a
                        ? 'h-10 px-3 rounded-input border-2 border-brand-green bg-brand-greenTint text-brand-green text-[13px] font-semibold'
                        : 'h-10 px-3 rounded-input border border-outline bg-surface-card text-ink-secondary text-[13px] font-medium hover:bg-surface-muted disabled:opacity-50 disabled:cursor-not-allowed'
                    }
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <div className="md:col-span-2 pt-2 border-t border-outline">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={addCbreLogo}
                  onChange={(e) => setAddCbreLogo(e.target.checked)}
                  className="w-4 h-4 accent-brand-green"
                />
                <span className="text-[14px] font-medium text-ink-primary">{t('app.cbreLogo.label')}</span>
              </label>
              {addCbreLogo && (
                <div className="mt-3 ml-6 flex flex-wrap gap-2">
                  {(['br', 'bl', 'tr', 'tl'] as LogoPosition[]).map((pos) => (
                    <button
                      key={pos}
                      type="button"
                      onClick={() => setLogoPosition(pos)}
                      className={
                        logoPosition === pos
                          ? 'h-9 px-3 rounded-input border-2 border-brand-green bg-brand-greenTint text-brand-green text-[12px] font-semibold'
                          : 'h-9 px-3 rounded-input border border-outline bg-surface-card text-ink-secondary text-[12px] font-medium hover:bg-surface-muted'
                      }
                    >
                      {t(`app.cbreLogo.pos.${pos}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Generate button */}
        <div className="flex flex-col items-end gap-3">
          {error && (
            <div className="self-stretch p-3 bg-red-50 border border-red-200 rounded-input text-red-700 text-[13px]">
              {error}
            </div>
          )}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="inline-flex items-center gap-2 h-12 px-7 rounded-input bg-brand-primary text-white text-[15px] font-bold hover:bg-brand-green disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-card"
          >
            <Sparkles className="w-5 h-5" />
            {generating
              ? generatingStage === 'enhance'
                ? t('app.stage.enhancing')
                : t('app.generating')
              : t('app.generate')}
          </button>
        </div>

        {/* Result */}
        {(resultImage || generating) && (
          <section className="bg-surface-card rounded-card shadow-card border border-outline p-5 md:p-7">
            <h2 className="text-[14px] uppercase tracking-wider text-ink-secondary font-semibold mb-4">{t('app.result.title')}</h2>
            {generating && !resultImage && (
              <div className="aspect-square max-w-2xl mx-auto bg-surface-muted rounded-card flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-4 border-brand-green border-t-transparent rounded-full animate-spin" />
                  <p className="text-[14px] text-ink-secondary">{t('app.generating')}</p>
                </div>
              </div>
            )}
            {resultImage && (
              <div className="space-y-4">
                <div className="rounded-card overflow-hidden border border-outline bg-surface-muted">
                  <img
                    src={`data:${resultMime};base64,${resultImage}`}
                    alt="Generated result"
                    className="w-full h-auto block"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-input bg-brand-primary text-white text-[14px] font-semibold hover:bg-brand-green transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {t('app.result.download')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTextModal(true)}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-input border border-outline bg-surface-card text-ink-secondary text-[14px] font-medium hover:bg-surface-muted transition-colors"
                  >
                    <Type className="w-4 h-4" />
                    {t('app.result.addText')}
                  </button>
                  <button
                    type="button"
                    onClick={handleIterate}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-input border border-outline bg-surface-card text-ink-secondary text-[14px] font-medium hover:bg-surface-muted transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t('app.result.iterate')}
                  </button>
                  <button
                    type="button"
                    onClick={handleNewAttempt}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-input border border-outline bg-surface-card text-ink-secondary text-[14px] font-medium hover:bg-surface-muted transition-colors"
                  >
                    <X className="w-4 h-4" />
                    {t('app.result.new')}
                  </button>
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      {showTextModal && resultImage && (
        <TextOverlayModal
          imageBase64={resultImage}
          imageMime={resultMime}
          onApply={handleTextOverlayApply}
          onClose={() => setShowTextModal(false)}
        />
      )}
    </div>
  );
}
