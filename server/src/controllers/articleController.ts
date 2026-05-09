import { Request, Response } from 'express';
import Article from '../models/Article.js';
import Settings from '../models/Settings.js';
import { AuthRequest } from '../middleware/auth.js';

export const getArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const filter: any = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.featured === 'true') filter.isFeatured = true;
    if (req.query.tag) filter.tags = { $in: [req.query.tag] };

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('category', 'name slug image')
        .populate('author', 'name')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFeaturedArticles = async (_req: Request, res: Response): Promise<void> => {
  try {
    const articles = await Article.find({ isPublished: true, isFeatured: true })
      .populate('category', 'name slug image')
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(14)
      .lean();

    res.json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getArticleBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const article = await Article.findOneAndUpdate(
      { slug: req.params.slug, isPublished: true },
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('category', 'name slug image')
      .populate('author', 'name');

    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }

    const settings = await Settings.findOne().lean();
    const relatedLimit = Math.min(24, Math.max(2, settings?.listing?.cardsPerPage ?? 4));

    const related = await Article.find({
      category: article.category._id,
      _id: { $ne: article._id },
      isPublished: true,
    })
      .populate('category', 'name slug image')
      .sort({ publishedAt: -1 })
      .limit(relatedLimit)
      .lean();

    res.json({ success: true, data: { article, related } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getArticlesByCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // First find the category by slug
    const Category = (await import('../models/Category.js')).default;
    const category = await Category.findOne({ slug: req.params.categorySlug });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }

    const filter = { category: category._id, isPublished: true };
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('category', 'name slug image')
        .populate('author', 'name')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: { category, articles },
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const searchArticles = async (req: Request, res: Response): Promise<void> => {
  try {
    const q = (req.query.q as string) || '';
    if (!q.trim()) {
      res.json({ success: true, data: [] });
      return;
    }

    const articles = await Article.find({
      isPublished: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
      ],
    })
      .populate('category', 'name slug image')
      .populate('author', 'name')
      .sort({ publishedAt: -1 })
      .limit(20)
      .lean();

    res.json({ success: true, data: articles });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin CRUD
export const createArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const article = await Article.create({ ...req.body, author: req.user!._id });
    await article.populate('category', 'name slug image');
    await article.populate('author', 'name');
    res.status(201).json({ success: true, data: article });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'An article with this title already exists' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const article = await Article.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('category', 'name slug image')
      .populate('author', 'name');

    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }

    res.json({ success: true, data: article });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteArticle = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const article = await Article.findByIdAndDelete(req.params.id);
    if (!article) {
      res.status(404).json({ message: 'Article not found' });
      return;
    }
    res.json({ success: true, message: 'Article deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAllArticlesAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      Article.find()
        .populate('category', 'name slug image')
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(),
    ]);

    res.json({
      success: true,
      data: articles,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const Category = (await import('../models/Category.js')).default;
    const [totalArticles, publishedArticles, featuredArticles, totalCategories, totalViews] =
      await Promise.all([
        Article.countDocuments(),
        Article.countDocuments({ isPublished: true }),
        Article.countDocuments({ isFeatured: true }),
        Category.countDocuments(),
        Article.aggregate([{ $group: { _id: null, total: { $sum: '$views' } } }]),
      ]);

    const recentArticles = await Article.find()
      .populate('category', 'name slug image')
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    res.json({
      success: true,
      data: {
        stats: {
          totalArticles,
          publishedArticles,
          featuredArticles,
          totalCategories,
          totalViews: totalViews[0]?.total || 0,
        },
        recentArticles,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
