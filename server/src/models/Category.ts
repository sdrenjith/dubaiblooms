import mongoose, { Schema, Document } from 'mongoose';
import { generateSlug } from '../utils/generateSlug.js';
import { seoFieldsDefinition } from './seoFields.js';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogImage: string;
    keywords: string[];
    canonicalPath: string;
    noIndex: boolean;
  };
  /** When false, hide from site header/footer category links. Omitted on old rows behaves as shown until saved. */
  showInMainMenu?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    order: { type: Number, default: 0 },
    showInMainMenu: { type: Boolean, default: false },
    seo: seoFieldsDefinition,
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = generateSlug(this.name);
  }
  next();
});

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
