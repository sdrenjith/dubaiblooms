import { Request, Response } from 'express';
import Settings from '../models/Settings.js';

export const getSettings = async (_req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create(req.body);
    } else {
      Object.assign(settings, req.body);
      await settings.save();
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
