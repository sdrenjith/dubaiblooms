import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import {
  deleteMediaFile,
  listMediaLibrary,
  updateMediaLibraryAlt,
  upload,
  uploadImage,
  uploadMedia,
  uploadMediaFile,
} from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

function runUpload(
  uploader: multer.Multer,
  field: string,
  handler: (req: Request, res: Response) => void
) {
  return (req: Request, res: Response, next: NextFunction): void => {
    uploader.single(field)(req, res, (err: unknown) => {
      if (err) {
        next(err);
        return;
      }
      handler(req, res);
    });
  };
}

router.get('/library', protect, listMediaLibrary);
router.patch('/:filename/alt', protect, updateMediaLibraryAlt);
router.delete('/:filename', protect, deleteMediaFile);
router.post('/', protect, runUpload(upload, 'image', uploadImage));
router.post('/media', protect, runUpload(uploadMedia, 'file', uploadMediaFile));

export default router;
