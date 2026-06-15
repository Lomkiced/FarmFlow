import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const whereClause: any = {
      status: 'VERIFIED',
    };

    if (search) {
      whereClause.farmName = { contains: search, mode: 'insensitive' };
    }

    const [farms, total] = await Promise.all([
      prisma.farm.findMany({
        where: whereClause,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { products: { where: { status: 'ACTIVE' } } }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.farm.count({ where: whereClause }),
    ]);

    return NextResponse.json({
      farms,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error in GET /api/farms:', error);
    return NextResponse.json({ error: 'Failed to fetch farms' }, { status: 500 });
  }
}