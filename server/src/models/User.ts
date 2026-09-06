import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'editor';
  /** Public profile URL segment: /author/<slug> */
  slug?: string;
  /** Short public bio (plain text or light HTML). */
  bio?: string;
  /** Public profile image URL (upload path or absolute). */
  avatar?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'editor'], default: 'editor' },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
      unique: true,
      maxlength: 120,
    },
    bio: { type: String, default: '', maxlength: 4000 },
    avatar: { type: String, default: '', trim: true },
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    Reflect.deleteProperty(ret, 'password');
    Reflect.deleteProperty(ret, 'passwordResetToken');
    Reflect.deleteProperty(ret, 'passwordResetExpires');
    return ret;
  },
});

const User = mongoose.model<IUser>('User', userSchema);
export default User;
