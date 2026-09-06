import User from '../models/User.js';
import { generateSlug, isValidSlug } from '../utils/generateSlug.js';

const DEFAULT_ADMIN_BIO =
  'Editor at Dubai Blooms covering news, culture, food, and city life across the UAE.';

async function uniqueSlugForUser(base: string, excludeId: unknown): Promise<string> {
  let candidate = base;
  let n = 1;
  while (await User.exists({ slug: candidate, _id: { $ne: excludeId } })) {
    n += 1;
    candidate = `${base}-${n}`.slice(0, 120).replace(/-+$/g, '');
  }
  return candidate;
}

function slugFromUser(name: string, email: string): string {
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

/** Backfill public profile slug (and a default bio for the seed admin) for existing users. */
export async function ensureAuthorProfiles(): Promise<void> {
  const users = await User.find().select('name email slug bio role').lean();
  let updated = 0;

  for (const row of users) {
    const patch: { slug?: string; bio?: string } = {};
    const existingSlug = typeof row.slug === 'string' ? row.slug.trim().toLowerCase() : '';

    if (!isValidSlug(existingSlug)) {
      const base = slugFromUser(row.name || '', row.email || '');
      patch.slug = await uniqueSlugForUser(base, row._id);
    }

    const isSeedAdmin =
      row.role === 'admin' && String(row.email || '').toLowerCase() === 'admin@dubaiblooms.com';
    if (isSeedAdmin && !(typeof row.bio === 'string' && row.bio.trim())) {
      patch.bio = DEFAULT_ADMIN_BIO;
    }

    if (Object.keys(patch).length === 0) {
      continue;
    }

    await User.updateOne({ _id: row._id }, { $set: patch });
    updated += 1;
  }

  if (updated > 0) {
    console.log(`✅ Author profiles backfilled for ${updated} user(s).`);
  }
}
