// Vezme krátký user nápad ("kočka v autě") a vrátí detailní prompt pro AI image gen.
// Pro režim editace s referenční fotkou přidá instrukce o zachování kompozice.

import { GoogleGenAI } from '@google/genai';

const SYSTEM_INSTRUCTION = `You are a senior AI image-generation prompt engineer for premium commercial photography.

Your job: take the user's short rough idea (often 3-15 words, in any language) and expand it into a detailed, vivid prompt that produces a premium, photorealistic image.

Output rules:
- Output ONLY the final prompt as ONE single English paragraph. No preamble, no labels, no quotes, no markdown.
- LENGTH: 80-160 words. Be specific and concrete, not flowery.
- The first sentence must clearly state the SUBJECT and SCENE in plain language.
- Then layer in the following details (each in 1-2 short sentences, woven naturally into the paragraph):
  • Composition / framing (wide shot, close-up, low angle, rule of thirds…)
  • Lighting (soft natural window light, golden hour, dramatic side light…)
  • Camera/lens feel (shot on full-frame, 35mm lens, shallow depth of field, f/1.8…)
  • Color palette and mood (warm earth tones, cool blue, high contrast monochrome…)
  • Background / environment detail
  • Texture and material quality (matte, glossy, reflective surfaces…)
  • Final cinematic descriptor (editorial magazine quality, photojournalistic, premium architectural shot…)

Style defaults:
- Photorealistic editorial photography, premium documentary aesthetic.
- ONLY change style if the user explicitly asks for illustration / painting / cartoon / pixel-art / anime / sketch / watercolor / etc.

Faithfulness:
- KEEP the user's intended subjects intact. If they wrote "muž s kočkou v náručí", produce a man holding a cat — never invent different characters or change ethnicity / clothing unless they specified it.
- KEEP proper nouns (Ferrari, Prague, Karlův most, Eiffel Tower, etc.) exactly as written.
- If the user wrote in Czech / Slovak / other languages, translate the meaning to English faithfully — do not paraphrase or interpret loosely.

Safety:
- Never add identifiable real people's faces or recognizable celebrities.
- Never add brand logos or readable text in the image.

Output the prompt now.`;

const SYSTEM_INSTRUCTION_EDIT = `You are a professional Photoshop / AI image-editing prompt engineer.

The user has uploaded a reference image and wants to edit it. Your job: take their short rough idea ("add a Ferrari", "remove the sky", "make it sunset") and expand it into a detailed editing instruction that preserves what should stay and only modifies what should change.

Rules:
- Output ONLY the final editing instruction as a single English paragraph. No preamble, no explanations.
- 40-100 words. Imperative voice (e.g. "Add a red Ferrari...", "Replace the sky...").
- ALWAYS specify: WHAT to change, WHERE in the frame to place it (if adding), WHAT to preserve (mention "keep lighting, perspective, composition identical").
- Match the photo style of the reference (don't change documentary to painting unless user asks).
- For "remove X": instruct to inpaint with surrounding context.
- For "add X": describe the object with material, color, scale, position. Specify natural integration (shadows, lighting matching the scene).
- NEVER add identifiable real people's faces, brand logos, or readable text.
- Keep proper nouns intact.`;

const SYSTEM_INSTRUCTION_MASK = `You are a professional Photoshop / AI mask-based image-editing prompt engineer.

The user has uploaded a reference image and drawn a mask (selection) on a region they want to edit. Your job: take their short rough idea ("remove this", "replace with a tree") and expand it into a detailed masked-edit instruction.

Rules:
- Output ONLY the final instruction as a single English paragraph. No preamble.
- 30-80 words. Imperative voice.
- Always start by acknowledging the masked region: "Within the masked region, [action]..."
- ALWAYS instruct: "Outside the masked region, keep every pixel of the original image identical. Match lighting, shadows, perspective and color grading of the surrounding image when filling the masked area."
- For "remove" / "delete" / "odeber": inpaint with plausible surrounding context.
- For "replace" / "change": describe the new content with material, color, and scale matching the scene.
- Keep proper nouns intact.`;

export async function enhancePrompt({ userPrompt, hasReferenceImage = false, hasMask = false }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY env var not set on server.');
  const ai = new GoogleGenAI({ apiKey });

  let systemInstruction;
  if (hasMask) systemInstruction = SYSTEM_INSTRUCTION_MASK;
  else if (hasReferenceImage) systemInstruction = SYSTEM_INSTRUCTION_EDIT;
  else systemInstruction = SYSTEM_INSTRUCTION;

  const MAX_ATTEMPTS = 3;
  let lastErr;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      const resp = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `User idea: ${userPrompt}`,
        config: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          systemInstruction,
        },
      });
      const text = (resp.text || '').trim();
      // Pokud je výstup neuspokojivě krátký (model truncoval, language model odpověděl chybou…),
      // raději retry. 50 znaků je tvrdé minimum, ideál je 200-800.
      if (text.length < 50) throw new Error('Enhanced prompt too short, retrying.');
      return text;
    } catch (err) {
      lastErr = err;
      const msg = err?.message || '';
      const isTransient = /503|429|UNAVAILABLE|RESOURCE_EXHAUSTED/i.test(msg);
      if (!isTransient || attempt === MAX_ATTEMPTS) {
        // Fall back to a lighter model
        if (attempt === MAX_ATTEMPTS) {
          try {
            const resp = await ai.models.generateContent({
              model: 'gemini-2.5-pro',
              contents: `User idea: ${userPrompt}`,
              config: { temperature: 0.7, maxOutputTokens: 400, systemInstruction },
            });
            const text = (resp.text || '').trim();
            if (text.length >= 20) return text;
          } catch (_) { /* fall through */ }
        }
        throw err;
      }
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
  throw lastErr;
}
