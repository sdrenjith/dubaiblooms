import fs from 'fs';
import path from 'path';
import { uploadsDir } from '../lib/uploadsDir.js';

const metaPath = path.join(uploadsDir, '.media-alt.json');

function readMeta(): Record<string, string> {
  try {
    if (!fs.existsSync(metaPath)) {
      return {};
    }
    const raw = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as unknown;
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return {};
    }
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof value === 'string') {
        out[key] = value.trim().slice(0, 200);
      }
    }
    return out;
  } catch {
    return {};
  }
}

function writeMeta(meta: Record<string, string>): void {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  fs.writeFileSync(metaPath, `${JSON.stringify(meta, null, 2)}\n`, 'utf8');
}

export function getMediaLibraryAltMap(): Record<string, string> {
  return readMeta();
}

export function getMediaLibraryAlt(filename: string): string {
  return readMeta()[filename] || '';
}

export function setMediaLibraryAlt(filename: string, alt: string): string {
  const meta = readMeta();
  const trimmed = alt.trim().slice(0, 200);
  if (trimmed) {
    meta[filename] = trimmed;
  } else {
    delete meta[filename];
  }
  writeMeta(meta);
  return trimmed;
}

export function removeMediaLibraryAlt(filename: string): void {
  setMediaLibraryAlt(filename, '');
}
