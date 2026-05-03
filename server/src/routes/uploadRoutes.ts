import { Router } from 'express';
import { upload, uploadImage } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.post('/', protect, upload.single('image'), uploadImage);

export default router;
