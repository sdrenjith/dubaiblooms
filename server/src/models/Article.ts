import mongoose, { Schema, Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: string;
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
  };
  createdAt: Date;
  updatedAt: Date;
}

const articleSchema = new Schema<IArticle>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, index: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true, maxlength: 300 },
    featuredImage: { type: String, required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    tags: [{ type: String, trim: true }],
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    publishedAt: { type: Date, default: Date.now, index: true },
    isFeatured: { type: Boolean, default: false, index: true },
    isPublished: { type: Boolean, default: true },
    readingTime: { type: Number, default: 1 },
    views: { type: Number, default: 0 },
    seo: {
      metaTitle: { type: String, default: '' },
      metaDescription: { type: String, default: '' },
      ogImage: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

// Auto-generate slug from title
articleSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
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
