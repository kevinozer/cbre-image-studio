import type { LanguageCode } from '@/state/AppContext';

type Entry = Record<LanguageCode, string>;

/**
 * Překlady pro CBRE Image Studio.
 */
export const translations: Record<string, Entry> = {
  // ===== Common =====
  'common.back': { cs: 'Zpět', en: 'Back', sk: 'Späť' },
  'common.enterApp': { cs: 'Otevřít aplikaci →', en: 'Enter Application →', sk: 'Otvoriť aplikáciu →' },
  'common.toggleDark': { cs: 'Přepnout tmavý režim', en: 'Toggle dark mode', sk: 'Prepnúť tmavý režim' },
  'common.language': { cs: 'Jazyk', en: 'Language', sk: 'Jazyk' },

  // ===== App identity =====
  'app.title':   { cs: 'Image Studio', en: 'Image Studio', sk: 'Image Studio' },
  'app.tagline': {
    cs: 'AI generátor obrázků se smart promptem — stačí pár slov.',
    en: 'AI image generator with a smart prompt — a few words is enough.',
    sk: 'AI generátor obrázkov so smart promptom — stačí pár slov.',
  },

  // ===== Welcome =====
  'welcome.overview.title': { cs: 'O aplikaci', en: 'Overview', sk: 'O aplikácii' },
  'welcome.overview.body': {
    cs: 'Napíšeš pár slov, AI z toho udělá profesionální prompt a vygeneruje obrázek. Volitelně přidáš referenční fotku (AI ji upraví podle tvého popisu) nebo zakreslíš část obrázku, kterou chceš změnit (např. zakroužkuješ kolo a napíšeš "odeber"). Pak stáhneš, přidáš text nebo CBRE logo a iteruješ dál.',
    en: 'Type a few words, AI turns them into a professional prompt and generates an image. Optionally attach a reference photo (AI edits it per your description) or paint a mask over the area you want to change (e.g. circle a wheel and write "remove"). Then download, add text or CBRE logo, and iterate further.',
    sk: 'Napíš pár slov, AI z nich urobí profesionálny prompt a vygeneruje obrázok. Voliteľne pridáš referenčnú fotku alebo zakreslíš oblasť, ktorú chceš zmeniť. Potom stiahni, pridaj text alebo CBRE logo a iteruj.',
  },

  'welcome.howto.title':       { cs: 'Jak to použít', en: 'How to use', sk: 'Ako to použiť' },
  'welcome.howto.step1.title': { cs: 'Napiš nápad', en: 'Type your idea', sk: 'Napíš nápad' },
  'welcome.howto.step1.body':  {
    cs: 'Pár slov stačí — "kočka v autě", "moderní kancelář v Praze". AI prompt rozšíří o světlo, kompozici, styl.',
    en: 'A few words are enough — "cat in a car", "modern Prague office". AI expands the prompt with lighting, composition, style.',
    sk: 'Pár slov stačí. AI prompt rozšíri.',
  },
  'welcome.howto.step2.title': { cs: 'Volitelně: fotka + maska', en: 'Optionally: photo + mask', sk: 'Voliteľne: fotka + maska' },
  'welcome.howto.step2.body':  {
    cs: 'Přidej fotku jako referenci (AI ji upraví podle tvého popisu). Štetcem můžeš označit jen určitou oblast — AI ji upraví, zbytek nechá netknutý.',
    en: 'Attach a photo as a reference (AI edits it to your description). With a brush you can mark a specific area — AI edits only that, leaving the rest untouched.',
    sk: 'Pridaj fotku ako referenciu, štetcom označ oblasť.',
  },
  'welcome.howto.step3.title': { cs: 'Vygeneruj', en: 'Generate', sk: 'Vygeneruj' },
  'welcome.howto.step3.body':  {
    cs: 'Vyber model (Gemini 3 Pro Image / Imagen 4 / 2.5 Flash) a klikni Generovat. Trvá ~10-30 sekund.',
    en: 'Pick a model (Gemini 3 Pro Image / Imagen 4 / 2.5 Flash) and click Generate. Takes ~10-30 seconds.',
    sk: 'Vyber model a klikni Generovať.',
  },
  'welcome.howto.step4.title': { cs: 'Stáhni nebo pokračuj', en: 'Download or iterate', sk: 'Stiahni alebo pokračuj' },
  'welcome.howto.step4.body':  {
    cs: 'Stáhni PNG, přidej text nebo CBRE logo do rohu, nebo klikni "Iterate" a pokračuj v úpravách výsledku jako nového vstupu.',
    en: 'Download PNG, add text or CBRE logo in the corner, or click "Iterate" to keep editing the result as a new input.',
    sk: 'Stiahni PNG, pridaj text alebo CBRE logo, alebo iteruj.',
  },

  'welcome.tips.title': { cs: 'Tipy pro nejlepší výsledky', en: 'Tips for best results', sk: 'Tipy' },
  'welcome.tips.t1': {
    cs: 'Stačí 3-10 slov. AI sama doplní lighting, composition, depth of field. Příliš dlouhý prompt naopak může výsledek zhoršit.',
    en: 'Just 3-10 words is enough. AI fills in lighting, composition, depth of field. An overly long prompt can actually hurt the result.',
    sk: 'Stačí 3-10 slov.',
  },
  'welcome.tips.t2': {
    cs: 'U masky kresli štetcem hrubě přes celou oblast. AI vyžaduje plnou plochu (ne jen obrys).',
    en: 'When masking, paint thickly over the whole area with a brush. AI needs full fill (not just an outline).',
    sk: 'Maskuj plnou plochou.',
  },
  'welcome.tips.t3': {
    cs: 'Pro stylizované výstupy (anime, oil painting) napiš styl explicitně v promptu. Default je fotorealistický.',
    en: 'For stylized output (anime, oil painting) explicitly mention the style. Default is photorealistic.',
    sk: 'Pre štylizované výstupy uveď štýl.',
  },
  'welcome.tips.t4': {
    cs: 'Pro CBRE materiály zaškrtni "Add CBRE logo" — automaticky se přidá bílé logo do pravého spodního rohu.',
    en: 'For CBRE materials check "Add CBRE logo" — white logo is automatically added to the bottom-right corner.',
    sk: 'Pre CBRE materiály zaškrtni "Add CBRE logo".',
  },

  'welcome.example.title': { cs: 'Příklad', en: 'Example', sk: 'Príklad' },
  'welcome.example.input.label':  { cs: 'VSTUP', en: 'INPUT', sk: 'VSTUP' },
  'welcome.example.input.body':   {
    cs: '"moderní kancelář, ranní světlo" + fotka prázdné místnosti.',
    en: '"modern office, morning light" + photo of an empty room.',
    sk: '"moderná kancelária" + fotka prázdnej miestnosti.',
  },
  'welcome.example.output.label': { cs: 'VÝSTUP', en: 'OUTPUT', sk: 'VÝSTUP' },
  'welcome.example.output.body':  {
    cs: 'Fotorealistický záběr stejné místnosti, ranní slunce přes okno, designový nábytek, hloubka pole, premium magazínový look.',
    en: 'Photorealistic shot of the same room with morning sun through the window, designer furniture, depth of field, premium magazine look.',
    sk: 'Fotorealistický záber tej istej miestnosti.',
  },

  'welcome.preview.label': { cs: 'NÁHLED · KLIKNĚTE PRO ZVĚTŠENÍ', en: 'PREVIEW · CLICK TO ENLARGE', sk: 'NÁHĽAD · KLIKNI PRE ZVÄČŠENIE' },
  'welcome.preview.aria':  { cs: 'Otevřít náhled', en: 'Open preview', sk: 'Otvoriť náhľad' },
  'welcome.preview.alt':   { cs: 'Příklad výstupu Image Studio', en: 'Image Studio output example', sk: 'Príklad výstupu' },

  // ===== App page =====
  'app.section.prompt': { cs: 'Tvůj nápad', en: 'Your idea', sk: 'Tvoj nápad' },
  'app.prompt.placeholder': {
    cs: 'Např. "kočka v autě", "moderní kancelář v Praze", "přidej ferrari do pole"',
    en: 'e.g. "cat in a car", "modern office in Prague", "add a Ferrari to the field"',
    sk: 'Napr. "mačka v aute"',
  },
  'app.prompt.autoEnhanceHint': {
    cs: 'Stačí pár slov — prompt se před generováním automaticky vylepší v pozadí přes Gemini 3 Pro.',
    en: 'A few words is enough — the prompt is automatically enhanced in the background via Gemini 3 Pro before generation.',
    sk: 'Stačí pár slov — prompt sa pred generovaním automaticky vylepší cez Gemini 3 Pro.',
  },
  'app.stage.enhancing': { cs: 'Vylepšuji prompt…', en: 'Enhancing prompt…', sk: 'Vylepšujem prompt…' },
  'app.imagen.refWarning': {
    cs: 'Imagen 4 generuje pouze z textu — referenční fotka a maska budou ignorovány. Pro práci s referencí přepni model na Gemini 3 Pro Image.',
    en: 'Imagen 4 generates from text only — reference image and mask will be ignored. Switch to Gemini 3 Pro Image to use the reference.',
    sk: 'Imagen 4 generuje len z textu — referencia a maska budú ignorované. Prepni na Gemini 3 Pro Image.',
  },
  'app.section.reference': { cs: 'Referenční fotka (volitelné)', en: 'Reference photo (optional)', sk: 'Referenčná fotka' },
  'app.reference.drop': { cs: 'Sem přetáhni fotku nebo klikni pro výběr', en: 'Drop a photo here or click to select', sk: 'Sem pretiahni fotku' },
  'app.reference.replace': { cs: 'Vyměnit fotku', en: 'Replace photo', sk: 'Vymeniť fotku' },
  'app.reference.remove': { cs: 'Odebrat fotku', en: 'Remove photo', sk: 'Odstrániť fotku' },
  'app.section.mask': { cs: 'Maskování (volitelné)', en: 'Mask drawing (optional)', sk: 'Maskovanie' },
  'app.mask.hint': {
    cs: 'Štetcem označ oblast, kterou chceš změnit. Vše mimo masky zůstane netknuté.',
    en: 'Brush the area you want to change. Everything outside the mask stays untouched.',
    sk: 'Štetcom označ oblasť.',
  },
  'app.mask.brush': { cs: 'Velikost štětce', en: 'Brush size', sk: 'Veľkosť štetca' },
  'app.mask.undo': { cs: 'Zpět', en: 'Undo', sk: 'Späť' },
  'app.mask.clear': { cs: 'Smazat masku', en: 'Clear mask', sk: 'Vymazať masku' },

  'app.section.options': { cs: 'Nastavení', en: 'Settings', sk: 'Nastavenia' },
  'app.model.label': { cs: 'Model', en: 'Model', sk: 'Model' },
  'app.model.gemini3pro': { cs: 'Gemini 3 Pro Image (nejlepší kvalita)', en: 'Gemini 3 Pro Image (best quality)', sk: 'Gemini 3 Pro Image' },
  'app.model.gemini31flash': { cs: 'Gemini 3.1 Flash Image (rychlejší)', en: 'Gemini 3.1 Flash Image (faster)', sk: 'Gemini 3.1 Flash Image' },
  'app.model.gemini25flash': { cs: 'Gemini 2.5 Flash Image (nejrychlejší)', en: 'Gemini 2.5 Flash Image (fastest)', sk: 'Gemini 2.5 Flash Image' },
  'app.model.imagen4': { cs: 'Imagen 4 (čistý text → obrázek)', en: 'Imagen 4 (pure text → image)', sk: 'Imagen 4' },
  'app.aspect.label': { cs: 'Poměr stran', en: 'Aspect ratio', sk: 'Pomer strán' },
  'app.cbreLogo.label': { cs: 'Přidat CBRE logo do rohu', en: 'Add CBRE logo to corner', sk: 'Pridať CBRE logo' },
  'app.cbreLogo.position': { cs: 'Pozice loga', en: 'Logo position', sk: 'Pozícia loga' },
  'app.cbreLogo.pos.br': { cs: 'Vpravo dole', en: 'Bottom right', sk: 'Vpravo dole' },
  'app.cbreLogo.pos.bl': { cs: 'Vlevo dole', en: 'Bottom left', sk: 'Vľavo dole' },
  'app.cbreLogo.pos.tr': { cs: 'Vpravo nahoře', en: 'Top right', sk: 'Vpravo hore' },
  'app.cbreLogo.pos.tl': { cs: 'Vlevo nahoře', en: 'Top left', sk: 'Vľavo hore' },

  'app.generate': { cs: 'Generovat', en: 'Generate', sk: 'Generovať' },
  'app.generating': { cs: 'Generuji…', en: 'Generating…', sk: 'Generujem…' },
  'app.result.title': { cs: 'Výsledek', en: 'Result', sk: 'Výsledok' },
  'app.result.download': { cs: 'Stáhnout PNG', en: 'Download PNG', sk: 'Stiahnuť PNG' },
  'app.result.addText': { cs: 'Přidat text', en: 'Add text', sk: 'Pridať text' },
  'app.result.iterate': { cs: 'Iterate (pokračovat)', en: 'Iterate (continue)', sk: 'Iterate' },
  'app.result.new': { cs: 'Nový pokus', en: 'New attempt', sk: 'Nový pokus' },

  'app.text.heading': { cs: 'Přidat text na obrázek', en: 'Add text to image', sk: 'Pridať text' },
  'app.text.placeholder': { cs: 'Tvůj text', en: 'Your text', sk: 'Tvoj text' },
  'app.text.font': { cs: 'Font', en: 'Font', sk: 'Font' },
  'app.text.size': { cs: 'Velikost', en: 'Size', sk: 'Veľkosť' },
  'app.text.color': { cs: 'Barva', en: 'Color', sk: 'Farba' },
  'app.text.position': { cs: 'Pozice', en: 'Position', sk: 'Pozícia' },
  'app.text.apply': { cs: 'Aplikovat', en: 'Apply', sk: 'Aplikovať' },
  'app.text.cancel': { cs: 'Zrušit', en: 'Cancel', sk: 'Zrušiť' },

  'app.error.generic': { cs: 'Něco se pokazilo. Zkus to prosím znovu.', en: 'Something went wrong. Please try again.', sk: 'Niečo sa pokazilo.' },
  'app.error.network': { cs: 'Chyba sítě nebo timeout. Zkus to prosím znovu.', en: 'Network error or timeout. Please try again.', sk: 'Chyba siete.' },
};

export type TranslationKey = keyof typeof translations;
