import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
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
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  if (this.isModified('name') || !this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const Category = mongoose.model<ICategory>('Category', categorySchema);
export default Category;
