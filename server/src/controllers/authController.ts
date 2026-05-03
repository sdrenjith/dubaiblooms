import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AuthRequest } from '../middleware/auth.js';

const generateToken = (id: string): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
};

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
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const user = await User.create({ name, email, password, role: role || 'editor' });
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
