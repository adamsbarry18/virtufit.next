import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function imageUrlToDataUrl(url: string): Promise<string> {
  // Try to fetch the provided image URL. If it fails (CORS/404/etc),
  // fall back to a stable placeholder that is allowed in next.config.ts.
  const fallbackUrl = 'https://placehold.co/300x300?text=Image';

  async function blobToDataURL(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to data URL.'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image: ${res.status} ${res.statusText}`);
    const blob = await res.blob();
    return await blobToDataURL(blob);
  } catch (e) {
    console.error('Image fetch failed, using fallback placeholder.', e);
    try {
      const fallbackRes = await fetch(fallbackUrl);
      if (!fallbackRes.ok)
        throw new Error(`Fallback fetch failed: ${fallbackRes.status} ${fallbackRes.statusText}`);
      const blob = await fallbackRes.blob();
      return await blobToDataURL(blob);
    } catch (fallbackErr) {
      console.error('Fallback image fetch also failed.', fallbackErr);
      throw fallbackErr;
    }
  }
}
