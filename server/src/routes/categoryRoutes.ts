import { Router } from 'express';
import {
  getCategories,
  getCategoryBySlug,
  getCategoriesWithArticles,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

// Public routes
router.get('/with-articles', getCategoriesWithArticles);
router.get('/', getCategories);
router.get('/:slug', getCategoryBySlug);

// Protected routes
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
