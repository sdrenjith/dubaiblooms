import axios from 'axios';

export const UPLOAD_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
export const UPLOAD_MEDIA_MAX_BYTES = 50 * 1024 * 1024;

export const UPLOAD_IMAGE_MAX_LABEL = '5 MB';
export const UPLOAD_MEDIA_MAX_LABEL = '50 MB';

export type UploadKind = 'image' | 'media';

export function uploadSizeLimitBytes(kind: UploadKind): number {
  return kind === 'image' ? UPLOAD_IMAGE_MAX_BYTES : UPLOAD_MEDIA_MAX_BYTES;
}

export function uploadSizeLimitLabel(kind: UploadKind): string {
  return kind === 'image' ? UPLOAD_IMAGE_MAX_LABEL : UPLOAD_MEDIA_MAX_LABEL;
}

export function uploadTooLargeMessage(kind: UploadKind): string {
  if (kind === 'image') {
    return `This file is too large. Logo and image uploads must be ${UPLOAD_IMAGE_MAX_LABEL} or smaller. Try compressing the image or choosing a smaller file.`;
  }
  return `This file is too large. Story media uploads must be ${UPLOAD_MEDIA_MAX_LABEL} or smaller. Try compressing the video or using a shorter clip.`;
}

export function validateUploadFileSize(file: File, kind: UploadKind): string | null {
  const limit = uploadSizeLimitBytes(kind);
  if (file.size > limit) {
    return uploadTooLargeMessage(kind);
  }
  return null;
}

function responseMessage(data: unknown): string {
  if (data && typeof data === 'object' && 'message' in data) {
    return String((data as { message?: string }).message || '').trim();
  }
  if (typeof data === 'string') {
    return data.trim();
  }
  return '';
}

function isPayloadTooLarge(status?: number, message?: string): boolean {
  if (status === 413) {
    return true;
  }
  const msg = (message || '').toLowerCase();
  return msg.includes('too large') || msg.includes('entity too large') || msg.includes('limit_file_size');
}

/** Turn axios / HTTP upload failures into clear admin-facing messages. */
export function formatUploadError(err: unknown, kind: UploadKind): Error {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const message = responseMessage(err.response?.data) || err.message;

    if (isPayloadTooLarge(status, message)) {
      return new Error(uploadTooLargeMessage(kind));
    }

    if (status === 415 || message.toLowerCase().includes('invalid file type')) {
      return new Error(
        kind === 'image'
          ? 'Unsupported file type. Use JPEG, PNG, GIF, or WebP.'
          : 'Unsupported file type. Use JPEG, PNG, GIF, WebP, MP4, WebM, MOV, or OGG.'
      );
    }

    if (message && !/^request failed with status code \d+$/i.test(message)) {
      return new Error(message);
    }

    if (status) {
      return new Error(`Upload failed (${status}). Please try again.`);
    }

    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return new Error('Upload failed due to a network error. Check your connection and try again.');
    }

    return new Error('Upload failed. Please try again.');
  }

  if (err instanceof Error && err.message) {
    if (isPayloadTooLarge(undefined, err.message)) {
      return new Error(uploadTooLargeMessage(kind));
    }
    return err;
  }

  return new Error('Upload failed. Please try again.');
}
