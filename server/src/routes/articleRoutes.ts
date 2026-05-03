import { Router } from 'express';
import {
  getArticles,
  getFeaturedArticles,
  getArticleBySlug,
  getArticlesByCategory,
  searchArticles,
  createArticle,
  updateArticle,
  deleteArticle,
  getAllArticlesAdmin,
  getDashboardStats,
} from '../controllers/articleController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/search', searchArticles);
router.get('/featured', getFeaturedArticles);
router.get('/category/:categorySlug', getArticlesByCategory);
router.get('/', getArticles);
router.get('/:slug', getArticleBySlug);

// Protected routes
router.get('/admin/all', protect, getAllArticlesAdmin);
router.get('/admin/stats', protect, getDashboardStats);
router.post('/', protect, createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

export default router;
