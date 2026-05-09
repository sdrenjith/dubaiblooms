import crypto from 'crypto';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
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

    const token = generateToken(user._id as string);
    res.json({
      success: true,
      data: {
        user: { id: user._id, name: user.name, email: user.email, role: user.role },
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

    const user = await User.create({ name, email, password, role });
    res.status(201).json({
      success: true,
      data: { user: { id: user._id, name: user.name, email: user.email, role: user.role } },
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
    res.json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const listUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).select('name email role createdAt').lean();
    res.json({
      success: true,
      data: users.map((u) => ({
        id: String(u._id),
        name: u.name,
        email: u.email,
        role: u.role,
        createdAt: u.createdAt,
      })),
    });
  } catch {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateMyProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    const body = req.body as { name?: string; currentPassword?: string; newPassword?: string };
    const nameRaw = body.name;
    const name = nameRaw !== undefined ? String(nameRaw).trim() : undefined;
    const newPassword = body.newPassword !== undefined ? String(body.newPassword) : '';
    const currentPassword = body.currentPassword !== undefined ? String(body.currentPassword) : '';

    if (name !== undefined && !name) {
      res.status(400).json({ message: 'Name cannot be empty' });
      return;
    }

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

    if (name !== undefined) {
      user.name = name;
    }

    if (!wantsPasswordChange && name === undefined) {
      res.status(400).json({ message: 'Nothing to update' });
      return;
    }

    await user.save();

    const fresh = await User.findById(userId).select('-password').lean();
    if (!fresh) {
      res.status(500).json({ message: 'Could not load updated user' });
      return;
    }

    res.json({
      success: true,
      data: {
        user: {
          _id: String(fresh._id),
          name: fresh.name,
          email: fresh.email,
          role: fresh.role,
        },
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

    const clientBase = (process.env.CLIENT_URL || 'http://localhost:5173').replace(/\/$/, '');
    const resetUrl = `${clientBase}/admin/reset-password?token=${encodeURIComponent(rawToken)}`;
    console.info(`[password-reset] ${user.email} → ${resetUrl}`);

    const data: {
      message: string;
      resetToken?: string;
      resetUrl?: string;
    } = { message: GENERIC_RESET_MESSAGE };

    if (process.env.NODE_ENV !== 'production') {
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
