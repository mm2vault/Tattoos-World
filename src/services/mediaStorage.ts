import { getDownloadURL, ref, uploadString } from 'firebase/storage';
import { storage } from './firebase';

const DATA_URL_PATTERN = /^data:([^;,]+)?(;base64)?,/i;

const safeSegment = (value: string): string =>
  String(value || 'media')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .slice(0, 80) || 'media';

export const isDataUrl = (value: string): boolean =>
  typeof value === 'string' && DATA_URL_PATTERN.test(value);

export async function uploadDataUrl(
  folder: string,
  uid: string,
  dataUrl: string,
  fileName: string,
): Promise<string> {
  if (!isDataUrl(dataUrl)) return dataUrl;

  const contentType = dataUrl.match(DATA_URL_PATTERN)?.[1] || 'image/jpeg';
  const safePath = `${safeSegment(folder)}/${safeSegment(uid)}/${safeSegment(fileName)}`;
  const storageRef = ref(storage, safePath);

  await uploadString(storageRef, dataUrl, 'data_url', {
    contentType,
    cacheControl: 'public,max-age=31536000,immutable',
  });

  return getDownloadURL(storageRef);
}

export async function uploadMediaBatch(
  folder: string,
  uid: string,
  mediaUrls: string[],
  batchId: string,
): Promise<string[]> {
  const safeBatch = safeSegment(batchId);
  return Promise.all(
    mediaUrls.map((url, index) =>
      uploadDataUrl(folder, uid, url, `${safeBatch}/${String(index + 1).padStart(2, '0')}.jpg`)
    )
  );
}
