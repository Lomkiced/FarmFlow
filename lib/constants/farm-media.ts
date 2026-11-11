/**
 * Central Curated Farm Media & Profile Sanitization Helpers
 *
 * Authentic agricultural photography for marketing/auth pages ONLY, plus runtime
 * sanitization so legacy seeded Disneyland / wrong photos are treated as empty.
 */

export const AUTH_FARM_HERO_IMAGE =
  'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1600&q=80';

export const OUR_STORY_FARM_IMAGE =
  'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80';

export const ABOUT_SECONDARY_FARM_IMAGE =
  'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1400&q=80';

/**
 * Sanitizes profile avatar, cover photo, or document URLs.
 * Treats blank strings or legacy FARMER1 / FARMERLOG1 paths as `null` ("No Picture").
 */
export function sanitizeProfileImageUrl(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (trimmed === '') return null;
  if (trimmed.includes('FARMER1') || trimmed.includes('FARMERLOG1')) {
    return null;
  }
  return trimmed;
}

