import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function imageUrlToDataUrl(url: string): Promise<string | null> {
  // Use our image proxy to avoid CORS issues
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(url)}`;

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
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    const res = await fetch(proxyUrl, {
      signal: controller.signal,
      mode: 'cors',
      credentials: 'omit',
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(
        `Failed to fetch image via proxy: ${res.status} ${res.statusText} for URL: ${url}`
      );
      return null;
    }

    const blob = await res.blob();
    return await blobToDataURL(blob);
  } catch (e) {
    console.warn(`Image proxy fetch failed for URL: ${url}`, e);
    return null;
  }
}
