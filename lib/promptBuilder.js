// Server-side prompt builder pro cbre-home-vision.
// Generuje AI prompty pro různé módy úprav exteriéru domu.
// Klíčový princip: stavba domu (rozměry, počet a poloha oken / dveří, komín,
// celkový tvar střechy, pozice na pozemku, proporce) MUSÍ zůstat 1:1 stejná.

const STRUCTURAL_LOCK = `STRUCTURAL PRESERVATION (NON-NEGOTIABLE):
- The output MUST show the EXACT SAME building from the EXACT SAME camera position, distance, height, and angle as the input. Do not rotate, zoom, or reframe.
- DO NOT add, remove, resize, or relocate any window, door, chimney, dormer, gable, or balcony. The count and position of every opening MUST match the input pixel-for-pixel.
- DO NOT change the roof shape, roof pitch, roof overhangs, ridge line, or chimney count. Only the roof MATERIAL/COLOR may change if explicitly requested.
- DO NOT change the building footprint, story count, wall heights, or attached structures (extensions, garages, sheds).
- DO NOT add new architectural elements that are not visible in the input (no new porches, awnings, columns, balconies, dormers).
- DO NOT crop or extend the frame. Output composition MUST match the input.
- People, vehicles, signage, and neighbouring buildings that are visible in the input MUST be preserved or reasonably hidden, never replaced with different ones.

WRONG examples to avoid:
- Adding a second-floor window where the input has a blank wall - WRONG.
- Replacing a saddle roof with a hipped roof when only color was requested - WRONG.
- Tilting the camera to a 3/4 view when the input is a flat front view - WRONG.
- Adding a porch, fence, or driveway that is not in the input - WRONG (unless surroundings change is requested).

PHOTOGRAPHIC QUALITY:
- Output must look like a single real photograph: sharp focus, photorealistic light, accurate shadows matching the original sun direction.
- Match the original time-of-day and weather unless a season change is explicitly requested.
- Match the original lens (no fish-eye, no extreme wide-angle warping if the input is a normal lens).`;

const STYLE_PRESETS = {
  'modern-minimal': {
    label: 'Modern Minimal',
    prompt: `Apply a modern minimalist exterior style:
- Facade: smooth white or warm-grey rendered plaster, clean unbroken surfaces, no decorative trim.
- Roof: keep the original roof shape but in matte anthracite (RAL 7016) or graphite tile.
- Windows / doors: dark anthracite frames, slim profiles. Number, size and position MUST match the input.
- Surroundings: trimmed lawn, a few evergreen shrubs, simple concrete or large-format paving stones in a neutral grey.
- Mood: cloudy soft daylight, no people, no cars, clean architectural-photography look.`
  },
  'scandinavian': {
    label: 'Scandinavian',
    prompt: `Apply a Scandinavian residential style:
- Facade: vertical black-stained timber cladding (or charred wood) with white window reveals, OR clean off-white painted wood.
- Roof: keep original shape but in dark grey standing-seam metal or matte black metal tile.
- Windows / doors: white or matte black frames, count/position matches input exactly.
- Surroundings: birch trees, native grasses, a small wood deck, simple stepping stones.
- Mood: soft cool Nordic daylight, no people.`
  },
  'mediterranean': {
    label: 'Mediterranean',
    prompt: `Apply a Mediterranean / Italian villa style:
- Facade: warm cream or pale terracotta lime plaster, gently weathered.
- Roof: keep original shape, finish in classic terracotta clay tile (curved barrel tiles).
- Windows / doors: wooden shutters in olive green or sun-bleached blue, painted wood frames. Count and position must match input.
- Surroundings: cypress trees, lavender, gravel path, terracotta planters.
- Mood: warm golden-hour Mediterranean sun, light haze.`
  },
  'mountain-cabin': {
    label: 'Mountain Cabin',
    prompt: `Apply a mountain cabin / Alpine cottage style:
- Facade: stacked horizontal dark stained timber logs OR rough stone base with timber cladding above.
- Roof: keep original shape, finish in dark wood shingles or weathered grey slate.
- Windows / doors: solid wood frames in dark walnut tone, count/position matches input exactly.
- Surroundings: pine and spruce trees, a stack of firewood, a small mountain stone path.
- Mood: crisp clear mountain daylight.`
  },
  'industrial-loft': {
    label: 'Industrial',
    prompt: `Apply an industrial / converted-warehouse style:
- Facade: exposed red brick OR raw concrete panels with visible board marks.
- Roof: keep original shape, finish in dark zinc or corrugated steel.
- Windows / doors: black steel frames with thin mullions (Crittall-style), count/position matches input exactly.
- Surroundings: minimal landscaping, gravel and concrete paving, a few sculptural planters.
- Mood: overcast even light.`
  },
  'heritage-restoration': {
    label: 'Heritage Restoration',
    prompt: `Apply a careful heritage restoration:
- Facade: cleaned and freshly painted historical render in original-style colours (cream, soft ochre, pale rose), restored decorative trim around windows.
- Roof: keep original shape, finish in brand-new traditional ceramic tile matching the regional style.
- Windows / doors: restored wooden frames in white or muted historic green, original muntins kept intact.
- Surroundings: tidy historic garden, gravel paths, period-appropriate iron fence if a fence exists in the input.
- Mood: bright sunny morning, restoration-photography look.`
  },
  'farmhouse': {
    label: 'Country Farmhouse',
    prompt: `Apply a tidy country farmhouse style:
- Facade: white or cream lime-washed plaster with a low natural-stone or red-brick base.
- Roof: keep original shape in classic red ceramic tile.
- Windows / doors: solid wood frames in deep green, dark red or natural oak. Count and position match input exactly.
- Surroundings: simple flower garden, low picket fence if appropriate, gravel driveway, a couple of fruit trees.
- Mood: warm afternoon countryside light.`
  },
  'japandi': {
    label: 'Japandi',
    prompt: `Apply a Japandi (Japanese-Scandinavian) style:
- Facade: combination of dark charred wood (shou sugi ban) and warm off-white plaster panels.
- Roof: keep original shape, finish in matte black tile or dark metal.
- Windows / doors: black slim frames, optional vertical timber slats next to entrance.
- Surroundings: gravel garden, a single sculptural Japanese maple, simple stone path.
- Mood: soft diffuse daylight, calm minimal feel.`
  },
  'neat-refresh': {
    label: 'Neat Refresh (subtle)',
    prompt: `Apply a careful, conservative refresh that keeps the original character:
- Facade: same colour family as the input but freshly painted / re-rendered, cracks and stains gone.
- Roof: same material and colour as the input but clean and uniform, no missing tiles.
- Windows / doors: same colour as the input but freshly painted, no other change.
- Surroundings: tidied garden, mowed lawn, swept paths. Do not introduce new plants or features that are not in the input.
- Mood: same daylight as the input.`
  }
};

const FACADE_TYPE_PROMPTS = {
  'modern-plaster': 'Replace the entire facade with smooth, modern lime/cement plaster in a neutral off-white or warm pale grey tone. No decorative trim, no visible joints, no texture pattern — a clean continuous surface. Keep all windows, doors, chimneys and architectural openings exactly as they are. The plaster reads as freshly applied with even color and a slight satin finish, premium architectural quality.',
  'stone': 'Replace the facade cladding with natural stacked stone in warm earthy tones (beige, sandstone, light brown). Use irregular stone sizes with tight mortar joints for an organic, premium look. Keep stone consistently across the wall surface — no partial application. All openings (windows, doors) retain their exact size and position with clean stone reveals around them.',
  'brick': 'Replace the facade with classic red-brown fired clay brick laid in a running bond pattern with light cream mortar joints. Brick texture looks authentic and slightly weathered — not too perfect. Maintain consistent brick across the entire facade. Window and door openings keep their exact position with clean brick reveals.',
  'log-cabin': 'Replace the facade with a stacked horizontal log cabin construction: solid round or half-round timber logs stacked horizontally with visible chinking gaps between them, warm natural wood tone (medium pine or stained walnut). Corner joints visible at building corners (saddle-notch or dovetail). Keep all openings exactly in place — windows and doors framed with timber surrounds.',
  'concrete': 'Replace the facade with smooth architectural exposed concrete in a light-grey board-marked finish. Show visible horizontal formwork lines at consistent intervals (~30 cm) and subtle tie-rod holes in a regular grid. The surface reads as premium architectural concrete (Tadao Ando / Brutalist-inspired quality), not raw construction concrete. Keep all openings unchanged with clean concrete reveals.'
};

const ROOF_TYPE_PROMPTS = {
  'ceramic-tile-red': 'Re-finish the roof with traditional red-orange fired clay roof tiles (curved Mediterranean barrel tile OR flat ceramic tile depending on the input roof style). The tile color reads as authentic kiln-fired terracotta — warm, slightly varied tones, not uniformly painted. Apply the pattern in clean horizontal courses. Keep the exact roof shape, pitch, ridge line, eaves and every chimney position pixel-identical.',
  'ceramic-tile-anthracite': 'Re-finish the roof with matte anthracite (dark grey, RAL 7016) flat ceramic roof tiles. Tile pattern in clean parallel courses with slight shadow line per course. Surface reads as real fired ceramic with a slight satin finish — not glossy. Keep the exact roof shape, pitch, ridge, eaves and every chimney position unchanged.',
  'metal-standing-seam': 'Re-finish the roof in dark grey (anthracite, RAL 7016) standing-seam metal cladding. Show clear vertical seams at consistent ~50 cm intervals. The finish reads as architectural-grade pre-coated metal — matte, premium, slightly textured. Keep the exact roof shape, pitch, ridge, eaves and every chimney position unchanged. Where seams meet ridges and eaves, terminate cleanly.',
  'slate': 'Re-finish the roof with natural Welsh / Spanish dark grey slate tiles in a traditional rectangular pattern. Show slight color variation between tiles (mostly dark grey with hints of blue-black and graphite). Lay slates in clean horizontal courses with half-bond offset. Keep the exact roof shape, pitch, ridge line and every chimney exactly as in the input.',
  'shingles-asphalt': 'Re-finish the roof with dark grey laminated asphalt shingles in a clean horizontal course pattern. Show the typical layered tab profile creating a subtle shadow line every course. Keep the exact roof shape, pitch, ridge and chimneys exactly as in the input.'
};

const WINDOW_DOOR_STYLE_PROMPTS = {
  'white': 'Repaint all window and door frames in clean matte white (RAL 9010). Frame profiles, count, and position remain pixel-identical to the input. Glass area unchanged.',
  'anthracite': 'Repaint all window and door frames in matte anthracite grey (RAL 7016). Frame profiles, count, and position remain pixel-identical to the input. Glass area unchanged.',
  'black': 'Repaint all window and door frames in matte deep black (RAL 9005). Frame profiles, count, and position remain pixel-identical to the input. Glass area unchanged.',
  'dark-grey': 'Repaint all window and door frames in matte dark grey (RAL 7022, a warmer mid-dark grey). Frame profiles, count, and position remain pixel-identical to the input. Glass area unchanged.',
  'natural-wood': 'Refinish all window and door frames in natural light oak wood with visible grain. Apply a satin clear coat — wood reads as warm and matte, not glossy. Profiles, count, and position unchanged. Glass area unchanged.',
  'dark-wood': 'Refinish all window and door frames in dark walnut wood (rich brown with hints of red) with visible grain. Satin finish, no gloss. Profiles, count, and position unchanged. Glass area unchanged.',
  'olive-green': 'Repaint all window and door frames in muted olive green (RAL 6013). Profiles, count, and position unchanged. Glass area unchanged.',
  'bronze': 'Refinish all window and door frames in architectural bronze (warm brown-gold metallic, anodized finish). Premium commercial-grade appearance. Profiles, count, and position unchanged. Glass area unchanged.',
  'silver-aluminum': 'Refinish all window and door frames in brushed silver aluminum. Subtle matte metallic finish — clean, modern, architectural. Profiles, count, and position unchanged. Glass area unchanged.',
  'copper': 'Refinish all window and door frames in warm patinated copper. Bright copper tones with subtle verdigris (slight green) on edges suggesting natural aging. Premium architectural look. Profiles, count, and position unchanged. Glass area unchanged.'
};

const SEASON_PROMPTS = {
  'spring': 'Change only the surroundings to depict spring: fresh green grass, blooming trees and bushes, soft cool daylight. Building unchanged.',
  'summer': 'Change only the surroundings to depict summer: lush green grass, full foliage, warm clear sunlight. Building unchanged.',
  'autumn': 'Change only the surroundings to depict autumn: orange / red foliage, scattered fallen leaves, low warm sun. Building unchanged.',
  'winter': 'Change only the surroundings to depict winter: even snow cover on the ground and roof, bare deciduous trees, soft overcast light. The building itself stays unchanged.'
};

const LIGHT_PROMPTS = {
  'overcast': 'Change only the lighting and sky to overcast, diffused soft daylight under a neutral grey sky. Shadows are minimal and soft. All surroundings stay otherwise identical.',
  'bright-midday': 'Change only the lighting to bright midday sun (high sun angle, ~12:00). Shadows are short and crisp, sky is clear blue. All surroundings stay otherwise identical.',
  'golden-hour': 'Change only the lighting to warm golden-hour sunlight (low sun angle, ~30 minutes before sunset). Long warm shadows, golden glow on the facade, slight haze in the sky. All surroundings stay otherwise identical.',
  'sunrise': 'Change only the lighting to early morning sunrise (low sun angle from the east, ~30 minutes after sunrise). Cool-to-warm transitional light, soft long shadows, soft pink/orange tint in the sky. All surroundings stay otherwise identical.',
  'blue-hour': 'Change only the lighting to blue hour just after sunset (dim ambient blue daylight, ~20 minutes after sunset). Sky is deep blue, no direct sun, only soft ambient outdoor lighting. All surroundings stay otherwise identical.',
  'night-lit': 'Change only the lighting to night-time with the property exterior lighting turned on: facade uplights, entrance lights, path lights, garden accent lighting. The surrounding ambient is a deep night sky (stars or moonlight), but the building reads as warmly illuminated. All surroundings stay otherwise identical.',
  'dramatic': 'Change only the lighting to dramatic high-contrast architectural light: strong directional sun from one side creating deep but clean shadows, with a dark stormy or backlit sky behind the building. The building reads as boldly modeled with strong sculptural contrast. All surroundings stay otherwise identical.'
};

const SURROUNDINGS_PROMPTS = {
  'short-lawn': 'Replace the immediate surroundings with a freshly mown short lawn (~3-5 cm grass height) extending across the visible ground area. The lawn is uniformly green, neatly trimmed at edges along the building and any paths. No flower beds, no paving, no decorative features — just clean continuous lawn. Existing trees in the background may remain.',
  'medium-lawn': 'Replace the immediate surroundings with a natural medium-length lawn (~10-15 cm grass height) — slightly longer than freshly mown, with a more relaxed, natural look. A few small wildflowers (daisies, clover) may appear sparingly. The lawn extends across the ground area with loose, natural edges rather than crisp boundaries.',
  'concrete-paving': 'Replace the immediate surroundings with large-format concrete paving slabs (~60×60 cm grey concrete tiles) laid in a clean grid pattern around the building. No grass, no flower beds — only the paved surface. Joints between slabs are minimal and dark grey. The paving reads as premium architectural ground cover.',
  'gravel': 'Replace the immediate surroundings with light grey decorative gravel (~10-20 mm rounded pebbles) covering the visible ground area uniformly. Clean edges where the gravel meets the building foundation and any paths. No grass, no plants beds — just consistent gravel surface. Optional: a few sculptural larger rocks for visual variation.',
  'flower-garden': 'Replace the immediate surroundings with a cultivated formal flower garden: defined planted beds with mixed seasonal perennials (lavender, ornamental grasses, low flowering shrubs) arranged in front of the building. Mown lawn between beds, with stepping stones or a low neat edge separating beds from lawn. The garden looks well-maintained and designed — not wild.',
  'swimming-pool': 'Replace the immediate surroundings with an architectural swimming pool: a rectangular in-ground pool (approximately 6×3 m, light blue tile interior, clear still water) placed in front of or beside the building, parallel to the main facade. Around the pool: light-coloured concrete or stone paving forming a ~2 m apron. Optional: 2 minimalist sun loungers on one side. The building itself stays completely unchanged.',
  'farmhouse-yard': 'Replace the immediate surroundings with a traditional farmhouse yard: a couple of mature fruit trees (apple, pear) framing the building, a low wooden bench, a gravel driveway leading to the entrance, simple mown lawn between the trees. The character is country-residential but kept tidy and well-maintained — never overgrown or messy.'
};

const OTHER_ACTION_PROMPTS = {
  'remove-scaffolding': 'Remove all scaffolding, ladders, construction equipment, plastic sheeting, dust bins and temporary structures. Reveal the finished facade beneath. Do not change the building itself.',
  'tidy-up': 'Tidy up the area around the house: remove clutter, debris, parked vehicles, cables on the ground, hoses, and visual noise. Keep the building unchanged. Do not add anything new.',
  'remove-defects': 'Repair visible cosmetic defects on the building: cracks, paint peels, stains, dirty patches, broken gutters. Make every surface look freshly maintained. Do not change colours or materials beyond a clean version of the same finish.',
  'add-plaster': 'Cover all exposed brick / unfinished walls with a fresh, even cream-white lime plaster. Keep architecture, openings and surroundings exactly the same.',
  'fix-roof': 'Fix the roof: replace missing or broken tiles with matching ones, straighten the ridge line, clean moss. Keep roof material, colour and shape identical.',
  'clean-facade': 'Deep-clean the facade: remove dirt, biological growth, water stains, graffiti. Keep colours, materials, openings and architecture unchanged.'
};

const CAMERA_ANGLE_PROMPTS = {
  'front': `VIEWPOINT CHANGE: Re-render the SAME building from a flat front-on view (camera perpendicular to the main facade, lens at typical eye level ~1.6 m).
PRESERVE STRICTLY (do NOT redesign, redraw, or stylize):
- Every window, door, balcony, dormer, chimney visible on the front facade — same count, same exact position, same size, same proportions, same frame color, same glass.
- The roof shape, pitch, ridge line, and every chimney with its exact height.
- Facade material and color (plaster texture, brick pattern, cladding) — pixel-for-pixel.
- Any visible signage, house numbers, attached lights, gutters, downpipes.
This is a CAMERA REPOSITION ONLY — you are not redesigning the building, only rotating the viewpoint to be perpendicular to the front. If the input is already nearly front-on, the output should look almost identical with only minor perspective correction.`,

  'three-quarter-left': `VIEWPOINT CHANGE: Re-render the SAME building from a 3/4 view, with the camera rotated about 25-30 degrees to the LEFT of the front-on view (camera at eye level ~1.6 m). The front facade remains the primary subject (~70% of the visible building); the left-hand side wall appears at the right edge in foreshortened perspective.
PRESERVE STRICTLY:
- Every window, door, balcony, dormer, chimney that is visible on the FRONT facade in the input — same count, exact position, same size, same color, same glazing. They are now seen from a slight angle but must remain individually identifiable.
- Roof shape, pitch, ridge line, every chimney with its position and proportions.
- Facade material, color, texture — pixel-faithful.
- For the LEFT side wall (now slightly visible): infer plausibly from the front facade material and roof shape. Keep it minimal — a plain wall in the same material, optionally one or two windows if a side roof slope suggests them. Do NOT invent decorative elements, doors, garages, extensions, or balconies that are not in the input.`,

  'three-quarter-right': `VIEWPOINT CHANGE: Re-render the SAME building from a 3/4 view, with the camera rotated about 25-30 degrees to the RIGHT of the front-on view (camera at eye level ~1.6 m). The front facade remains the primary subject (~70% of the visible building); the right-hand side wall appears at the left edge in foreshortened perspective.
PRESERVE STRICTLY:
- Every window, door, balcony, dormer, chimney that is visible on the FRONT facade in the input — same count, exact position, same size, same color, same glazing. They are now seen from a slight angle but must remain individually identifiable.
- Roof shape, pitch, ridge line, every chimney with its position and proportions.
- Facade material, color, texture — pixel-faithful.
- For the RIGHT side wall (now slightly visible): infer plausibly from the front facade material and roof shape. Keep it minimal — a plain wall in the same material, optionally one or two windows if a side roof slope suggests them. Do NOT invent decorative elements, doors, garages, extensions, or balconies that are not in the input.`,

  'side': `VIEWPOINT CHANGE: Re-render the SAME building from a flat side view (camera perpendicular to the side wall, eye level ~1.6 m). This is the LEFT side wall as seen by a viewer standing in front of the building.
PRESERVE STRICTLY:
- Roof shape, pitch, ridge line, eave height, and every chimney exactly as in the input. The roof silhouette from the side is fully determined by the input — gable, hip, or shed roof shape must match.
- Facade material, color, and texture — identical to the front. The side wall uses the SAME facade material as the front.
- Building height, length, and proportions — identical.
- Any side-wall windows or doors visible in the input must remain in their exact positions.
INFER CAREFULLY (do not over-invent):
- If the input does not show the side wall, generate a plain side wall in the same facade material. Add 1-2 small windows at plausible positions (matching the floor heights visible on the front). Do NOT add doors, garages, balconies, decorative trim, or extensions that are not in the input.`,

  'back': `VIEWPOINT CHANGE: Re-render the SAME building from the back (camera perpendicular to the rear facade, eye level ~1.6 m).
PRESERVE STRICTLY:
- Roof shape, pitch, ridge line, and every chimney from the input — the back is a mirror-image volume of the front in terms of roofline.
- Facade material, color, and texture — identical to the front.
- Building height, proportions, and footprint — identical.
INFER CAREFULLY (minimal invention):
- The back facade is NOT visible in the input. Generate a plausible back wall in the SAME facade material as the front, with a SIMPLER arrangement than the front: 2-4 windows total at floor heights matching the front, optionally one back door at ground level. No decorative elements, no balconies, no extensions, no garages unless directly visible in the input.
- Surroundings behind the building: continue the same garden/yard style visible at the sides; do not invent pools, sheds, terraces, or unrelated structures.`,

  'aerial-30': `VIEWPOINT CHANGE: Re-render the SAME building from a high-angle aerial view at about 30° down-tilt (drone shot at ~15-25 m altitude).
PRESERVE STRICTLY:
- The entire roof: shape, pitch, every ridge line, every chimney with exact position, every dormer, every roof window — pixel-faithful from above.
- Roof material, color, texture — identical to the input.
- Front facade visible in foreshortened perspective: every window, door, balcony preserved in count and position.
- Surrounding garden/yard layout — paths, trees, paved areas — preserved as in the input but now seen from above.`,

  'eye-level-close': `VIEWPOINT CHANGE: This is a ZOOM-IN only, not a rotation. Re-render the SAME building from a closer eye-level shot, framing approximately the lower two-thirds of the front facade (the entrance, ground-floor windows, and lower-floor details fill the frame). The viewing angle and the relative geometry of every element remain IDENTICAL to the input — only the framing tightens.
PRESERVE STRICTLY:
- Every window, door, frame color, glass, handle, house number, attached light fixture, gutter, downpipe — pixel-identical to what is in the lower portion of the input.
- Facade material and color — identical, just shown closer.
- Camera height and angle — same as the input (no tilt, no rotation, no perspective change).
- Roof edge / eave line if visible at the top of the cropped frame — same as input.
- Do NOT invent any element that is not visible in the lower portion of the input.`
};

export function buildPrompt({
  mode = 'preset',
  presetId,
  facadeType,
  roofType,
  windowDoorStyle,
  facadeColor,
  roofColor,
  windowDoorColor,
  season,
  light,
  surroundings,
  cameraAngle,
  customHint,
  otherAction,
  otherActions,
  annotationText
} = {}) {
  const sections = [];

  switch (mode) {
    case 'preset': {
      const preset = STYLE_PRESETS[presetId];
      if (!preset) throw new Error(`Unknown preset: ${presetId}`);
      sections.push(`PRIMARY TASK: Apply this exterior style to the building shown in the input image.`);
      sections.push(preset.prompt);
      break;
    }

    case 'element': {
      sections.push(`PRIMARY TASK: Make ONLY the following targeted changes to the building's appearance. Do not touch anything else.`);
      const parts = [];
      if (facadeType && FACADE_TYPE_PROMPTS[facadeType]) parts.push(`FACADE: ${FACADE_TYPE_PROMPTS[facadeType]}`);
      if (roofType && ROOF_TYPE_PROMPTS[roofType]) parts.push(`ROOF: ${ROOF_TYPE_PROMPTS[roofType]}`);
      if (windowDoorStyle && WINDOW_DOOR_STYLE_PROMPTS[windowDoorStyle]) parts.push(`OPENINGS: ${WINDOW_DOOR_STYLE_PROMPTS[windowDoorStyle]}`);
      if (facadeColor) parts.push(`FACADE COLOR: Repaint the facade in the exact colour ${facadeColor}. Keep all other elements identical.`);
      if (roofColor) parts.push(`ROOF COLOR: Repaint the roof in the exact colour ${roofColor}. Keep all other elements identical.`);
      if (windowDoorColor) parts.push(`OPENINGS COLOR: Repaint all window and door frames in the exact colour ${windowDoorColor}. Keep frame profiles and count identical.`);
      if (season && SEASON_PROMPTS[season]) parts.push(`SEASON: ${SEASON_PROMPTS[season]}`);
      if (light && LIGHT_PROMPTS[light]) parts.push(`LIGHT / TIME OF DAY: ${LIGHT_PROMPTS[light]}`);
      if (surroundings && SURROUNDINGS_PROMPTS[surroundings]) parts.push(`SURROUNDINGS: ${SURROUNDINGS_PROMPTS[surroundings]}`);
      if (!parts.length) throw new Error('Element mode but no element specified.');
      sections.push(parts.join('\n\n'));
      break;
    }

    case 'camera-angle': {
      const angle = CAMERA_ANGLE_PROMPTS[cameraAngle];
      if (!angle) throw new Error(`Unknown camera angle: ${cameraAngle}`);
      sections.push(`PRIMARY TASK: This is a CAMERA REPOSITION, not a redesign. The building in the output MUST be the EXACT SAME BUILDING as in the input: same number of stories, same exact count and position of every window/door/chimney/dormer/balcony, same facade material and color, same roof shape and material, same proportions, same surroundings layout. The ONLY thing that changes is the viewpoint from which the photograph is taken. Do NOT redesign, restyle, or re-imagine — copy every visible detail faithfully and only adjust perspective.`);
      sections.push(angle);
      sections.push(`FINAL CHECK BEFORE OUTPUT: Compare every visible element of the input to your output. If you have invented any window, door, balcony, decoration, garage, extension, or surrounding element that is not in the input — remove it. If you have changed the count or position of any opening — fix it. The output must read as a photograph of the SAME REAL BUILDING from a different camera position.`);
      break;
    }

    case 'other-action': {
      const action = OTHER_ACTION_PROMPTS[otherAction];
      if (!action) throw new Error(`Unknown other action: ${otherAction}`);
      sections.push(`PRIMARY TASK: ${action}`);
      break;
    }

    case 'multi-action': {
      if (!Array.isArray(otherActions) || otherActions.length === 0) {
        throw new Error('multi-action mode requires non-empty otherActions array.');
      }
      sections.push(`PRIMARY TASK: Apply ALL of the following fixes to the photo. Treat them as a combined task - the result must satisfy every item.`);
      const items = [];
      for (const id of otherActions) {
        const a = OTHER_ACTION_PROMPTS[id];
        if (a) items.push(`- ${a}`);
      }
      if (!items.length) throw new Error(`No valid actions in: ${otherActions.join(',')}`);
      sections.push(items.join('\n'));
      break;
    }

    case 'custom': {
      if (!customHint) throw new Error('Custom mode requires customHint.');
      sections.push(`PRIMARY TASK: Apply the user-described change to the building. Treat the description as INTENT, not literal - the goal is a single realistic photograph of the same building with the requested visible change.`);
      sections.push(`USER REQUEST: ${customHint}`);
      break;
    }

    case 'annotation-refine': {
      sections.push(`PRIMARY TASK: The SECOND attached image is a MASK. Apply the user-described change ONLY inside the bright (yellow / white) area of the mask. Pixels outside the mask MUST remain pixel-identical to the first image - do not "improve" them, do not change colours, do not adjust lighting outside the mask.`);
      sections.push(`USER REQUEST inside the masked area: ${annotationText || 'Improve this area to match the rest of the photo.'}`);
      break;
    }

    default:
      throw new Error(`Unknown mode: ${mode}`);
  }

  if (customHint && mode !== 'custom' && mode !== 'annotation-refine') {
    sections.push(`ADDITIONAL USER PREFERENCE (incorporate WITHOUT overriding the primary task or breaking structural preservation): ${customHint}`);
  }

  sections.push(STRUCTURAL_LOCK);
  sections.push(`OUTPUT: a single photorealistic image of the same building with the requested change applied. No text, no captions, no watermarks, no collage.`);

  return sections.join('\n\n');
}

export const PROMPT_REGISTRY = {
  STYLE_PRESETS,
  FACADE_TYPE_PROMPTS,
  ROOF_TYPE_PROMPTS,
  WINDOW_DOOR_STYLE_PROMPTS,
  SEASON_PROMPTS,
  SURROUNDINGS_PROMPTS,
  OTHER_ACTION_PROMPTS,
  CAMERA_ANGLE_PROMPTS
};
