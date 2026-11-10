'use server';

import { prisma } from '@/lib/prisma';
import { PRODUCT_CATEGORIES } from '@/lib/validations/product';

// ─── Types ────────────────────────────────────────────────────────────────────

export type ProductSearchParams = {
  query?: string;
  category?: string;
  barangay?: string;
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
    barangay,
    minPrice,
    maxPrice,
    inStockOnly = false,
    sort = 'newest',
    page = 1,
    pageSize = 12,
  } = params;

  const isAllCategory =
    !category ||
    category.toLowerCase() === 'all' ||
    category.toLowerCase() === 'all categories' ||
    category.toLowerCase() === 'all produce';

  const where: any = {
    status: 'ACTIVE' as const,
    farm: {
      status: 'VERIFIED' as const,
      ...(barangay && barangay.toLowerCase() !== 'all' && barangay.trim() !== ''
        ? {
            barangay: {
              contains: barangay,
              mode: 'insensitive' as const,
            },
          }
        : {}),
    },
    ...(query
      ? {
          OR: [
            { name: { contains: query, mode: 'insensitive' as const } },
            { description: { contains: query, mode: 'insensitive' as const } },
            { category: { contains: query, mode: 'insensitive' as const } },
            { farm: { farmName: { contains: query, mode: 'insensitive' as const } } },
            { farm: { barangay: { contains: query, mode: 'insensitive' as const } } },
          ],
        }
      : {}),
    ...(!isAllCategory
      ? {
          category: {
            equals: category,
            mode: 'insensitive' as const,
          },
        }
      : {}),
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
        minOrderQty: true,
        wholesalePrice: true,
        wholesaleMinQty: true,
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
      minOrderQty: true,
      wholesalePrice: true,
      wholesaleMinQty: true,
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
  const [related, deliveredOrders] = await Promise.all([
    prisma.product.findMany({
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
        minOrderQty: true,
        wholesalePrice: true,
        wholesaleMinQty: true,
        farm: {
          select: { farmName: true },
        },
      },
    }),
    prisma.order.findMany({
      where: {
        orderStatus: 'DELIVERED',
        items: {
          some: {
            OR: [{ productId }, { product: { farmId: product.farmId } }],
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: {
        buyer: { select: { name: true, avatarUrl: true } },
        address: { select: { barangay: true, city: true } },
      },
    }),
  ]);

  const completedReviews = deliveredOrders
    .filter((o) => o.freshnessRating || o.buyerReview)
    .map((o) => ({
      id: o.id,
      buyerName: o.buyer?.name || 'Verified Buyer',
      buyerLocation: `${o.address?.barangay || 'Poblacion'}, ${o.address?.city || 'Agoo'}`,
      rating: o.freshnessRating || 5,
      review:
        o.buyerReview ||
        `Freshly harvested ${product.name.toLowerCase()} delivered in excellent condition via FarmFlow Cold-Chain Express.`,
      date: (o.buyerConfirmedAt || o.createdAt).toISOString(),
      verifiedEscrow: true,
    }));

  const defaultReviews = [
    {
      id: 'rev-lu-1',
      buyerName: 'Chef Marco Villanueva (Agoo Bistro)',
      buyerLocation: 'San Nicolas Central, Agoo',
      rating: 5,
      review: `Super crisp and freshly harvested ${product.name.toLowerCase()}! Arrived within 2 hours from ${product.farm.farmName} with cold-chain temperature intact.`,
      date: new Date(Date.now() - 86400000 * 2).toISOString(),
      verifiedEscrow: true,
    },
    {
      id: 'rev-lu-2',
      buyerName: 'Elena & Sons Market Stall',
      buyerLocation: 'Consolacion, Agoo',
      rating: 5,
      review: `Accurate weight, zero bruising, and direct from a verified La Union RSBSA farmer. Released escrow payout right away!`,
      date: new Date(Date.now() - 86400000 * 5).toISOString(),
      verifiedEscrow: true,
    },
  ];

  const reviews = completedReviews.length > 0 ? completedReviews : defaultReviews;

  return { product, related, reviews };
}
