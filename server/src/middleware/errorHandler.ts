import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { env } from '../config/env.js';

export interface AppError extends Error {
  statusCode?: number;
}

const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      const isMediaRoute = req.originalUrl.includes('/upload/media');
      res.status(413).json({
        success: false,
        message: isMediaRoute
          ? 'File is too large. Story media uploads must be 50 MB or smaller.'
          : 'File is too large. Image uploads must be 5 MB or smaller.',
      });
      return;
    }
    res.status(400).json({
      success: false,
      message: err.message || 'Upload failed.',
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`❌ Error: ${message}`, err.stack);

  res.status(statusCode).json({
    success: false,
    message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export default errorHandler;
