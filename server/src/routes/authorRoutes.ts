import { Router } from 'express';
import { getAuthorBySlug } from '../controllers/authorController.js';

const router = Router();

router.get('/:slug', getAuthorBySlug);

export default router;
