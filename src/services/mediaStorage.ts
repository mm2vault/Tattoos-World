const DATA_URL_PATTERN = /^data:([^;,]+)?(;base64)?,/i;

// Firebase Cloud Storage is intentionally not used in this project.
// Images are compressed in the browser and persisted as compact data URLs
// inside Firestore so the app can run without a Blaze billing account.

const safeSegment = (value: string): string =>
  String(value || 'media')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80) || 'media';

export const isDataUrl = (value: string): boolean =>
  typeof value === 'string' && DATA_URL_PATTERN.test(value);

export const estimateDataUrlBytes = (value: string): number => {
  const source = String(value || '');
  const comma = source.indexOf(',');
  if (comma < 0) return source.length;
  const base64 = source.slice(comma + 1).replace(/\s/g, '');
  return Math.ceil(base64.length * 0.75);
};

export const optimizeDataUrlForFirestore = async (
  dataUrl: string,
  maxBytes = 96 * 1024,
  maxSide = 320,
): Promise<string> => optimizeDataUrl(dataUrl, maxBytes, maxSide);

const optimizeDataUrl = async (
  dataUrl: string,
  maxBytes: number,
  maxSide = 1200,
): Promise<string> => {
  if (!isDataUrl(dataUrl)) return dataUrl;

  if (
    typeof window === 'undefined' ||
    typeof Image === 'undefined' ||
    typeof document === 'undefined'
  ) {
    return dataUrl;
  }

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      let side = Math.min(
        maxSide,
        Math.max(1, image.width),
        Math.max(1, image.height),
      );

      const qualities = [0.72, 0.62, 0.52, 0.44, 0.36, 0.28];
      let best = dataUrl;

      for (let attempt = 0; attempt < 5; attempt += 1) {
        const scale = Math.min(1, side / Math.max(image.width, image.height));
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('canvas-unavailable'));
          return;
        }

        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(image, 0, 0, width, height);

        for (const quality of qualities) {
          const candidate = canvas.toDataURL('image/jpeg', quality);
          best = candidate;

          if (estimateDataUrlBytes(candidate) <= maxBytes) {
            resolve(candidate);
            return;
          }
        }

        side = Math.max(360, Math.round(side * 0.78));
      }

      if (estimateDataUrlBytes(best) <= maxBytes) {
        resolve(best);
        return;
      }

      reject(new Error('image-too-large'));
    };

    image.onerror = () => reject(new Error('image-decode-failed'));
    image.src = dataUrl;
  });
};

export async function uploadDataUrl(
  folder: string,
  uid: string,
  dataUrl: string,
  fileName: string,
): Promise<string> {
  // Keep the existing public API so the rest of the app needs no special-case
  // code when Storage is disabled.
  void safeSegment(folder);
  void safeSegment(uid);
  void safeSegment(fileName);

  return optimizeDataUrl(dataUrl, 600 * 1024, 1200);
}

export async function uploadMediaBatch(
  folder: string,
  uid: string,
  mediaUrls: string[],
  batchId: string,
): Promise<string[]> {
  void safeSegment(folder);
  void safeSegment(uid);
  void safeSegment(batchId);

  const urls = mediaUrls.filter(Boolean);
  if (!urls.length) return [];

  // Keep the whole media payload small enough for a Firestore tattoo document.
  const totalDecodedBudget = 520 * 1024;
  const perImageBudget = Math.max(
    48 * 1024,
    Math.floor(totalDecodedBudget / urls.length),
  );

  return Promise.all(
    urls.map((url) => optimizeDataUrl(url, perImageBudget, 1200))
  );
}
