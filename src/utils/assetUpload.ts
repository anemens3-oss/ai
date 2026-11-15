import { AssetItem } from '../types/design';
import { generateId } from './designEngine';

const ALLOWED_EXTENSIONS = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'];
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB

export function sanitizeSvgText(svgString: string): string {
  // Remove <script> blocks and inline on* event handlers for safe SVG rendering
  return svgString
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*(['"]).*?\1/gi, '')
    .replace(/javascript:/gi, '');
}

export function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export async function processUploadedImageFile(
  file: File
): Promise<{ asset?: AssetItem; error?: 'format' | 'size' }> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { error: 'size' };
  }

  const ext = (file.name.split('.').pop() || '').toLowerCase();
  const mime = (file.type || '').toLowerCase();

  const isAllowedExt = ALLOWED_EXTENSIONS.includes(ext);
  const isAllowedMime =
    mime.includes('png') ||
    mime.includes('jpeg') ||
    mime.includes('jpg') ||
    mime.includes('webp') ||
    mime.includes('svg') ||
    mime.includes('gif');

  if (!isAllowedExt && !isAllowedMime) {
    return { error: 'format' };
  }

  let dataUrl = '';
  let formatLabel = (ext || mime.replace('image/', '') || 'IMG').toUpperCase();
  if (formatLabel === 'JPEG') formatLabel = 'JPG';
  if (formatLabel.includes('SVG')) formatLabel = 'SVG';

  if (formatLabel === 'SVG' || mime.includes('svg')) {
    const rawText = await file.text();
    const safeSvg = sanitizeSvgText(rawText);
    const encoded = btoa(unescape(encodeURIComponent(safeSvg)));
    dataUrl = `data:image/svg+xml;base64,${encoded}`;
  } else {
    dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  }

  const dims = await measureImageDimensions(dataUrl);
  const cleanName = file.name.replace(/\.[^/.]+$/, '') || 'Uploaded Image';

  const asset: AssetItem = {
    id: generateId('asset'),
    name: cleanName,
    src: dataUrl,
    mimeType: file.type || `image/${ext || 'png'}`,
    format: formatLabel,
    sizeBytes: file.size,
    width: dims.width,
    height: dims.height,
    category: 'Uploaded',
    createdAt: new Date().toISOString(),
    isBuiltIn: false,
  };

  return { asset };
}

export async function createAssetFromUrl(url: string): Promise<AssetItem | null> {
  const trimmed = url.trim();
  if (!trimmed) return null;

  const dims = await measureImageDimensions(trimmed);
  const urlParts = trimmed.split('?')[0].split('/');
  const lastSegment = urlParts[urlParts.length - 1] || 'External Image';
  const extMatch = lastSegment.match(/\.(png|jpe?g|webp|svg|gif)$/i);
  const format = extMatch ? extMatch[1].toUpperCase().replace('JPEG', 'JPG') : 'URL';

  return {
    id: generateId('asset_url'),
    name: lastSegment.replace(/\.[^/.]+$/, '') || 'External Image',
    src: trimmed,
    mimeType: `image/${format.toLowerCase()}`,
    format,
    sizeBytes: 0,
    width: dims.width,
    height: dims.height,
    category: 'External URL',
    createdAt: new Date().toISOString(),
    isBuiltIn: false,
  };
}

function measureImageDimensions(
  src: string
): Promise<{ width?: number; height?: number }> {
  return new Promise((resolve) => {
    if (typeof Image === 'undefined') {
      resolve({});
      return;
    }
    const img = new Image();
    img.referrerPolicy = 'no-referrer';
    img.onload = () => {
      resolve({
        width: img.naturalWidth || 800,
        height: img.naturalHeight || 600,
      });
    };
    img.onerror = () => {
      resolve({ width: 800, height: 600 });
    };
    img.src = src;
  });
}
