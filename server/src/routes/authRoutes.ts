import { Router } from 'express';
import { login, register, getMe } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/register', protect, adminOnly, register);
router.get('/me', protect, getMe);

export default router;
