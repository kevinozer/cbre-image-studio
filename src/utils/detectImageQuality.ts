/**
 * Heuristická detekce nízké kvality fotky na frontendu.
 * Vrátí QualityIssue (null = OK) — používá se pak v QualityWarningModal.
 *
 * Pravidla:
 *  - 'small'      : min(width, height) < 800 px
 *  - 'compressed' : bytes / (width * height) < 0.15 (silně zkomprimováno)
 *  - 'blurry'     : Laplacian variance < 90 (nízká frekvence = rozmazané / zrnité)
 *
 * Threshold hodnoty jsou empirické, dají se v případě potřeby doladit.
 */
export type QualityIssue = 'small' | 'compressed' | 'blurry' | null;

export async function detectImageQuality(file: File, img: HTMLImageElement): Promise<QualityIssue> {
  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // 1) Rozměry
  if (Math.min(w, h) < 800) return 'small';

  // 2) Komprese (bytes per pixel)
  const bpp = file.size / (w * h);
  if (bpp < 0.15) return 'compressed';

  // 3) Blur via Laplacian variance — měříme na zmenšeném canvasu (256×256) pro rychlost
  try {
    const lapVar = laplacianVariance(img);
    if (lapVar < 90) return 'blurry';
  } catch {
    // Pokud canvas operace selže (CORS), ignoruj blur check
  }

  return null;
}

/** Laplacian variance — klasická OpenCV heuristika pro blur detekci. */
function laplacianVariance(img: HTMLImageElement): number {
  const SIZE = 256;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Infinity; // nemůžeme měřit → považuj za OK
  ctx.drawImage(img, 0, 0, SIZE, SIZE);
  const { data } = ctx.getImageData(0, 0, SIZE, SIZE);

  // Konvertuj na grayscale (luminance)
  const gray = new Float32Array(SIZE * SIZE);
  for (let i = 0; i < SIZE * SIZE; i++) {
    const r = data[i * 4];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  // Laplacian kernel [[0,1,0],[1,-4,1],[0,1,0]]
  const lap = new Float32Array(SIZE * SIZE);
  for (let y = 1; y < SIZE - 1; y++) {
    for (let x = 1; x < SIZE - 1; x++) {
      const idx = y * SIZE + x;
      lap[idx] =
        gray[idx - SIZE] +
        gray[idx - 1] +
        gray[idx + 1] +
        gray[idx + SIZE] -
        4 * gray[idx];
    }
  }

  // Variance
  let sum = 0;
  let sumSq = 0;
  let n = 0;
  for (let i = 0; i < lap.length; i++) {
    const v = lap[i];
    if (v === 0) continue;
    sum += v;
    sumSq += v * v;
    n++;
  }
  if (n === 0) return Infinity;
  const mean = sum / n;
  return sumSq / n - mean * mean;
}
