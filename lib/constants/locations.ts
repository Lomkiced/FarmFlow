/**
 * Official geographic reference data for the Municipality of Agoo, La Union, Philippines.
 * 
 * Sources:
 * - Philippine Statistics Authority (PSA) - Philippine Standard Geographic Code (PSGC: 013301000)
 * - Municipality of Agoo Official Records / PhilAtlas (49 Legal Barangays)
 */

export const MUNICIPALITY_NAME = 'Agoo' as const;
export const PROVINCE_NAME = 'La Union' as const;
export const POSTAL_CODE = '2504' as const;
export const PSGC_CODE = '013301000' as const;

export const AGOO_BARANGAYS = [
  'Ambitacay',
  'Balawarte',
  'Capas',
  'Consolacion (Poblacion)',
  'Macalva Central',
  'Macalva Norte',
  'Macalva Sur',
  'Nazareno',
  'Purok',
  'San Agustin East',
  'San Agustin Norte',
  'San Agustin Sur',
  'San Antonino',
  'San Antonio',
  'San Francisco',
  'San Isidro',
  'San Joaquin Norte',
  'San Joaquin Sur',
  'San Jose Norte',
  'San Jose Sur',
  'San Juan',
  'San Julian Central',
  'San Julian East',
  'San Julian Norte',
  'San Julian West',
  'San Manuel Norte',
  'San Manuel Sur',
  'San Marcos',
  'San Miguel',
  'San Nicolas Central (Poblacion)',
  'San Nicolas East',
  'San Nicolas Norte (Poblacion)',
  'San Nicolas Sur (Poblacion)',
  'San Nicolas West',
  'San Pedro',
  'San Roque East',
  'San Roque West',
  'San Vicente Norte',
  'San Vicente Sur',
  'Santa Ana',
  'Santa Barbara (Poblacion)',
  'Santa Fe',
  'Santa Maria',
  'Santa Monica',
  'Santa Rita (Nalinac)',
  'Santa Rita East',
  'Santa Rita Norte',
  'Santa Rita Sur',
  'Santa Rita West',
] as const;

export type AgooBarangay = (typeof AGOO_BARANGAYS)[number];

/**
 * Checks if a string matches one of the canonical 49 Agoo barangays.
 */
export function isValidAgooBarangay(name: unknown): name is AgooBarangay {
  if (typeof name !== 'string') return false;
  return AGOO_BARANGAYS.includes(name as AgooBarangay);
}

/**
 * Normalizes legacy, abbreviated, or alternate spellings to their canonical Agoo barangay name.
 * Useful for backwards compatibility with test seeds or legacy records.
 */
export function normalizeBarangayName(input: string): AgooBarangay | string {
  const trimmed = input.trim();
  if (isValidAgooBarangay(trimmed)) return trimmed;

  const lower = trimmed.toLowerCase();
  
  // Normalization dictionary for common abbreviations/aliases
  const aliasMap: Record<string, AgooBarangay> = {
    'consolacion': 'Consolacion (Poblacion)',
    'san nicolas': 'San Nicolas Central (Poblacion)',
    'san nicolas central': 'San Nicolas Central (Poblacion)',
    'san nicolas norte': 'San Nicolas Norte (Poblacion)',
    'san nicolas sur': 'San Nicolas Sur (Poblacion)',
    'santa barbara': 'Santa Barbara (Poblacion)',
    'sta. barbara': 'Santa Barbara (Poblacion)',
    'sta barbara': 'Santa Barbara (Poblacion)',
    'santa rita': 'Santa Rita (Nalinac)',
    'sta. rita': 'Santa Rita (Nalinac)',
    'sta rita': 'Santa Rita (Nalinac)',
    'san vicente': 'San Vicente Norte',
    'san roque': 'San Roque East',
    'san agustin': 'San Agustin East',
    'san joaquin': 'San Joaquin Norte',
    'san jose': 'San Jose Norte',
    'san julian': 'San Julian Central',
    'san manuel': 'San Manuel Norte',
    'macalva': 'Macalva Central',
  };

  return aliasMap[lower] ?? trimmed;
}
