'use server';

import { prisma } from '@/lib/prisma';
import { PRODUCT_CATEGORIES } from '@/lib/validations/product';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductSearchParams = {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStockOnly?: boolean;
  sort?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  page?: number;
  pageSize?: number;
};

// ─── Get Public Products ──────────────────────────────────────────────────────

/**
 * Fetch products for the public marketplace with filtering, sorting, pagination.
 * Only returns ACTIVE products from VERIFIED farms.
 */
export async function getPublicProductsAction(params: ProductSearchParams = {}) {
  const {
    query,
    category,
    minPrice,
    maxPrice,
    inStockOnly = false,
    sort = 'newest',
    page = 1,
    pageSize = 12,
  } = params;

  const where = {
    status: 'ACTIVE' as const,
    farm: { status: 'VERIFIED' as const },
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } },
            { category: { contains: query, mode: 'insensitive' as const } },
            { farm: { farmName: { contains: query, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
    ...(category ? { category } : {}),
    ...(minPrice !== undefined || maxPrice !== undefined
      ? {
          pricePerKg: {
            ...(minPrice !== undefined ? { gte: minPrice } : {}),
            ...(maxPrice !== undefined ? { lte: maxPrice } : {}),
          },
        }
      : {}),
    ...(inStockOnly ? { stockKg: { gt: 0 } } : {}),
  };

  const orderBy =
    sort === 'price_asc'
      ? { pricePerKg: 'asc' as const }
      : sort === 'price_desc'
      ? { pricePerKg: 'desc' as const }
      : sort === 'popular'
      ? { orderItems: { _count: 'desc' as const } }
      : { createdAt: 'desc' as const }; // 'newest' default

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        category: true,
        pricePerKg: true,
        stockKg: true,
        photos: true,
        harvestDate: true,
        deliveryAvail: true,
        createdAt: true,
        farm: {
          select: {
            id: true,
            farmName: true,
            barangay: true,
            rating: true,
            user: {
              select: { name: true, avatarUrl: true },
            },
          },
        },
      },
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    categories: PRODUCT_CATEGORIES,
  };
}

// ─── Get Featured Products (Landing Page) ────────────────────────────────────

/**
 * Returns 4 featured products for the landing page.
 * Featured = newest ACTIVE products from VERIFIED farms with stock.
 */
export async function getFeaturedProductsAction() {
  const products = await prisma.product.findMany({
    where: {
      status: 'ACTIVE',
      farm: { status: 'VERIFIED' },
      stockKg: { gt: 0 },
    },
    orderBy: { createdAt: 'desc' },
    take: 4,
    select: {
      id: true,
      name: true,
      category: true,
      pricePerKg: true,
      stockKg: true,
      photos: true,
      farm: {
        select: {
          farmName: true,
          user: { select: { name: true, avatarUrl: true } },
        },
      },
    },
  });

  return products;
}

// ─── Get Single Product (Public) ─────────────────────────────────────────────

export async function getPublicProductAction(productId: string) {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      status: 'ACTIVE',
      farm: { status: 'VERIFIED' },
    },
    include: {
      farm: {
        include: {
          user: { select: { name: true, avatarUrl: true } },
          _count: { select: { products: { where: { status: 'ACTIVE' } } } },
        },
      },
      crop: { select: { cropName: true, variety: true, datePlanted: true } },
    },
  });

  if (!product) return null;

  // Get related products from the same farm (excluding this one)
  const related = await prisma.product.findMany({
    where: {
      farmId: product.farmId,
      status: 'ACTIVE',
      id: { not: productId },
    },
    take: 4,
    select: {
      id: true,
      name: true,
      pricePerKg: true,
      stockKg: true,
      photos: true,
      farm: {
        select: { farmName: true },
      },
    },
  });

  return { product, related };
}
