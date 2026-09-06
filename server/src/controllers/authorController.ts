import { Request, Response } from 'express';
import Article from '../models/Article.js';
import User from '../models/User.js';
import { isValidSlug } from '../utils/generateSlug.js';

const PUBLIC_AUTHOR_FIELDS = 'name slug bio avatar';

export const getAuthorBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const slug = String(req.params.slug || '')
      .trim()
      .toLowerCase();
    if (!isValidSlug(slug)) {
      res.status(404).json({ message: 'Author not found' });
      return;
    }

    const author = await User.findOne({ slug }).select(PUBLIC_AUTHOR_FIELDS).lean();
    if (!author) {
      res.status(404).json({ message: 'Author not found' });
      return;
    }

    const page = Math.max(1, parseInt(String(req.query.page || '1'), 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(String(req.query.limit || '24'), 10) || 24));
    const skip = (page - 1) * limit;

    const filter = { author: author._id, isPublished: true };
    const [articles, total] = await Promise.all([
      Article.find(filter)
        .populate('category', 'name slug image')
        .select('title slug excerpt featuredImage category publishedAt readingTime views')
        .sort({ publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Article.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: {
        author: {
          _id: String(author._id),
          name: author.name,
          slug: author.slug,
          bio: author.bio || '',
          avatar: author.avatar || '',
        },
        articles,
      },
      pagination: { page, limit, total, pages: Math.max(1, Math.ceil(total / limit)) },
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};
