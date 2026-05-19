/**
 * Client-side composite helpery. Žádné AI volání — jen Canvas API.
 */

export type LogoPosition = 'br' | 'bl' | 'tr' | 'tl';

/**
 * Přidá CBRE bílé logo do rohu obrázku.
 * Vrátí base64 (bez data: prefixu) nového kompozitu jako PNG.
 */
export async function compositeCbreLogo(
  imageBase64: string,
  imageMime: string,
  position: LogoPosition,
): Promise<string> {
  const base = await loadImage(`data:${imageMime};base64,${imageBase64}`);
  const logo = await loadImage('/cbre-logo-white.png');

  const canvas = document.createElement('canvas');
  canvas.width = base.naturalWidth;
  canvas.height = base.naturalHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable.');

  ctx.drawImage(base, 0, 0, canvas.width, canvas.height);

  // Logo cca 8% šířky obrázku (min 60px, max 240px)
  const targetWidth = Math.min(240, Math.max(60, canvas.width * 0.08));
  const aspect = logo.naturalWidth / logo.naturalHeight;
  const logoW = targetWidth;
  const logoH = targetWidth / aspect;
  const margin = Math.max(16, canvas.width * 0.025);

  let x = 0;
  let y = 0;
  if (position === 'br') {
    x = canvas.width - logoW - margin;
    y = canvas.height - logoH - margin;
  } else if (position === 'bl') {
    x = margin;
    y = canvas.height - logoH - margin;
  } else if (position === 'tr') {
    x = canvas.width - logoW - margin;
    y = margin;
  } else if (position === 'tl') {
    x = margin;
    y = margin;
  }

  // Lehký drop shadow pro čitelnost na světlém pozadí
  ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
  ctx.shadowBlur = Math.max(4, logoW * 0.05);
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 2;
  ctx.drawImage(logo, x, y, logoW, logoH);

  const dataUrl = canvas.toDataURL('image/png');
  return dataUrl.split(',')[1];
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src.slice(0, 60)}…`));
    img.src = src;
  });
}
