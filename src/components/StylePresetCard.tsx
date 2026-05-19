import type { StylePreset } from './stylePresets';

interface Props {
  preset: StylePreset;
  active: boolean;
  onClick: () => void;
}

// Karta jednoho stylového presetu. Aktivní = teal border + světlejší pozadí.
// Při klidu je to bílá karta s ikonkou v barvě presetu.
export function StylePresetCard({ preset, active, onClick }: Props) {
  const Icon = preset.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-start gap-3 text-left p-3 rounded-card border transition-all ${
        active
          ? 'bg-homeVision-teal/10 border-homeVision-teal shadow-card'
          : 'bg-surface-card border-outline hover:border-homeVision-teal/60 hover:shadow-card'
      }`}
    >
      <span
        className={`shrink-0 w-10 h-10 rounded-card flex items-center justify-center text-white ${preset.accent}`}
        aria-hidden
      >
        <Icon className="w-5 h-5" />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[14px] font-semibold text-ink-primary leading-tight">
          {preset.label}
        </span>
        <span className="block text-[12px] text-ink-muted mt-0.5 leading-snug">
          {preset.tagline}
        </span>
      </span>
    </button>
  );
}
