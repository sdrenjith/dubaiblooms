import path from 'path';
import { fileURLToPath } from 'url';

/** Same folder `app.ts` serves via `express.static`. */
export const uploadsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'uploads');
