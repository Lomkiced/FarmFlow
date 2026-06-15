import { NextRequest, NextResponse } from 'next/server';
import { getPublicProductsAction } from '@/app/actions/search';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const query = searchParams.get('query') || undefined;
    const category = searchParams.get('category') || undefined;
    const minPrice = searchParams.get('minPrice') ? parseFloat(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseFloat(searchParams.get('maxPrice')!) : undefined;
    const inStockOnly = searchParams.get('inStockOnly') === 'true';
    const sort = (searchParams.get('sort') as any) || 'newest';
    const page = searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1;
    const pageSize = searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 12;

    const result = await getPublicProductsAction({
      query,
      category,
      minPrice: isNaN(minPrice as number) ? undefined : minPrice,
      maxPrice: isNaN(maxPrice as number) ? undefined : maxPrice,
      inStockOnly,
      sort,
      page,
      pageSize,
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[API Products GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}