import { useEffect, useRef, useState } from 'react';
import { ChevronDown, Check, X, Upload as UploadIcon } from 'lucide-react';
import {
  STYLE_PRESETS,
  FACADE_TYPES,
  ROOF_TYPES,
  WINDOW_DOOR_STYLES,
  SEASONS,
  LIGHT_OPTIONS,
  SURROUNDINGS,
  OTHER_ACTIONS,
  type ElementOption
} from './stylePresets';
import { useT } from '@/i18n/useT';

// Jednosloupcový panel s i18n.

export type ElementChanges = {
  facadeType?: string;
  roofType?: string;
  windowDoorStyle?: string;
  facadeColor?: string;
  roofColor?: string;
  windowDoorColor?: string;
  season?: string;
  light?: string;
  surroundings?: string;
};

interface Props {
  hasImage: boolean;
  loading: boolean;
  selectedPreset: string | null;
  onSelectPreset: (id: string | null) => void;
  elementChanges: ElementChanges;
  setElementChanges: (next: ElementChanges) => void;
  activeElementKey: keyof ElementChanges | null;
  setActiveElementKey: (k: keyof ElementChanges | null) => void;
  selectedOtherActions: string[];
  setSelectedOtherActions: (ids: string[]) => void;
  customHint: string;
  setCustomHint: (s: string) => void;
  canApply: boolean;
  applyLabel: string;
  onApply: () => void;
  onUploadClick: () => void;
}

export function Sidebar(p: Props) {
  const t = useT();
  // Mode lock: po výběru jedné kategorie blokujeme ostatní (Kevin's UX)
  const mode: 'preset' | 'element' | 'fixes' | 'idle' =
    p.selectedPreset ? 'preset'
    : p.activeElementKey ? 'element'
    : p.selectedOtherActions.length > 0 ? 'fixes'
    : 'idle';
  const presetLocked = mode === 'element' || mode === 'fixes';
  const fixesLocked = mode === 'preset' || mode === 'element';
  const elemLocked = (myKey: keyof ElementChanges): boolean =>
    mode === 'preset' || mode === 'fixes' || (mode === 'element' && p.activeElementKey !== myKey);

  return (
    <aside className="w-full lg:w-[320px] lg:shrink-0 border-b lg:border-b-0 lg:border-r border-outline bg-surface-card flex flex-col lg:overflow-hidden">
      <div className="px-3 lg:px-4 py-2 lg:py-3 border-b border-outline">
        <button
          type="button"
          onClick={p.onUploadClick}
          className="w-full inline-flex items-center justify-center gap-2 h-9 lg:h-10 rounded-input border border-outline bg-surface-card text-[12px] lg:text-[14px] text-ink-primary hover:bg-surface-muted transition-colors"
        >
          <UploadIcon className="w-4 h-4" />
          <span>{p.hasImage ? t('hv.sb.replacePhoto') : t('hv.sb.uploadPhoto')}</span>
        </button>
      
        <div className="mt-1.5 lg:mt-2 px-2 lg:px-3 py-1.5 lg:py-2 rounded-input bg-amber-50 border border-amber-200 text-[10px] lg:text-[11px] text-amber-900 leading-snug">
          {t('hv.sb.warning.singleEdit')}
        </div>
      </div>

      <div className="flex-1 lg:overflow-y-auto px-2 lg:px-3 py-2 lg:py-3 space-y-2 lg:space-y-3">
        <PresetDropdown
          locked={presetLocked}
          selected={p.selectedPreset}
          onSelect={(id) => {
            p.onSelectPreset(id);
            if (id) {
              p.setSelectedOtherActions([]);
              p.setElementChanges({});
              p.setActiveElementKey(null);
            }
          }}
        />

        <section className="space-y-2 pt-1">
          <SectionHeading>{t('hv.sb.section.elements')}</SectionHeading>

          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          <ElementRow
            locked={elemLocked('facadeType') && elemLocked('facadeColor')}
            title={t('hv.sb.elem.facade')}
            options={FACADE_TYPES}
            selectedOption={p.elementChanges.facadeType}
            color={p.elementChanges.facadeColor}
            onSelectOption={(v) => {
              const next = { ...p.elementChanges, facadeType: v || undefined };
              p.setElementChanges(next);
              if (v) p.setActiveElementKey('facadeType');
              else if (p.activeElementKey === 'facadeType') p.setActiveElementKey(null);
            }}
            onSelectColor={(v) => {
              const next = { ...p.elementChanges, facadeColor: v };
              p.setElementChanges(next);
              if (v) p.setActiveElementKey('facadeColor');
              else if (p.activeElementKey === 'facadeColor') p.setActiveElementKey(null);
            }}
          />

          <ElementRow
            locked={elemLocked('roofType') && elemLocked('roofColor')}
            title={t('hv.sb.elem.roof')}
            options={ROOF_TYPES}
            selectedOption={p.elementChanges.roofType}
            color={p.elementChanges.roofColor}
            onSelectOption={(v) => {
              const next = { ...p.elementChanges, roofType: v || undefined };
              p.setElementChanges(next);
              if (v) p.setActiveElementKey('roofType');
              else if (p.activeElementKey === 'roofType') p.setActiveElementKey(null);
            }}
            onSelectColor={(v) => {
              const next = { ...p.elementChanges, roofColor: v };
              p.setElementChanges(next);
              if (v) p.setActiveElementKey('roofColor');
              else if (p.activeElementKey === 'roofColor') p.setActiveElementKey(null);
            }}
          />

          <ElementRow
            locked={elemLocked('windowDoorStyle') && elemLocked('windowDoorColor')}
            title={t('hv.sb.elem.windows')}
            options={WINDOW_DOOR_STYLES}
            selectedOption={p.elementChanges.windowDoorStyle}
            color={p.elementChanges.windowDoorColor}
            onSelectOption={(v) => {
              const next = { ...p.elementChanges, windowDoorStyle: v || undefined };
              p.setElementChanges(next);
              if (v) p.setActiveElementKey('windowDoorStyle');
              else if (p.activeElementKey === 'windowDoorStyle') p.setActiveElementKey(null);
            }}
            onSelectColor={(v) => {
              const next = { ...p.elementChanges, windowDoorColor: v };
              p.setElementChanges(next);
              if (v) p.setActiveElementKey('windowDoorColor');
              else if (p.activeElementKey === 'windowDoorColor') p.setActiveElementKey(null);
            }}
          />
          </div>
        </section>

        <section className="space-y-2 pt-1">
          <SectionHeading>{t('hv.sb.section.setting')}</SectionHeading>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">

          <SingleDropdown
            locked={elemLocked('surroundings')}
            title={t('hv.sb.dropdown.surround')}
            placeholder={t('hv.sb.dropdown.surround.ph')}
            options={SURROUNDINGS}
            value={p.elementChanges.surroundings}
            onChange={(v) => {
              const next = { ...p.elementChanges, surroundings: v };
              p.setElementChanges(next);
              if (v) p.setActiveElementKey('surroundings');
              else if (p.activeElementKey === 'surroundings') p.setActiveElementKey(null);
            }}
          />

          <SingleDropdown
            locked={elemLocked('season')}
            title={t('hv.sb.dropdown.season')}
            placeholder={t('hv.sb.dropdown.season.ph')}
            options={SEASONS}
            value={p.elementChanges.season}
            onChange={(v) => {
              const next = { ...p.elementChanges, season: v };
              p.setElementChanges(next);
              if (v) p.setActiveElementKey('season');
              else if (p.activeElementKey === 'season') p.setActiveElementKey(null);
            }}
          />

          <SingleDropdown
            locked={elemLocked('light')}
            title={t('hv.sb.dropdown.light')}
            placeholder={t('hv.sb.dropdown.light.ph')}
            options={LIGHT_OPTIONS}
            value={p.elementChanges.light}
            onChange={(v) => {
              const next = { ...p.elementChanges, light: v };
              p.setElementChanges(next);
              if (v) p.setActiveElementKey('light');
              else if (p.activeElementKey === 'light') p.setActiveElementKey(null);
            }}
          />
          </div>
        </section>

        <section className="space-y-2 pt-1">
          <SectionHeading>{t('hv.sb.section.fixes')}</SectionHeading>
          <MultiCheckDropdown
            locked={fixesLocked}
            placeholder={t('hv.sb.fixes.placeholder')}
            options={OTHER_ACTIONS}
            selected={p.selectedOtherActions}
            onChange={(ids) => {
              p.setSelectedOtherActions(ids);
              if (ids.length) {
                p.onSelectPreset(null);
                p.setElementChanges({});
                p.setActiveElementKey(null);
              }
            }}
          />
        </section>
      </div>

      <div className="border-t border-outline px-3 py-2 lg:py-3 space-y-1.5 lg:space-y-2 bg-surface-muted/40">
        <label className="block text-[10px] lg:text-[11px] font-semibold uppercase tracking-wider text-ink-muted">
          {t('hv.sb.customHint')} <span className="font-normal normal-case text-ink-muted/70">{t('hv.sb.optional')}</span>
        </label>
        <textarea
          value={p.customHint}
          onChange={(e) => p.setCustomHint(e.target.value)}
          rows={1}
          placeholder={t('hv.sb.customHint.ph')}
          className="w-full rounded-input border border-outline bg-surface-card px-2 lg:px-3 py-1.5 lg:py-2 text-[12px] lg:text-[13px] text-ink-primary focus:outline-none focus:border-brand-primary resize-none"
        />
      </div>

      <div className="border-t border-outline p-2 lg:p-3">
        <button
          type="button"
          onClick={p.onApply}
          disabled={!p.canApply}
          className={`w-full h-10 lg:h-12 rounded-card font-bold text-[13px] lg:text-[15px] transition-colors inline-flex items-center justify-center gap-2 ${
            p.canApply
              ? 'bg-brand-primary hover:bg-brand-primaryHover text-white shadow-card'
              : 'bg-ink-disabled/60 text-white/85 cursor-not-allowed'
          }`}
        >
          {p.loading ? t('hv.sb.generating') : p.applyLabel}
        </button>
      </div>
    </aside>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] font-semibold uppercase tracking-wider text-ink-muted px-1">
      {children}
    </div>
  );
}

function PresetDropdown({ selected, onSelect, locked }: {
  selected: string | null;
  onSelect: (id: string | null) => void;
  locked?: boolean;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const sel = STYLE_PRESETS.find((p) => p.id === selected);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <section className="space-y-2">
      <SectionHeading>{t('hv.sb.section.preset')}</SectionHeading>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => !locked && setOpen(!open)}
          disabled={locked}
          className={`w-full h-11 px-3 rounded-input border text-left text-[14px] transition-colors flex items-center justify-between ${
            locked ? 'opacity-40 cursor-not-allowed bg-surface-card border-outline' :
            selected
              ? 'bg-brand-primary/10 border-brand-primary text-brand-primary'
              : 'bg-surface-card border-outline text-ink-primary hover:bg-surface-muted'
          }`}
        >
          <span className="truncate">{sel ? t(sel.labelKey) : t('hv.sb.preset.placeholder')}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute left-0 right-0 top-12 z-30 bg-surface-card border border-outline rounded-card shadow-modal overflow-hidden max-h-80 overflow-y-auto">
            <button
              type="button"
              onClick={() => { onSelect(null); setOpen(false); }}
              className="w-full text-left px-3 py-2.5 text-[13px] text-ink-muted hover:bg-surface-muted border-b border-outline"
            >
              {t('hv.sb.preset.noPreset')}
            </button>
            {STYLE_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => { onSelect(preset.id); setOpen(false); }}
                className={`w-full text-left px-3 py-2.5 text-[13px] hover:bg-surface-muted transition-colors flex items-start justify-between gap-2 ${
                  selected === preset.id ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-ink-primary'
                }`}
              >
                <span className="flex flex-col">
                  <span className="font-medium">{t(preset.labelKey)}</span>
                  <span className="text-[11px] text-ink-muted leading-snug">{t(preset.taglineKey)}</span>
                </span>
                {selected === preset.id && <Check className="w-4 h-4 shrink-0 mt-0.5" />}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ElementRow({
  title, options, selectedOption, color, onSelectOption, onSelectColor, locked
}: {
  title: string;
  options: ElementOption[];
  selectedOption?: string;
  color?: string;
  onSelectOption: (v: string) => void;
  onSelectColor: (v: string | undefined) => void;
  locked?: boolean;
}) {
  const t = useT();
  return (
    <div className={`space-y-1.5 ${locked ? 'opacity-40 pointer-events-none' : ''}`}>
      <div className="text-[11px] lg:text-[13px] font-medium text-ink-primary px-1 truncate">{title}</div>
      <div className="flex items-center gap-1.5">
        <SingleDropdown
          placeholder={t('hv.sb.elem.matStyle')}
          options={options}
          value={selectedOption}
          onChange={onSelectOption}
          flex
          locked={locked}
        />
        <ColorButton
          value={color}
          onChange={onSelectColor}
        />
      </div>
    </div>
  );
}

function SingleDropdown({
  title, placeholder, options, value, onChange, flex, locked
}: {
  title?: string;
  placeholder: string;
  options: ElementOption[];
  value?: string;
  onChange: (v: string) => void;
  flex?: boolean;
  locked?: boolean;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const sel = options.find((o) => o.id === value);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className={flex ? 'flex-1 relative' : 'relative'}>
      {title && <div className="text-[11px] lg:text-[13px] font-medium text-ink-primary px-1 mb-1 lg:mb-1.5">{title}</div>}
      <button
        type="button"
        onClick={() => !locked && setOpen(!open)}
        disabled={locked}
        className={`w-full h-9 lg:h-10 px-2 lg:px-3 rounded-input border text-left text-[12px] lg:text-[13px] transition-colors flex items-center justify-between gap-1.5 ${
          locked ? 'opacity-40 cursor-not-allowed bg-surface-card border-outline' :
          value
            ? 'bg-brand-primary/5 border-brand-primary text-ink-primary'
            : 'bg-surface-card border-outline text-ink-secondary hover:bg-surface-muted'
        }`}
      >
        <span className="truncate">{sel ? t(sel.labelKey) : placeholder}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-11 z-30 bg-surface-card border border-outline rounded-card shadow-modal overflow-hidden max-h-72 overflow-y-auto">
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className="w-full text-left px-3 py-2 text-[12px] text-ink-muted hover:bg-surface-muted border-b border-outline"
          >
            {placeholder}
          </button>
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => { onChange(o.id); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-[13px] hover:bg-surface-muted transition-colors flex items-center justify-between ${
                value === o.id ? 'bg-brand-primary/10 text-brand-primary font-medium' : 'text-ink-primary'
              }`}
            >
              <span>{t(o.labelKey)}</span>
              {value === o.id && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorButton({ value, onChange }: {
  value?: string;
  onChange: (v: string | undefined) => void;
}) {
  const t = useT();
  return (
    <div className="relative">
      <input
        type="color"
        value={value || '#888888'}
        onChange={(e) => onChange(e.target.value)}
        className={`w-10 h-10 rounded-input border cursor-pointer p-0 ${
          value ? 'border-brand-primary' : 'border-outline'
        }`}
        aria-label={t('hv.sb.color')}
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange(undefined)}
          className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-surface-card border border-outline rounded-full flex items-center justify-center text-ink-muted hover:text-ink-primary hover:border-ink-primary"
          aria-label={t('hv.sb.clearColor')}
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
    </div>
  );
}

function MultiCheckDropdown({
  placeholder, options, selected, onChange, locked
}: {
  placeholder: string;
  options: ElementOption[];
  selected: string[];
  onChange: (ids: string[]) => void;
  locked?: boolean;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  const toggle = (id: string) => {
    if (selected.includes(id)) onChange(selected.filter((x) => x !== id));
    else onChange([...selected, id]);
  };
  const summary = selected.length === 0
    ? placeholder
    : selected.length === 1
      ? (options.find((o) => o.id === selected[0]) ? t(options.find((o) => o.id === selected[0])!.labelKey) : t('hv.sb.selected.one'))
      : t('hv.sb.selected.many', { n: selected.length });

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => !locked && setOpen(!open)}
        disabled={locked}
        className={`w-full h-9 lg:h-10 px-2 lg:px-3 rounded-input border text-left text-[12px] lg:text-[13px] transition-colors flex items-center justify-between gap-1.5 ${
          locked ? 'opacity-40 cursor-not-allowed bg-surface-card border-outline' :
          selected.length
            ? 'bg-brand-primary/5 border-brand-primary text-ink-primary'
            : 'bg-surface-card border-outline text-ink-secondary hover:bg-surface-muted'
        }`}
      >
        <span className="truncate">{summary}</span>
        <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-11 z-30 bg-surface-card border border-outline rounded-card shadow-modal overflow-hidden max-h-72 overflow-y-auto">
          {options.map((o) => {
            const checked = selected.includes(o.id);
            return (
              <button
                key={o.id}
                type="button"
                onClick={() => toggle(o.id)}
                className="w-full text-left px-3 py-2 text-[13px] text-ink-primary hover:bg-surface-muted transition-colors flex items-center gap-2"
              >
                <span className={`w-4 h-4 shrink-0 rounded border flex items-center justify-center ${
                  checked
                    ? 'bg-brand-primary border-brand-primary text-white'
                    : 'bg-surface-card border-outline'
                }`}>
                  {checked && <Check className="w-3 h-3" />}
                </span>
                <span>{t(o.labelKey)}</span>
              </button>
            );
          })}
          {selected.length > 0 && (
            <button
              type="button"
              onClick={() => onChange([])}
              className="w-full text-left px-3 py-2 text-[12px] text-ink-muted hover:bg-surface-muted border-t border-outline"
            >
              {t('hv.sb.clearAll')}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
