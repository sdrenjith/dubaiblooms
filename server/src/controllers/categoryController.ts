import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Category from '../models/Category.js';
import Article from '../models/Article.js';
import { isValidSlug, normalizeSlug } from '../utils/generateSlug.js';

/** Parse checkbox / JSON booleans; when key absent, caller should not mutate. */
function parseShowInMainMenu(raw: Record<string, unknown>): boolean | undefined {
  if (!Object.prototype.hasOwnProperty.call(raw, 'showInMainMenu')) {
    return undefined;
  }
  const v = raw.showInMainMenu;
  if (typeof v === 'boolean') {
    return v;
  }
  if (v === 'true' || v === 1 || v === '1') {
    return true;
  }
  if (v === 'false' || v === 0 || v === '0') {
    return false;
  }
  return undefined;
}

function applySeoFields(category: { get: (key: string) => unknown; set: (key: string, value: unknown) => void; markModified: (key: string) => void }, raw: unknown): void {
  if (raw === undefined || raw === null || typeof raw !== 'object' || Array.isArray(raw)) {
    return;
  }
  const seo = raw as Record<string, unknown>;
  const existing =
    category.get('seo') && typeof category.get('seo') === 'object'
      ? (category.get('seo') as Record<string, unknown>)
      : {};
  category.set('seo', {
    ...existing,
    ...(typeof seo.metaTitle === 'string' ? { metaTitle: seo.metaTitle.trim().slice(0, 90) } : {}),
    ...(typeof seo.metaDescription === 'string'
      ? { metaDescription: seo.metaDescription.trim().slice(0, 180) }
      : {}),
    ...(typeof seo.ogImage === 'string' ? { ogImage: seo.ogImage.trim() } : {}),
    ...(Array.isArray(seo.keywords)
      ? {
          keywords: seo.keywords
            .map((k) => String(k).trim())
            .filter(Boolean)
            .slice(0, 20),
        }
      : {}),
    ...(typeof seo.canonicalPath === 'string' ? { canonicalPath: seo.canonicalPath.trim() } : {}),
    ...(typeof seo.noIndex === 'boolean' ? { noIndex: seo.noIndex } : {}),
  });
  category.markModified('seo');
}

/** Nav visibility: BSON may omit legacy rows; explicitly false hides. Always send a boolean in JSON. */
function categoryJsonForApi(doc: unknown): Record<string, unknown> {
  const d =
    typeof doc === 'object' && doc !== null && !Array.isArray(doc) ? (doc as Record<string, unknown>) : {};
  return {
    ...d,
    showInMainMenu: d.showInMainMenu !== false,
  };
}

function mongoErrMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message;
  }
  return 'Server error';
}

export const getCategories = async (_req: Request, res: Response): Promise<void> => {
  try {
    if (mongoose.connection.readyState !== 1) {
      res.status(503).json({
        success: false,
        message: `Database not connected (readyState=${mongoose.connection.readyState}). Check MONGODB_URI and that MongoDB is running.`,
      });
      return;
    }
    const categories = await Category.find().sort({ order: 1 }).lean();
    res.json({
      success: true,
      data: categories.map((c) => categoryJsonForApi(c)),
    });
  } catch (error) {
    console.error('getCategories', error);
    res.status(500).json({ success: false, message: mongoErrMessage(error) });
  }
};

export const getCategoryBySlug = async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await Category.findOne({ slug: req.params.slug });
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    res.json({ success: true, data: categoryJsonForApi(category.toObject()) });
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
        return { ...categoryJsonForApi(cat), articles };
      })
    );
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const createCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim() : '';
    if (!name) {
      res.status(400).json({ message: 'Name is required' });
      return;
    }
    const description = typeof body.description === 'string' ? body.description : '';
    const image = typeof body.image === 'string' ? body.image : '';
    const orderNum = Number(body.order);
    const order = Number.isFinite(orderNum) ? orderNum : 0;

    const menuParsed = parseShowInMainMenu(body);
    /** New desks default to hidden unless the client asks to show. */
    const showInMainMenu = menuParsed !== undefined ? menuParsed : false;

    const category = await Category.create({
      name,
      description,
      image,
      order,
      showInMainMenu,
    });

    await Category.updateOne({ _id: category._id }, { $set: { showInMainMenu } });

    const fresh = await Category.findById(category._id).lean();
    const base = fresh ?? category.toObject();
    res.status(201).json({ success: true, data: categoryJsonForApi(base) });
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
    const category = await Category.findById(req.params.id);
    if (!category) {
      res.status(404).json({ message: 'Category not found' });
      return;
    }
    const body = req.body as Record<string, unknown>;
    const { name, description, image, order, slug: slugRaw } = body as {
      name?: string;
      description?: string;
      image?: string;
      order?: unknown;
      slug?: string;
    };
    const parsedMenuFlag = parseShowInMainMenu(body);

    if (typeof name === 'string' && name.trim()) {
      category.name = name.trim();
    }
    if (Object.prototype.hasOwnProperty.call(body, 'slug')) {
      const normalized = normalizeSlug(typeof slugRaw === 'string' ? slugRaw : '');
      if (!isValidSlug(normalized)) {
        res.status(400).json({ message: 'Invalid URL slug. Use lowercase letters, numbers, and hyphens.' });
        return;
      }
      const existing = await Category.findOne({ slug: normalized, _id: { $ne: category._id } });
      if (existing) {
        res.status(400).json({ message: 'This URL slug is already in use by another category' });
        return;
      }
      category.slug = normalized;
    }
    if (typeof description === 'string') {
      category.description = description;
    }
    if (typeof image === 'string') {
      category.image = image;
    }
    if (order !== undefined && order !== null && !Number.isNaN(Number(order))) {
      category.order = Number(order);
    }
    if (parsedMenuFlag !== undefined) {
      category.set('showInMainMenu', parsedMenuFlag);
      category.markModified('showInMainMenu');
    }
    if (Object.prototype.hasOwnProperty.call(body, 'seo')) {
      applySeoFields(category, body.seo);
    }
    await category.save();

    /** Ensure `false` is written and returned reliably (mongoose edge cases around optional booleans). */
    if (parsedMenuFlag !== undefined) {
      await Category.updateOne({ _id: category._id }, { $set: { showInMainMenu: parsedMenuFlag } });
    }

    const fresh = await Category.findById(category._id).lean();
    if (!fresh) {
      res.status(500).json({ message: 'Category not found after update' });
      return;
    }
    res.json({ success: true, data: categoryJsonForApi(fresh) });
  } catch (error: any) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'This URL slug is already in use' });
      return;
    }
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteCategory = async (req: Request, res: Response): Promise<void> => {
  try {
    const articleCount = await Article.countDocuments({ category: req.params.id });
    if (articleCount > 0) {
      const noun = articleCount === 1 ? 'story is' : 'stories are';
      res.status(400).json({
        message: `Cannot delete this category: ${articleCount} ${noun} still assigned. Delete all stories in this category first.`,
      });
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
