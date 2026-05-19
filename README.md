# CBRE Image Studio

AI generátor obrázků se smart promptem. Pár slov stačí — AI je rozšíří na profesionální prompt, vygeneruje obrázek (volitelně s referenční fotkou a maskou), přidá text nebo CBRE logo.

## Lokálně

```bash
npm install
npm run dev
```

Frontend na http://localhost:5173, backend na http://localhost:8080.

## Backend endpointy

- `GET  /api/health` — verze + používané modely
- `POST /api/enhance-prompt` — `{ userPrompt, hasReferenceImage?, hasMask? }` → `{ enhanced }` (Gemini 3 Pro text)
- `POST /api/generate` — image generation / editing:
  - `mode: 'text'` — text-to-image (default Imagen-4)
  - `mode: 'edit'` — image + prompt → editovaná verze (Gemini 3 Pro Image)
  - `mode: 'edit-mask'` — image + mask + prompt → cílená edit jen v masce

## Features

- ✨ **Smart prompt enhancement** — pár slov → bohatý prompt přes Gemini 3 Pro
- 🖼️ **Reference image** — drag-drop fotku, AI ji upraví podle popisu
- 🎨 **Mask drawing** — štetcem označ oblast, AI upraví jen ji
- 🔄 **Iterate** — výsledek se stane novým inputem pro další iteraci
- 📝 **Text overlay** — přidej text na obrázek (font, velikost, barva, pozice)
- 🏷️ **CBRE log