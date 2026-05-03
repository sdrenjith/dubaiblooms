import { Request, Response } from 'express';
import Category from '../models/Category.js';
import Article from '../models/Article.js';

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ order: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getCategoriesWithArticles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await Category.find().sort({ order: 1 }).lean();
    const result = await Promise.all(
      categories.map(async (cat) => {
        const articles = await Article.find({ category: cat._id, isPublished: true })
          .populate('category', 'name slug')
          .sort({ publishedAt: -1 })
          .limit(6)
          .lean();
        return { ...cat, articles };
      })
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.create(req.body);
    res.status(201).json({ success: true, data: category });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Category already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const articleCount = await Article.countDocuments({ category: req.params.id });
    if (articleCount > 0) {
      res.status(400).json({ message: `Cannot delete: ${articleCount} articles use this category` });
      return;
    }
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
