import fs from 'fs';
import path from 'path';
import { Request, Response } from 'express';
import multer from 'multer';
import {
  getMediaLibraryAltMap,
  removeMediaLibraryAlt,
  setMediaLibraryAlt,
} from '../lib/mediaLibraryMeta.js';
import { uploadsDir } from '../lib/uploadsDir.js';

/** Same folder `app.ts` serves via `express.static` — avoids `process.cwd()` when the server is not started from `server/`. */
export { uploadsDir };

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const imageMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/x-icon',
  'image/vnd.microsoft.icon',
];
const videoMimeTypes = ['video/mp4', 'video/webm', 'video/quicktime', 'video/ogg'];

const imageFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (imageMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, SVG, and ICO are allowed.'));
  }
};

const mediaFileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (imageMimeTypes.includes(file.mimetype) || videoMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WebP) and videos (MP4, WebM, MOV, OGG) are allowed.'));
  }
};

export const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

export const uploadMedia = multer({
  storage,
  fileFilter: mediaFileFilter,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

function inferMediaTypeFromFilename(filename: string): 'image' | 'video' {
  const ext = path.extname(filename).toLowerCase();
  if (['.mp4', '.webm', '.mov', '.ogg', '.m4v'].includes(ext)) {
    return 'video';
  }
  return 'image';
}

/** Accept `/uploads/name.ext` or `name.ext`; reject path traversal. */
export function resolveSafeUploadFilename(input: string): string | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }
  const withoutPrefix = trimmed.replace(/^\/uploads\//, '');
  const base = path.basename(withoutPrefix);
  if (!base || base !== withoutPrefix || base.includes('..') || base.includes('/') || base.includes('\\')) {
    return null;
  }
  return base;
}

function resolveUploadFilePath(filename: string): string | null {
  const safe = resolveSafeUploadFilename(filename);
  if (!safe) {
    return null;
  }
  const filePath = path.join(uploadsDir, safe);
  const normalizedUploads = path.resolve(uploadsDir);
  const normalizedFile = path.resolve(filePath);
  if (!normalizedFile.startsWith(`${normalizedUploads}${path.sep}`) && normalizedFile !== normalizedUploads) {
    return null;
  }
  return normalizedFile;
}

export const uploadImage = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, data: { url, filename: req.file.filename, type: 'image' as const } });
};

export const uploadMediaFile = (req: Request, res: Response): void => {
  if (!req.file) {
    res.status(400).json({ message: 'No file uploaded' });
    return;
  }
  const type = inferMediaTypeFromFilename(req.file.filename);
  const url = `/uploads/${req.file.filename}`;
  res.json({ success: true, data: { url, filename: req.file.filename, type } });
};

export const listMediaLibrary = (_req: Request, res: Response): void => {
  try {
    if (!fs.existsSync(uploadsDir)) {
      res.json({ success: true, data: [] });
      return;
    }

    const altByFilename = getMediaLibraryAltMap();

    const entries = fs
      .readdirSync(uploadsDir)
      .map((filename) => {
        if (filename === '.media-alt.json') {
          return null;
        }
        const filePath = path.join(uploadsDir, filename);
        try {
          const stat = fs.statSync(filePath);
          if (!stat.isFile()) {
            return null;
          }
          return {
            url: `/uploads/${filename}`,
            filename,
            type: inferMediaTypeFromFilename(filename),
            createdAt: stat.birthtime.toISOString(),
            size: stat.size,
            alt: altByFilename[filename] || '',
          };
        } catch {
          return null;
        }
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ success: true, data: entries });
  } catch {
    res.status(500).json({ message: 'Unable to load media library' });
  }
};

export const deleteMediaFile = (req: Request, res: Response): void => {
  try {
    const raw = req.params.filename;
    const filename = resolveSafeUploadFilename(Array.isArray(raw) ? raw[0] || '' : raw || '');
    if (!filename) {
      res.status(400).json({ message: 'Invalid file name' });
      return;
    }

    const filePath = resolveUploadFilePath(filename);
    if (!filePath) {
      res.status(400).json({ message: 'Invalid file path' });
      return;
    }

    if (!fs.existsSync(filePath)) {
      res.status(404).json({ message: 'File not found in the library' });
      return;
    }

    const stat = fs.statSync(filePath);
    if (!stat.isFile()) {
      res.status(400).json({ message: 'Not a file' });
      return;
    }

    fs.unlinkSync(filePath);
    removeMediaLibraryAlt(filename);
    res.json({
      success: true,
      data: { url: `/uploads/${filename}`, filename },
      message: 'File removed from the library',
    });
  } catch {
    res.status(500).json({ message: 'Unable to delete file' });
  }
};

export const updateMediaLibraryAlt = (req: Request, res: Response): void => {
  try {
    const raw = req.params.filename;
    const filename = resolveSafeUploadFilename(Array.isArray(raw) ? raw[0] || '' : raw || '');
    if (!filename) {
      res.status(400).json({ message: 'Invalid file name' });
      return;
    }

    const filePath = resolveUploadFilePath(filename);
    if (!filePath || !fs.existsSync(filePath)) {
      res.status(404).json({ message: 'File not found in the library' });
      return;
    }

    const body = req.body as { alt?: unknown };
    const alt = typeof body.alt === 'string' ? body.alt : '';
    const saved = setMediaLibraryAlt(filename, alt);

    res.json({
      success: true,
      data: { url: `/uploads/${filename}`, filename, alt: saved },
      message: 'Alt text saved',
    });
  } catch {
    res.status(500).json({ message: 'Unable to save alt text' });
  }
};
