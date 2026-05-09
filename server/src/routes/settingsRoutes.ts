import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  updateHomepageSection,
  subscribeNewsletter,
  getSubscribers,
} from '../controllers/settingsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/', getSettings);
router.post('/subscribe', subscribeNewsletter);
router.get('/subscribers', protect, getSubscribers);
router.put('/homepage/sections/:sectionIndex', protect, updateHomepageSection);
router.put('/', protect, updateSettings);

export default router;
