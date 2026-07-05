import fs from 'fs';
import { Request, Response, NextFunction } from 'express';
import { resolveSpaRoute } from '../services/spaRouteResolver.js';

export function createSpaFallback(indexHtmlPath: string) {
  if (!fs.existsSync(indexHtmlPath)) {
    console.warn(`SPA fallback disabled: index.html not found at ${indexHtmlPath}`);
    return (_req: Request, _res: Response, next: NextFunction) => next();
  }

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      next();
      return;
    }

    try {
      const status = await resolveSpaRoute(req.path);

      if (req.method === 'HEAD') {
        res.sendStatus(status);
        return;
      }

      res.status(status).sendFile(indexHtmlPath);
    } catch (error) {
      next(error);
    }
  };
}
