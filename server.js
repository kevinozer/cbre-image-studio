// Backend pro Image Studio.
// Endpointy:
//   GET  /api/health
//   POST /api/enhance-prompt — krátký user input → bohatší prompt (Gemini 3 Pro text)
//   POST /api/generate — tři režimy:
//     • mode='text'      — čistý text-to-image (Imagen-4 / Gemini Image)
//     • mode='edit'      — image + prompt → editovaná verze (Gemini Image)
//     • mode='edit-mask' — image + mask + prompt → cílená edit jen v masce
//
// API klíč je v env varu GEMINI_API_KEY (nikdy se neposílá do prohlížeče).

import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { generate, MODELS } from './lib/aiProvider.js';
import { enhancePrompt } from './lib/promptEnhancer.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT || 8080);
const app = express();
app.use(express.json({ limit: '30mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    app: 'cbre-image-studio',
    models: {
      text: MODELS.text,
      imageEdit: MODELS.imageEdit,
      imageGen: MODELS.imageGen,
    },
  });
});

// 1) Enhance prompt — vezme krátký nápad a vrátí detailní AI-friendly prompt.
app.post('/api/enhance-prompt', async (req, res) => {
  try {
    const { userPrompt, hasReferenceImage = false, hasMask = false } = req.body || {};
    if (!userPrompt || typeof userPrompt !== 'string' || userPrompt.trim().length === 0) {
      return res.status(400).json({ error: 'userPrompt is required (min 1 char).' });
    }
    const t0 = Date.now();
    const enhanced = await enhancePrompt({
      userPrompt: userPrompt.trim(),
      hasReferenceImage,
      hasMask,
    });
    res.json({ enhanced, elapsedMs: Date.now() - t0 });
  } catch (err) {
    console.error('[POST /api/enhance-prompt]', err);
    res.status(500).json({ error: err?.message || 'Prompt enhancement failed.' });
  }
});

// 2) Generate — image generation / editing.
app.post('/api/generate', async (req, res) => {
  try {
    const {
      mode = 'text',
      prompt,
      imageBase64,
      mimeType,
      maskBase64,
      maskMimeType,
      model,        // explicit override (volitelné)
      aspectRatio = '1:1',
    } = req.body || {};

    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'prompt is required.' });
    }

    const t0 = Date.now();
    let result;
    let modelUsed;

    if (mode === 'text') {
      // Text-to-image. Default Imagen-4 (lepší stylizace), volitelně Gemini Image.
      modelUsed = model || MODELS.imageGen;
      if (modelUsed.startsWith('imagen-')) {
        result = await generate({
          kind: 'image',
          input: { prompt },
          options: { model: modelUsed, aspectRatio, numberOfImages: 1 },
        });
        const img = result.images?.[0];
        if (!img) throw new Error('No image returned.');
        return res.json({
          imageBase64: img.base64,
          mimeType: img.mimeType || 'image/png',
          modelUsed,
          elapsedMs: Date.now() - t0,
        });
      }
      // Gemini Image text-to-image — modely 3 Pro Image / 3.1 Flash Image / 2.5 Flash Image
      // zvládají i čistý text→image (multimodal generateContent s text-only part).
      result = await generate({
        kind: 'image-edit', // používá generateContent — zvládá i text-only prompt
        input: {
          prompt,
          // bez imageBase64 / mimeType — aiProvider.image-edit case to akceptuje?
        },
        options: { model: modelUsed },
      });
    } else if (mode === 'edit') {
      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: 'imageBase64 + mimeType required for edit mode.' });
      }
      modelUsed = model || MODELS.imageEdit;
      result = await generate({
        kind: 'image-edit',
        input: { prompt, imageBase64, mimeType },
        options: { model: modelUsed },
      });
    } else if (mode === 'edit-mask') {
      if (!imageBase64 || !mimeType) {
        return res.status(400).json({ error: 'imageBase64 + mimeType required for edit-mask mode.' });
      }
      if (!maskBase64 || !maskMimeType) {
        return res.status(400).json({ error: 'maskBase64 + maskMimeType required for edit-mask mode.' });
      }
      modelUsed = model || MODELS.imageEdit;
      const maskedPrompt = `${prompt}\n\nMASK INSTRUCTION: A binary image mask is attached as the second image. White pixels in the mask = region to edit; black pixels = preserve identically. Apply the requested change ONLY to the white-mask region. Outside of the mask, keep every pixel of the original image untouched.`;
      result = await generate({
        kind: 'image-edit',
        input: {
          prompt: maskedPrompt,
          imageBase64,
          mimeType,
          additionalImages: [{ base64: maskBase64, mimeType: maskMimeType }],
        },
        options: { model: modelUsed },
      });
    } else {
      return res.status(400).json({ error: `Unknown mode: ${mode}` });
    }

    const img = result.images?.[0];
    if (!img) {
      return res.status(502).json({ error: 'Model did not return an image.', text: result.text });
    }
    res.json({
      imageBase64: img.base64,
      mimeType: img.mimeType || 'image/png',
      modelUsed,
      elapsedMs: Date.now() - t0,
    });
  } catch (err) {
    console.error('[POST /api/generate]', err);
    res.status(500).json({ error: err?.message || 'Generation failed.' });
  }
});

// Static frontend
const distDir = path.join(__dirname, 'dist');
app.use(express.static(distDir, { maxAge: '1y', index: false }));
app.get('*', (_req, res) => res.sendFile(path.join(distDir, 'index.html')));

// Startup key check
const __keyCheck = process.env.GEMINI_API_KEY;
if (!__keyCheck) {
  console.error('[server] !!! GEMINI_API_KEY chybi - server nebude moct volat AI. Doplň ho do .env.local a restartuj !!!');
} else if (__keyCheck.startsWith('PASTE_') || __keyCheck === 'undefined') {
  console.error('[server] !!! GEMINI_API_KEY je placeholder !!! Doplň skutečný klíč.');
} else {
  console.log('[server] GEMINI_API_KEY OK (' + __keyCheck.slice(0, 8) + '...' + __keyCheck.slice(-4) + ')');
}

app.listen(PORT, () => {
  console.log(`[server] cbre-image-studio :${PORT}`);
  console.log(`         text=${MODELS.text} imageEdit=${MODELS.imageEdit} imageGen=${MODELS.imageGen}`);
});
