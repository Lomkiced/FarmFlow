/**
 * Crop Image Map — Single Source of Truth (SSOT)
 *
 * Static, locally-bundled crop images for the farmer dashboard.
 * These images are stored in `/public/images/crops/` and served as
 * static assets — zero external network dependency, PWA-cacheable,
 * and resilient to third-party CDN outages (e.g., Unsplash 404s).
 *
 * Matches crop names using fuzzy substring search against the keys.
 * Add new entries here to extend recognition without touching UI code.
 */

/** Map of lowercase crop keyword → local static image path */
export const CROP_IMAGE_MAP: Record<string, string> = {
  rice: '/images/crops/rice.jpg',
  corn: '/images/crops/corn.jpg',
  tomato: '/images/crops/tomato.jpg',
  eggplant: '/images/crops/eggplant.jpg',
  talong: '/images/crops/eggplant.jpg',     // Filipino alias
  cabbage: '/images/crops/cabbage.jpg',
  repolyo: '/images/crops/cabbage.jpg',      // Filipino alias
  kangkong: '/images/crops/kangkong.jpg',
  ampalaya: '/images/crops/ampalaya.jpg',
  'bitter gourd': '/images/crops/ampalaya.jpg',
  'bitter melon': '/images/crops/ampalaya.jpg',
  kamote: '/images/crops/kamote.jpg',
  'sweet potato': '/images/crops/kamote.jpg',
  pechay: '/images/crops/pechay.jpg',
  'bok choy': '/images/crops/pechay.jpg',
  banana: '/images/crops/banana.jpg',
  saging: '/images/crops/banana.jpg',        // Filipino alias
  mango: '/images/crops/mango.jpg',
  mangga: '/images/crops/mango.jpg',         // Filipino alias
  coconut: '/images/crops/coconut.jpg',
  niyog: '/images/crops/coconut.jpg',        // Filipino alias
  garlic: '/images/crops/garlic.jpg',
  bawang: '/images/crops/garlic.jpg',        // Filipino alias
  onion: '/images/crops/onion.jpg',
  sibuyas: '/images/crops/onion.jpg',        // Filipino alias
  carrots: '/images/crops/carrots.jpg',
  carrot: '/images/crops/carrots.jpg',
} as const;

/** Default fallback image for crops that don't match any keyword */
export const GENERIC_CROP_IMAGE = '/images/crops/generic.jpg';

/**
 * Resolves the best-matching crop image path for a given crop name and variety.
 * Uses fuzzy substring matching against CROP_IMAGE_MAP keys.
 *
 * @param cropName - The crop's primary name (e.g., "Rice", "Ampalaya")
 * @param variety  - Optional variety string for secondary matching
 * @returns Local static image path (never an external URL)
 */
export function resolveCropImage(cropName: string, variety?: string | null): string {
  const searchTerms = [cropName.toLowerCase(), (variety || '').toLowerCase()];

  for (const term of searchTerms) {
    if (!term) continue;
    for (const [keyword, imagePath] of Object.entries(CROP_IMAGE_MAP)) {
      if (term.includes(keyword)) {
        return imagePath;
      }
    }
  }

  return GENERIC_CROP_IMAGE;
}
