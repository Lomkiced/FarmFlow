/**
 * Strict Philippine KYC & Government ID Matching System for FarmFlow
 * Supports RSBSA_ID, PHILSYS_NATIONAL_ID, DRIVERS_LICENSE, PASSPORT, TIN_ID, POSTAL_ID, VOTERS_ID
 */

export type KycIdTypeCode =
  | 'RSBSA_ID'
  | 'PHILSYS_NATIONAL_ID'
  | 'DRIVERS_LICENSE'
  | 'PASSPORT'
  | 'TIN_ID'
  | 'POSTAL_ID'
  | 'VOTERS_ID';

export interface KycIdTypeSpec {
  code: KycIdTypeCode;
  label: string;
  shortLabel: string;
  placeholder: string;
  example: string;
  formatHint: string;
  regex: RegExp;
  maskInput: (raw: string) => string;
}

/**
 * Formats an RSBSA number into XX-XX-XX-XXX-XXXXXX (14 digits total)
 * Example: 01-33-02-001-000123 (01 = Region 1, 33 = La Union, 02 = Agoo)
 */
export function formatRsbsaNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 14);
  const parts: string[] = [];
  if (digits.length > 0) parts.push(digits.slice(0, 2));
  if (digits.length > 2) parts.push(digits.slice(2, 4));
  if (digits.length > 4) parts.push(digits.slice(4, 6));
  if (digits.length > 6) parts.push(digits.slice(6, 9));
  if (digits.length > 9) parts.push(digits.slice(9, 15));
  return parts.join('-');
}

export const RSBSA_REGEX = /^\d{2}-\d{2}-\d{2}-\d{3}-\d{6}$/;

export function isValidRsbsaNumber(val: string): boolean {
  return RSBSA_REGEX.test(val.trim());
}

export const KYC_ID_SPECS: Record<KycIdTypeCode, KycIdTypeSpec> = {
  RSBSA_ID: {
    code: 'RSBSA_ID',
    label: 'RSBSA Farmer ID (DA Registry)',
    shortLabel: 'RSBSA ID',
    placeholder: '01-33-02-001-000123',
    example: '01-33-02-001-000123 (Region I / La Union)',
    formatHint: 'Format: XX-XX-XX-XXX-XXXXXX (14 digits)',
    regex: RSBSA_REGEX,
    maskInput: formatRsbsaNumber,
  },
  PHILSYS_NATIONAL_ID: {
    code: 'PHILSYS_NATIONAL_ID',
    label: 'PhilSys National ID (ePhilID / PSN)',
    shortLabel: 'PhilSys ID',
    placeholder: '1234-5678-9012-3456',
    example: '1234-5678-9012-3456 (16-digit PSN) or 1234-5678-9012 (12-digit PCN)',
    formatHint: 'Format: XXXX-XXXX-XXXX-XXXX (16 digits) or XXXX-XXXX-XXXX (12 digits)',
    regex: /^(\d{4}-\d{4}-\d{4}-\d{4}|\d{4}-\d{4}-\d{4})$/,
    maskInput: (raw: string) => {
      const digits = raw.replace(/\D/g, '').slice(0, 16);
      const groups = digits.match(/.{1,4}/g);
      return groups ? groups.join('-') : '';
    },
  },
  DRIVERS_LICENSE: {
    code: 'DRIVERS_LICENSE',
    label: "Driver's License (LTO)",
    shortLabel: "Driver's License",
    placeholder: 'A01-23-456789',
    example: 'A01-23-456789',
    formatHint: 'Format: X00-00-000000 (1 Letter + 10 Digits)',
    regex: /^[A-Z]\d{2}-\d{2}-\d{6}$/,
    maskInput: (raw: string) => {
      const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (!cleaned) return '';
      const firstLetter = cleaned.charAt(0).replace(/[^A-Z]/g, '');
      const restDigits = cleaned.slice(firstLetter ? 1 : 0).replace(/\D/g, '').slice(0, 10);
      const base = firstLetter + restDigits;
      if (base.length <= 3) return base;
      if (base.length <= 5) return `${base.slice(0, 3)}-${base.slice(3)}`;
      return `${base.slice(0, 3)}-${base.slice(3, 5)}-${base.slice(5, 11)}`;
    },
  },
  PASSPORT: {
    code: 'PASSPORT',
    label: 'Philippine Passport (DFA)',
    shortLabel: 'Passport',
    placeholder: 'P1234567A',
    example: 'P1234567A or P12345678',
    formatHint: 'Format: P0000000A or P00000000',
    regex: /^P\d{7}[A-Z0-9]$/,
    maskInput: (raw: string) => {
      const cleaned = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 9);
      if (!cleaned) return '';
      const rest = cleaned.startsWith('P') ? cleaned.slice(1) : cleaned;
      const midDigits = rest.slice(0, 7).replace(/\D/g, '');
      const lastChar = rest.length > 7 ? rest.slice(7, 8).replace(/[^A-Z0-9]/g, '') : '';
      return `P${midDigits}${lastChar}`;
    },
  },
  TIN_ID: {
    code: 'TIN_ID',
    label: 'BIR TIN ID',
    shortLabel: 'TIN ID',
    placeholder: '123-456-789-000',
    example: '123-456-789-000',
    formatHint: 'Format: 000-000-000-000 (9 to 12 digits)',
    regex: /^\d{3}-\d{3}-\d{3}(-\d{3})?$/,
    maskInput: (raw: string) => {
      const digits = raw.replace(/\D/g, '').slice(0, 12);
      const groups = digits.match(/.{1,3}/g);
      return groups ? groups.join('-') : '';
    },
  },
  POSTAL_ID: {
    code: 'POSTAL_ID',
    label: 'Philippine Postal ID (PRN)',
    shortLabel: 'Postal ID',
    placeholder: 'PRN-1234-5678-9012',
    example: 'PRN-1234-5678-9012',
    formatHint: 'Format: PRN-XXXX-XXXX-XXXX (12 digits)',
    regex: /^(PRN-)?\d{4}-\d{4}-\d{4}$/,
    maskInput: (raw: string) => {
      const digits = raw.replace(/\D/g, '').slice(0, 12);
      if (!digits) return '';
      const groups = digits.match(/.{1,4}/g);
      return groups ? `PRN-${groups.join('-')}` : '';
    },
  },
  VOTERS_ID: {
    code: 'VOTERS_ID',
    label: "Voter's ID / COMELEC VIN",
    shortLabel: "Voter's ID",
    placeholder: '3302-0012A-B1234JDC10000',
    example: '3302-0012A-B1234JDC10000 or 12+ character VIN',
    formatHint: 'Format: COMELEC VIN (at least 10 alphanumeric characters)',
    regex: /^[A-Z0-9-]{10,28}$/,
    maskInput: (raw: string) => raw.toUpperCase().replace(/[^A-Z0-9-]/g, '').slice(0, 26),
  },
};

export const KYC_ID_OPTIONS = Object.values(KYC_ID_SPECS);

/**
 * Resolves any legacy label or enum code to a KycIdTypeSpec
 */
export function getKycIdSpec(idTypeInput?: string | null): KycIdTypeSpec {
  if (!idTypeInput) return KYC_ID_SPECS.PHILSYS_NATIONAL_ID;
  const upper = idTypeInput.trim().toUpperCase();
  if (upper in KYC_ID_SPECS) {
    return KYC_ID_SPECS[upper as KycIdTypeCode];
  }
  if (upper.includes('RSBSA')) return KYC_ID_SPECS.RSBSA_ID;
  if (upper.includes('PHILSYS') || upper.includes('NATIONAL')) return KYC_ID_SPECS.PHILSYS_NATIONAL_ID;
  if (upper.includes('DRIVER')) return KYC_ID_SPECS.DRIVERS_LICENSE;
  if (upper.includes('PASSPORT')) return KYC_ID_SPECS.PASSPORT;
  if (upper.includes('TIN')) return KYC_ID_SPECS.TIN_ID;
  if (upper.includes('POSTAL')) return KYC_ID_SPECS.POSTAL_ID;
  if (upper.includes('VOTER')) return KYC_ID_SPECS.VOTERS_ID;
  return KYC_ID_SPECS.PHILSYS_NATIONAL_ID;
}

/**
 * Normalizes a person's name for cross-document comparison:
 * - Lowercase, remove punctuation (dots, commas, hyphens)
 * - Strip single-letter middle initials (e.g., "Juan M. Dela Cruz" -> ["juan", "dela", "cruz"])
 */
export function normalizeNameTokens(name: string): string[] {
  return name
    .toLowerCase()
    .replace(/[.,'-]/g, ' ')
    .replace(/\b(jr|sr|ii|iii|iv)\b/g, '')
    .split(/\s+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1); // ignore 1-letter middle initials
}

export interface IdentityVerificationInput {
  registeredName: string; // Full name or "firstName lastName"
  firstName?: string;
  lastName?: string;
  idNameOnDocument: string;
  idType: string;
  idNumber: string;
  confirmIdNumber: string;
  rsbsaNumber?: string;
  requireRsbsa?: boolean;
  hasUploadedDocument?: boolean;
}

export interface IdentityVerificationResult {
  isValid: boolean;
  nameMatched: boolean;
  idNumberFormatValid: boolean;
  idNumbersMatched: boolean;
  rsbsaFormatValid: boolean;
  idMatchScore: number; // 0 to 100
  errors: {
    idNameOnDocument?: string;
    idNumber?: string;
    confirmIdNumber?: string;
    rsbsaNumber?: string;
  };
}

/**
 * Strict Identity & Document Matching Function (`verifyIdentityMatch`)
 */
export function verifyIdentityMatch(input: IdentityVerificationInput): IdentityVerificationResult {
  const fullProfileName =
    input.firstName && input.lastName
      ? `${input.firstName.trim()} ${input.lastName.trim()}`
      : (input.registeredName || '').trim();

  const profileTokens = normalizeNameTokens(fullProfileName);
  const docTokens = normalizeNameTokens(input.idNameOnDocument || '');

  // Name match check:
  // Every significant token in profile name must appear in docTokens (or vice versa if middle name is included on ID)
  let nameMatched = false;
  let tokenMatchRatio = 0;

  if (profileTokens.length >= 2 && docTokens.length >= 2) {
    const matchedProfileTokens = profileTokens.filter((pt) => docTokens.includes(pt));
    tokenMatchRatio = matchedProfileTokens.length / profileTokens.length;
    // Require first token and last token of profile to exist on ID document name
    const firstMatched = docTokens.includes(profileTokens[0]);
    const lastMatched = docTokens.includes(profileTokens[profileTokens.length - 1]);
    nameMatched = firstMatched && lastMatched && tokenMatchRatio >= 0.75;
  } else if (profileTokens.length === 1 && docTokens.length >= 1) {
    nameMatched = docTokens.includes(profileTokens[0]);
    tokenMatchRatio = nameMatched ? 1 : 0;
  }

  // ID Format check
  const spec = getKycIdSpec(input.idType);
  const cleanIdNum = (input.idNumber || '').trim();
  const cleanConfirmNum = (input.confirmIdNumber || '').trim();

  const idNumberFormatValid = cleanIdNum.length > 0 && spec.regex.test(cleanIdNum);
  const idNumbersMatched = cleanIdNum.length > 0 && cleanIdNum === cleanConfirmNum;

  // RSBSA check for farmers
  const cleanRsbsa = (input.rsbsaNumber || '').trim();
  const rsbsaFormatValid = input.requireRsbsa
    ? isValidRsbsaNumber(cleanRsbsa)
    : cleanRsbsa.length === 0 || isValidRsbsaNumber(cleanRsbsa);

  // Calculate 0-100% score
  let score = 0;
  if (nameMatched) {
    score += 40;
  } else if (tokenMatchRatio > 0) {
    score += Math.round(tokenMatchRatio * 20);
  }
  if (idNumberFormatValid) score += 25;
  if (idNumbersMatched && idNumberFormatValid) score += 20;
  if (input.requireRsbsa) {
    if (rsbsaFormatValid) score += 15;
  } else {
    if (input.hasUploadedDocument !== false) score += 15;
  }
  score = Math.min(100, Math.max(0, score));

  const errors: IdentityVerificationResult['errors'] = {};
  if (!nameMatched) {
    errors.idNameOnDocument =
      'Full Name on ID must match your registered First & Last Name.';
  }
  if (!idNumberFormatValid) {
    errors.idNumber = `Invalid ${spec.shortLabel} format. ${spec.formatHint} (e.g., ${spec.placeholder}).`;
  }
  if (!idNumbersMatched) {
    errors.confirmIdNumber = 'Confirmation ID Number does not match the entered ID Number.';
  }
  if (input.requireRsbsa && !rsbsaFormatValid) {
    errors.rsbsaNumber =
      'Valid RSBSA Number is required in format XX-XX-XX-XXX-XXXXXX (e.g., 01-33-02-001-000123).';
  }

  const isValid =
    nameMatched &&
    idNumberFormatValid &&
    idNumbersMatched &&
    rsbsaFormatValid;

  return {
    isValid,
    nameMatched,
    idNumberFormatValid,
    idNumbersMatched,
    rsbsaFormatValid,
    idMatchScore: isValid ? 100 : score,
    errors,
  };
}

