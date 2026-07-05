import mongoose, { Schema, Document } from 'mongoose';
import { generateSlug } from '../utils/generateSlug.js';
import { seoFieldsDefinition } from './seoFields.js';

export interface IArticleMedia {
  url: string;
  type: 'image' | 'video';
  alt: string;
  order: number;
}

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
  media: IArticleMedia[];
  category: mongoose.Types.ObjectId;
  tags: string[];
  author: mongoose.Types.ObjectId;
  publishedAt: Date;
  isFeatured: boolean;
  isPublished: boolean;
  readingTime: number;
  views: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
    keywords: string[];
    canonicalPath: string;
    noIndex: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true, maxlength: 600 },
    featuredImage: { type: String, required: true },
    media: {
      type: [
        {
          url: { type: String, required: true, trim: true },
          type: { type: String, enum: ['image', 'video'], required: true },
          alt: { type: String, default: '', trim: true, maxlength: 200 },
          order: { type: Number, default: 0 },
        },
      ],
      default: [],
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    tags: [{ type: String, trim: true }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date, default: Date.now, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true },
    readingTime: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
    seo: seoFieldsDefinition,
  },
  { timestamps: true }
);

// Auto-generate slug from title only when slug is empty (create / legacy rows)
articleSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = generateSlug(this.title);
  }
  // Calculate reading time (avg 200 words per minute)
  if (this.isModified('content')) {
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readingTime = Math.max(1, Math.ceil(wordCount / 200));
  }
  next();
});

const Article = mongoose.model<IArticle>('Article', articleSchema);
export default Article;
