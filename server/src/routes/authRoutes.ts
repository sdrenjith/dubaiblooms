import { Router } from 'express';
import { login, register, getMe, listUsers, updateMyProfile, requestPasswordReset, resetPasswordWithToken } from '../controllers/authController.js';
import { protect, adminOnly } from '../middleware/auth.js';

const router = Router();

router.post('/login', login);
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPasswordWithToken);
router.post('/register', protect, adminOnly, register);
router.get('/users', protect, adminOnly, listUsers);
router.patch('/me', protect, updateMyProfile);
router.get('/me', protect, getMe);

export default router;
