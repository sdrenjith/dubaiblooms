import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import User from '../models/User.js';
import type { IUser } from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';
import { env, getPublicBaseUrl } from '../config/env.js';
import { generateSlug, isValidSlug, normalizeSlug } from '../utils/generateSlug.js';

const PUBLIC_PROFILE_SELECT = 'name email role slug bio avatar createdAt';

async function allocateUniqueSlug(base: string, excludeId?: unknown): Promise<string> {
  let candidate = base;
  let n = 1;
  while (await User.exists({ slug: candidate, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) {
    n += 1;
    candidate = `${base}-${n}`.slice(0, 120).replace(/-+$/g, '');
  }
  return candidate;
}

function slugBaseFromName(name: string, email: string): string {
  const fromName = generateSlug(name);
  if (isValidSlug(fromName)) {
    return fromName;
  }
  const fromEmail = generateSlug(email.split('@')[0] || '');
  if (isValidSlug(fromEmail)) {
    return fromEmail;
  }
  return 'author';
}

function serializeUser(user: {
  _id: unknown;
  name: string;
  email: string;
  role: string;
  slug?: string;
  bio?: string;
  avatar?: string;
}) {
  return {
    _id: String(user._id),
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    slug: user.slug || '',
    bio: user.bio || '',
    avatar: user.avatar || '',
  };
}

const generateToken = (id: string): string => {
  const options: SignOptions = {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  };
  return jwt.sign({ id }, env.JWT_SECRET, options);
};

const hashResetToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const GENERIC_RESET_MESSAGE =
  'If an account exists for that email, you can complete password reset using the link or token we issued.';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'Please provide email and password' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user._id.toString());
    res.json({
      success: true,
      data: {
        user: serializeUser(user),
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');
    const requestedRole = req.body?.role;
    const role: 'admin' | 'editor' =
      requestedRole === 'admin' || requestedRole === 'editor' ? requestedRole : 'editor';

    if (!name || !email) {
      res.status(400).json({ message: 'Name and email are required' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({ message: 'Valid email is required' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ message: 'Password must be at least 6 characters' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const slug = await allocateUniqueSlug(slugBaseFromName(name, email));
    const user = await User.create({ name, email, password, role, slug, bio: '', avatar: '' });
    res.status(201).json({
      success: true,
      data: { user: serializeUser(user) },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }
    res.set('Cache-Control', 'no-store');
    res.json({ success: true, data: { user: serializeUser(user) } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const listUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select(PUBLIC_PROFILE_SELECT).lean();
    res.json({
      success: true,
      data: users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        slug: u.slug || '',
        bio: u.bio || '',
        avatar: u.avatar || '',
        createdAt: u.createdAt,
      })),
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

type ProfileFieldsBody = {
  name?: string;
  slug?: string;
  bio?: string;
  avatar?: string;
};

function parseProfileFields(body: ProfileFieldsBody): {
  name?: string;
  slugProvided: boolean;
  slugRaw?: string;
  bioProvided: boolean;
  bio?: string;
  avatarProvided: boolean;
  avatar?: string;
  error?: string;
} {
  const nameRaw = body.name;
  const name = nameRaw !== undefined ? String(nameRaw).trim() : undefined;
  const slugProvided = body.slug !== undefined;
  const bioProvided = body.bio !== undefined;
  const avatarProvided = body.avatar !== undefined;
  const slugRaw = slugProvided ? normalizeSlug(String(body.slug || '')) : undefined;
  const bio = bioProvided ? String(body.bio ?? '').slice(0, 4000) : undefined;
  const avatar = avatarProvided ? String(body.avatar ?? '').trim() : undefined;

  if (name !== undefined && !name) {
    return { slugProvided, bioProvided, avatarProvided, error: 'Name cannot be empty' };
  }
  if (slugProvided && slugRaw !== undefined && slugRaw.length > 0 && !isValidSlug(slugRaw)) {
    return {
      name,
      slugProvided,
      slugRaw,
      bioProvided,
      bio,
      avatarProvided,
      avatar,
      error: 'Author slug must use lowercase letters, numbers, and hyphens',
    };
  }
  if (slugProvided && !slugRaw) {
    return {
      name,
      slugProvided,
      slugRaw,
      bioProvided,
      bio,
      avatarProvided,
      avatar,
      error: 'Author slug cannot be empty',
    };
  }

  return { name, slugProvided, slugRaw, bioProvided, bio, avatarProvided, avatar };
}

async function applyProfileFields(
  user: IUser,
  fields: ReturnType<typeof parseProfileFields>
): Promise<string | null> {
  if (fields.name !== undefined) {
    user.name = fields.name;
  }

  if (fields.slugProvided && fields.slugRaw) {
    const taken = await User.exists({ slug: fields.slugRaw, _id: { $ne: user._id } });
    if (taken) {
      return 'That author slug is already in use';
    }
    user.slug = fields.slugRaw;
  }

  if (fields.bioProvided && fields.bio !== undefined) {
    user.bio = fields.bio;
  }

  if (fields.avatarProvided && fields.avatar !== undefined) {
    user.avatar = fields.avatar;
  }

  return null;
}

export const updateMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const body = req.body as ProfileFieldsBody & {
      currentPassword?: string;
      newPassword?: string;
    };
    const fields = parseProfileFields(body);
    if (fields.error) {
      res.status(400).json({ message: fields.error });
      return;
    }

    const newPassword = body.newPassword !== undefined ? String(body.newPassword) : '';
    const currentPassword = body.currentPassword !== undefined ? String(body.currentPassword) : '';
    const wantsPasswordChange = newPassword.length > 0;
    if (wantsPasswordChange && newPassword.length < 6) {
      res.status(400).json({ message: 'New password must be at least 6 characters' });
      return;
    }

    const user = await User.findById(userId).select('+password');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (wantsPasswordChange) {
      if (!currentPassword) {
        res.status(400).json({ message: 'Current password is required to set a new password' });
        return;
      }
      const ok = await user.comparePassword(currentPassword);
      if (!ok) {
        res.status(400).json({ message: 'Current password is incorrect' });
        return;
      }
      user.password = newPassword;
    }

    const profileError = await applyProfileFields(user, fields);
    if (profileError) {
      res.status(400).json({ message: profileError });
      return;
    }

    if (
      !wantsPasswordChange &&
      fields.name === undefined &&
      !fields.slugProvided &&
      !fields.bioProvided &&
      !fields.avatarProvided
    ) {
      res.status(400).json({ message: 'Nothing to update' });
      return;
    }

    await user.save();

    const fresh = await User.findById(userId).select(PUBLIC_PROFILE_SELECT).lean();
    if (!fresh) {
      res.status(500).json({ message: 'Could not load updated user' });
      return;
    }

    res.set('Cache-Control', 'no-store');
    res.json({
      success: true,
      data: {
        user: serializeUser(fresh),
      },
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

/** Request a password reset (token logged server-side; in non-production, token is also returned for testing). */
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
  try {
    const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    if (!email) {
      res.status(400).json({ message: 'Email is required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.json({
        success: true,
        data: { message: GENERIC_RESET_MESSAGE },
      });
      return;
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = hashResetToken(rawToken);
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const clientBase = getPublicBaseUrl().replace(/\/$/, '');
    const resetUrl = `${clientBase}/admin/reset-password?token=${encodeURIComponent(rawToken)}`;
    console.info(`[password-reset] ${user.email} → ${resetUrl}`);

    const data: {
      message: string;
      resetToken?: string;
      resetUrl?: string;
    } = { message: GENERIC_RESET_MESSAGE };

    if (env.NODE_ENV !== 'production') {
      data.resetToken = rawToken;
      data.resetUrl = resetUrl;
    }

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const resetPasswordWithToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = typeof req.body?.token === 'string' ? req.body.token.trim() : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';
    if (!token || password.length < 6) {
      res.status(400).json({ message: 'Valid reset token and a new password (min 6 characters) are required' });
      return;
    }

    const hashed = hashResetToken(token);
    const user = await User.findOne({
      passwordResetToken: hashed,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      res.status(400).json({ message: 'Invalid or expired reset token' });
      return;
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      data: { message: 'Password updated. You can sign in with your new password.' },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
