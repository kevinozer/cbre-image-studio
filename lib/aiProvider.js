/**
 * AI provider abstrakce - Gemini SDK wrapper.
 *
 * Sdílí se 1:1 napříč všemi CBRE Marketplace appkami.
 * Frontend nikdy nevolá AI providery přímo - vždy přes /api/* endpoint na backendu.
 * API klíč zůstává v Cloud Run env varu (GEMINI_API_KEY), browser ho nikdy nevidí.
 *
 * Modely:
 *   - Primary jsou Gemini 3 (nejnovější, nejvyšší kvalita)
 *   - Fallbacky jsou Gemini 2.5 GA (stabilní, použijí se automaticky pokud
 *     primary vrátí 503/429 i po 2 retry pokusech)
 *   - withRetryAndFallback: 2× primary (1s, 2s backoff) → 2× fallback (1s, 2s)
 */

import { GoogleGenAI } from '@google/genai';

const PROVIDER = process.env.AI_PROVIDER || 'gemini';

// Centrální model registry - latest k 2026-05.
export const MODELS = {
  // === Primary (Gemini 3 — nejnovější, nejvyšší kvalita) ===
  text: 'gemini-3.1-pro-preview',                   // top reasoning, 1M context
  textFast: 'gemini-2.5-flash',                   // GA, fast multimodal (3.x flash je preview, cheap volby ponechat na 2.5)
  textGrounded: 'gemini-2.5-flash',               // s Google Search grounding (grounding je o search, ne LLM)
  imageGen: 'imagen-4.0-generate-001',            // GA, photorealistic
  imageGenUltra: 'imagen-4.0-ultra-generate-001', // pro nejvyšší kvalitu (1 obrázek)
  imageEdit: 'gemini-3-pro-image-preview',        // Nano Banana Pro - studio quality, 2K/4K
  documentAnalyze: 'gemini-3.1-pro-preview',        // long context PDF analysis
  audioTranscribe: 'gemini-2.5-flash',            // GA, audio multimodal (commodity)
  video: 'veo-3.1-generate-preview',              // latest Veo

  // === Fallback (Gemini 2.5 GA — stabilní záchrana při 503/429) ===
  textFallback: 'gemini-2.5-pro',
  imageEditFallback: 'gemini-2.5-flash-image',    // Nano Banana 1 (reliable)
  documentAnalyzeFallback: 'gemini-2.5-pro',
};

export async function generate({ kind, input, options = {} }) {
  if (PROVIDER === 'gemini') {
    return generateWithGemini({ kind, input, options });
  }
  throw new Error(`Unknown AI provider: ${PROVIDER}`);
}

function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY env var not set on Cloud Run service.');
  }
  return new GoogleGenAI({ apiKey });
}

// Retry s automatickým fallbackem.
// 2x pokus na primary model (backoff 1s, 2s) → pokud transient error, přepne na fallback
// 2x pokus na fallback model (backoff 1s, 2s)
// Pokud fallback není nastavený, chová se jako klasický withRetry (3 pokusy na primary).
async function withRetryAndFallback(makeRequest, { primary, fallback, label = 'AI call' }) {
  const MAX_PRIMARY = 2;
  const MAX_FALLBACK = 2;
  let lastErr;

  // Primary pokusy
  for (let attempt = 1; attempt <= MAX_PRIMARY; attempt++) {
    try {
      return await makeRequest(primary);
    } catch (err) {
      lastErr = err;
      const msg = err?.message || '';
      const isTransient = /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|deadline/i.test(msg);
      if (!isTransient) throw err; // permanent error → fail fast
      if (attempt < MAX_PRIMARY) {
        const wait = 1000 * attempt;
        console.warn(`[${label}] primary ${primary} attempt ${attempt}/${MAX_PRIMARY} failed: ${msg.slice(0, 80)} — retry in ${wait}ms`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }

  // Fallback pokusy
  if (!fallback || fallback === primary) {
    console.error(`[${label}] primary ${primary} exhausted (${MAX_PRIMARY} attempts), no fallback configured`);
    throw lastErr;
  }
  console.warn(`[${label}] primary ${primary} exhausted → switching to fallback ${fallback}`);
  for (let attempt = 1; attempt <= MAX_FALLBACK; attempt++) {
    try {
      const result = await makeRequest(fallback);
      console.warn(`[${label}] fallback ${fallback} succeeded on attempt ${attempt}`);
      return result;
    } catch (err) {
      lastErr = err;
      const msg = err?.message || '';
      const isTransient = /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED|high demand|deadline/i.test(msg);
      if (!isTransient) throw err;
      if (attempt < MAX_FALLBACK) {
        const wait = 1000 * attempt;
        console.warn(`[${label}] fallback ${fallback} attempt ${attempt}/${MAX_FALLBACK} failed — retry in ${wait}ms`);
        await new Promise((r) => setTimeout(r, wait));
      }
    }
  }
  console.error(`[${label}] both primary and fallback exhausted`);
  throw lastErr;
}

async function generateWithGemini({ kind, input, options }) {
  const ai = getClient();

  switch (kind) {
    case 'text': {
      const resp = await withRetryAndFallback(
        (model) =>
          ai.models.generateContent({
            model,
            contents: input.prompt,
            config: {
              temperature: options.temperature ?? 0.7,
              maxOutputTokens: options.maxOutputTokens ?? 8192,
              systemInstruction: options.systemInstruction,
              thinkingConfig: options.thinkingConfig,
            },
          }),
        { primary: options.model || MODELS.text, fallback: MODELS.textFallback, label: 'text' }
      );
      return { text: resp.text };
    }

    case 'text-grounded': {
      const resp = await withRetryAndFallback(
        (model) =>
          ai.models.generateContent({
            model,
            contents: input.prompt,
            config: {
              temperature: options.temperature ?? 0.5,
              tools: [{ googleSearch: {} }],
              systemInstruction: options.systemInstruction,
              maxOutputTokens: options.maxOutputTokens ?? 8192,
            },
          }),
        { primary: options.model || MODELS.textGrounded, fallback: null, label: 'text-grounded' }
      );
      const grounding = resp.candidates?.[0]?.groundingMetadata;
      const sources =
        grounding?.groundingChunks
          ?.filter((c) => c.web)
          .map((c) => ({ title: c.web.title, uri: c.web.uri })) || [];
      return { text: resp.text, sources };
    }

    case 'image': {
      const resp = await withRetryAndFallback(
        (model) =>
          ai.models.generateImages({
            model,
            prompt: input.prompt,
            config: {
              numberOfImages: options.numberOfImages || 1,
              aspectRatio: options.aspectRatio || '1:1',
              personGeneration: options.personGeneration || 'allow_adult',
            },
          }),
        { primary: options.model || MODELS.imageGen, fallback: null, label: 'image' }
      );
      return {
        images: (resp.generatedImages || []).map((g) => ({
          base64: g.image.imageBytes,
          mimeType: 'image/png',
        })),
      };
    }

    case 'image-edit': {
      // Pokud chybí imageBase64, posíláme text-only request → Gemini Image udělá text→image.
      const parts = [];
      if (input.imageBase64 && input.mimeType) {
        parts.push({ inlineData: { mimeType: input.mimeType, data: input.imageBase64 } });
      }
      parts.push({ text: input.prompt });
      if (Array.isArray(input.additionalImages)) {
        for (const img of input.additionalImages) {
          parts.unshift({ inlineData: { mimeType: img.mimeType, data: img.base64 } });
        }
      }
      const resp = await withRetryAndFallback(
        (model) => ai.models.generateContent({ model, contents: parts }),
        { primary: options.model || MODELS.imageEdit, fallback: MODELS.imageEditFallback, label: 'image-edit' }
      );
      const images = [];
      let text = '';
      for (const part of resp.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData) {
          images.push({
            base64: part.inlineData.data,
            mimeType: part.inlineData.mimeType,
          });
        } else if (part.text) {
          text += part.text;
        }
      }
      return { images, text };
    }

    case 'document-analyze': {
      const fileData = input.fileBase64 ?? input.pdfBase64;
      const mime = input.mimeType || 'application/pdf';
      const resp = await withRetryAndFallback(
        (model) =>
          ai.models.generateContent({
            model,
            contents: [
              { inlineData: { mimeType: mime, data: fileData } },
              { text: input.prompt },
            ],
            config: {
              temperature: options.temperature ?? 0.2,
              maxOutputTokens: options.maxOutputTokens ?? 16384,
              responseMimeType: options.responseMimeType,
              responseSchema: options.responseSchema,
              systemInstruction: options.systemInstruction,
            },
          }),
        { primary: options.model || MODELS.documentAnalyze, fallback: MODELS.documentAnalyzeFallback, label: 'document-analyze' }
      );
      return { text: resp.text };
    }

    case 'audio-transcribe': {
      const resp = await withRetryAndFallback(
        (model) =>
          ai.models.generateContent({
            model,
            contents: [
              { inlineData: { mimeType: input.mimeType, data: input.audioBase64 } },
              { text: input.prompt || 'Transcribe this audio in full, then provide a concise summary.' },
            ],
            config: {
              temperature: options.temperature ?? 0.2,
              maxOutputTokens: options.maxOutputTokens ?? 8192,
              systemInstruction: options.systemInstruction,
            },
          }),
        { primary: options.model || MODELS.audioTranscribe, fallback: null, label: 'audio-transcribe' }
      );
      return { text: resp.text };
    }

    case 'video': {
      let operation = await withRetryAndFallback(
        (model) =>
          ai.models.generateVideos({
            model,
            prompt: input.prompt,
            config: {
              numberOfVideos: options.numberOfVideos || 1,
              aspectRatio: options.aspectRatio || '16:9',
              durationSeconds: options.durationSeconds || 6,
              personGeneration: options.personGeneration || 'allow_adult',
            },
          }),
        { primary: options.model || MODELS.video, fallback: null, label: 'video-start' }
      );
      const startedAt = Date.now();
      while (!operation.done) {
        if (Date.now() - startedAt > 5 * 60 * 1000) {
          throw new Error('Video generation timed out (5 min).');
        }
        await new Promise((r) => setTimeout(r, 5000));
        operation = await ai.operations.getVideosOperation({ operation });
      }
      const videos = operation.response?.generatedVideos || [];
      const downloaded = [];
      for (const v of videos) {
        const file = await ai.files.download({ file: v.video });
        downloaded.push({
          base64: Buffer.from(file).toString('base64'),
          mimeType: 'video/mp4',
        });
      }
      return { videos: downloaded };
    }

    default:
      throw new Error(`Unknown kind: ${kind}`);
  }
}
