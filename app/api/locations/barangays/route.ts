import { NextResponse } from 'next/server';
import {
  AGOO_BARANGAYS,
  MUNICIPALITY_NAME,
  PROVINCE_NAME,
  POSTAL_CODE,
  PSGC_CODE,
} from '@/lib/constants/locations';

export async function GET() {
  return NextResponse.json(
    {
      municipality: MUNICIPALITY_NAME,
      province: PROVINCE_NAME,
      postalCode: POSTAL_CODE,
      psgcCode: PSGC_CODE,
      count: AGOO_BARANGAYS.length,
      barangays: AGOO_BARANGAYS,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    }
  );
}
