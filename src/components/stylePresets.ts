import {
  Building2, Trees, Sun, Mountain, Factory, Landmark,
  Wheat, Leaf, Sparkles
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// labelKey/taglineKey jsou i18n klíče. Hodnota label/tagline zůstává jako fallback (EN).
export interface StylePreset {
  id: string;
  label: string;
  labelKey: string;
  tagline: string;
  taglineKey: string;
  icon: LucideIcon;
  accent: string;
}

// 9 stylových presetů (původní Beach Cottage smazán — duplicita s Mediterranean Villa).
export const STYLE_PRESETS: StylePreset[] = [
  { id: 'modern-minimal',       labelKey: 'hv.preset.modernMinimal.label',     taglineKey: 'hv.preset.modernMinimal.tagline',     label: 'Modern Minimal',      tagline: 'White render, dark roof, slim frames.',           icon: Building2, accent: 'bg-slate-700' },
  { id: 'scandinavian',         labelKey: 'hv.preset.scandinavian.label',      taglineKey: 'hv.preset.scandinavian.tagline',      label: 'Scandinavian',        tagline: 'Black timber cladding, dark metal roof.',         icon: Trees,     accent: 'bg-zinc-800' },
  { id: 'mediterranean',        labelKey: 'hv.preset.mediterranean.label',     taglineKey: 'hv.preset.mediterranean.tagline',     label: 'Mediterranean Villa', tagline: 'Cream plaster, terracotta tile, cypress trees.', icon: Sun,       accent: 'bg-amber-600' },
  { id: 'mountain-cabin',       labelKey: 'hv.preset.mountainCabin.label',     taglineKey: 'hv.preset.mountainCabin.tagline',     label: 'Mountain Cabin',      tagline: 'Stained timber logs, slate roof, pines.',         icon: Mountain,  accent: 'bg-emerald-800' },
  { id: 'industrial-loft',      labelKey: 'hv.preset.industrialLoft.label',    taglineKey: 'hv.preset.industrialLoft.tagline',    label: 'Industrial Brick',    tagline: 'Exposed red brick, zinc roof, black steel.',      icon: Factory,   accent: 'bg-stone-700' },
  { id: 'heritage-restoration', labelKey: 'hv.preset.heritage.label',          taglineKey: 'hv.preset.heritage.tagline',          label: 'Restored Historic',   tagline: 'Period plaster, ceramic tile, wooden frames.',    icon: Landmark,  accent: 'bg-rose-700' },
  { id: 'farmhouse',            labelKey: 'hv.preset.farmhouse.label',         taglineKey: 'hv.preset.farmhouse.tagline',         label: 'Country House',       tagline: 'White lime wash, red tile, fruit trees.',         icon: Wheat,     accent: 'bg-yellow-700' },
  { id: 'japandi',              labelKey: 'hv.preset.japandi.label',           taglineKey: 'hv.preset.japandi.tagline',           label: 'Japanese',            tagline: 'Charred wood, off-white plaster, gravel garden.', icon: Leaf,      accent: 'bg-neutral-800' },
  { id: 'neat-refresh',         labelKey: 'hv.preset.neatRefresh.label',       taglineKey: 'hv.preset.neatRefresh.tagline',       label: 'Subtle Refresh',      tagline: 'Same character, freshly painted and tidied up.',  icon: Sparkles,  accent: 'bg-homeVision-teal' }
];

export interface ElementOption { id: string; label: string; labelKey: string; }

// Fasáda — zredukováno na 5 čitelných variant (vertikální dřevo smazáno, horizontální dřevo přejmenováno na Srub, vláknocement smazán).
export const FACADE_TYPES: ElementOption[] = [
  { id: 'modern-plaster',    labelKey: 'hv.facade.modernPlaster',  label: 'Plaster' },
  { id: 'stone',             labelKey: 'hv.facade.stone',          label: 'Stone cladding' },
  { id: 'brick',             labelKey: 'hv.facade.brick',          label: 'Red brick' },
  { id: 'log-cabin',         labelKey: 'hv.facade.logCabin',       label: 'Log cabin' },
  { id: 'concrete',          labelKey: 'hv.facade.concrete',       label: 'Architectural concrete' }
];

// Střecha — 5 možností (Kovová taška matná černá smazána).
export const ROOF_TYPES: ElementOption[] = [
  { id: 'ceramic-tile-red',        labelKey: 'hv.roof.ceramicRed',       label: 'Red ceramic tile' },
  { id: 'ceramic-tile-anthracite', labelKey: 'hv.roof.ceramicAnthracite',label: 'Anthracite ceramic tile' },
  { id: 'metal-standing-seam',     labelKey: 'hv.roof.metalSeam',        label: 'Standing-seam metal (dark grey)' },
  { id: 'slate',                   labelKey: 'hv.roof.slate',            label: 'Natural slate' },
  { id: 'shingles-asphalt',        labelKey: 'hv.roof.shingles',         label: 'Asphalt shingles (dark grey)' }
];

// Okna/dveře — 10 variant (původních 6 + 4 nové: bronz, hliník, tmavě šedá, měď).
export const WINDOW_DOOR_STYLES: ElementOption[] = [
  { id: 'white',           labelKey: 'hv.win.white',         label: 'White frames' },
  { id: 'anthracite',      labelKey: 'hv.win.anthracite',    label: 'Anthracite frames' },
  { id: 'black',           labelKey: 'hv.win.black',         label: 'Matte black frames' },
  { id: 'dark-grey',       labelKey: 'hv.win.darkGrey',      label: 'Dark grey frames' },
  { id: 'natural-wood',    labelKey: 'hv.win.naturalWood',   label: 'Natural oak wood' },
  { id: 'dark-wood',       labelKey: 'hv.win.darkWood',      label: 'Dark walnut wood' },
  { id: 'olive-green',     labelKey: 'hv.win.oliveGreen',    label: 'Olive green frames' },
  { id: 'bronze',          labelKey: 'hv.win.bronze',        label: 'Bronze frames' },
  { id: 'silver-aluminum', labelKey: 'hv.win.silverAlu',     label: 'Silver aluminum frames' },
  { id: 'copper',          labelKey: 'hv.win.copper',        label: 'Copper frames' }
];

export const SEASONS: ElementOption[] = [
  { id: 'spring',  labelKey: 'hv.season.spring',  label: 'Spring' },
  { id: 'summer',  labelKey: 'hv.season.summer',  label: 'Summer' },
  { id: 'autumn',  labelKey: 'hv.season.autumn',  label: 'Autumn' },
  { id: 'winter',  labelKey: 'hv.season.winter',  label: 'Winter' }
];

// Světlo — 7 variant (opravený bug id="spring" → id="bright-midday", přidány 4 nové: sunrise, blue-hour, night-lit, dramatic).
export const LIGHT_OPTIONS: ElementOption[] = [
  { id: 'overcast',      labelKey: 'hv.light.overcast',    label: 'Overcast daylight' },
  { id: 'bright-midday', labelKey: 'hv.light.brightMid',   label: 'Bright midday' },
  { id: 'golden-hour',   labelKey: 'hv.light.goldenHour',  label: 'Golden hour (sunset)' },
  { id: 'sunrise',       labelKey: 'hv.light.sunrise',     label: 'Sunrise' },
  { id: 'blue-hour',     labelKey: 'hv.light.blueHour',    label: 'Blue hour (twilight)' },
  { id: 'night-lit',     labelKey: 'hv.light.nightLit',    label: 'Night with exterior lights' },
  { id: 'dramatic',      labelKey: 'hv.light.dramatic',    label: 'Dramatic light' }
];

// Okolí — kompletní refactor podle Kevin specs.
// Zachované: farmhouse-yard. Smazané: lush-garden, gravel-modern, cottage-garden, urban-paved, minimal (rozděleno).
// Nové: short-lawn, concrete-paving (z minimal rozdělené), flower-garden (z lush), gravel (zjednodušený), swimming-pool, medium-lawn.
export const SURROUNDINGS: ElementOption[] = [
  { id: 'short-lawn',       labelKey: 'hv.surr.shortLawn',       label: 'Short lawn' },
  { id: 'medium-lawn',      labelKey: 'hv.surr.mediumLawn',      label: 'Medium-length lawn' },
  { id: 'concrete-paving',  labelKey: 'hv.surr.concretePaving',  label: 'Concrete paving' },
  { id: 'gravel',           labelKey: 'hv.surr.gravel',          label: 'Gravel' },
  { id: 'flower-garden',    labelKey: 'hv.surr.flowerGarden',    label: 'Flower garden' },
  { id: 'swimming-pool',    labelKey: 'hv.surr.swimmingPool',    label: 'Swimming pool' },
  { id: 'farmhouse-yard',   labelKey: 'hv.surr.farmhouse',       label: 'Farmhouse yard with fruit trees' }
];

export const OTHER_ACTIONS: ElementOption[] = [
  { id: 'remove-scaffolding', labelKey: 'hv.fix.removeScaffold', label: 'Remove scaffolding & equipment' },
  { id: 'tidy-up',            labelKey: 'hv.fix.tidyUp',         label: 'Tidy up the surroundings' },
  { id: 'remove-defects',     labelKey: 'hv.fix.removeDefects',  label: 'Repair visible defects' },
  { id: 'add-plaster',        labelKey: 'hv.fix.addPlaster',     label: 'Plaster exposed walls' },
  { id: 'fix-roof',           labelKey: 'hv.fix.fixRoof',        label: 'Fix the roof' },
  { id: 'clean-facade',       labelKey: 'hv.fix.cleanFacade',    label: 'Deep-clean the facade' }
];

export const CAMERA_ANGLES: ElementOption[] = [
  { id: 'front',                labelKey: 'hv.cam.front',     label: 'Front view' },
  { id: 'three-quarter-left',   labelKey: 'hv.cam.34left',    label: '3/4 left' },
  { id: 'three-quarter-right',  labelKey: 'hv.cam.34right',   label: '3/4 right' },
  { id: 'side',                 labelKey: 'hv.cam.side',      label: 'Side view' },
  { id: 'back',                 labelKey: 'hv.cam.back',      label: 'Back view' },
  { id: 'aerial-30',            labelKey: 'hv.cam.aerial30',  label: 'Aerial 30°' },
  { id: 'eye-level-close',      labelKey: 'hv.cam.eyeLevel',  label: 'Eye-level close' }
];
