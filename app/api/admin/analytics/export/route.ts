import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/dal';
import { format, startOfMonth, startOfQuarter, startOfYear, subMonths, endOfMonth, isAfter, isBefore } from 'date-fns';

function escapeCsv(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  // If there's a comma, quote, or newline, wrap in quotes and escape internal quotes
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`; // Safely wrapping all values in quotes as requested
}

export async function GET(request: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'This Month';

    const now = new Date();
    let startDate = new Date();
    let endDate = new Date();
    let previousStartDate = new Date();
    let previousEndDate = new Date();

    switch (period) {
      case 'Last Month':
        startDate = startOfMonth(subMonths(now, 1));
        endDate = endOfMonth(subMonths(now, 1));
        previousStartDate = startOfMonth(subMonths(now, 2));
        previousEndDate = endOfMonth(subMonths(now, 2));
        break;
      case 'This Quarter':
        startDate = startOfQuarter(now);
        endDate = now;
        previousStartDate = startOfQuarter(subMonths(startDate, 3));
        previousEndDate = subMonths(startDate, 1);
        break;
      case 'Year to Date':
        startDate = startOfYear(now);
        endDate = now;
        previousStartDate = startOfYear(subMonths(startDate, 12));
        previousEndDate = subMonths(startDate, 12); // Last YTD comparison roughly
        break;
      case 'This Month':
      default:
        startDate = startOfMonth(now);
        endDate = now;
        previousStartDate = startOfMonth(subMonths(now, 1));
        previousEndDate = endOfMonth(subMonths(now, 1));
        break;
    }

    // ─── Fetch Data ─────────────────────────────────────────────────────────────
    
    const [
      orders, 
      previousOrders,
      farms, 
      previousFarms,
      harvestActivities,
      previousHarvestActivities,
      crops
    ] = await Promise.all([
      // Orders
      prisma.order.findMany({
        where: { createdAt: { gte: startDate, lte: endDate } },
        include: { 
          buyer: { select: { name: true } },
          items: { include: { product: { select: { name: true } } } }
        }
      }),
      prisma.order.findMany({
        where: { createdAt: { gte: previousStartDate, lte: previousEndDate } },
      }),
      // Active Farmers
      prisma.farm.findMany({
        where: { status: 'VERIFIED', createdAt: { lte: endDate } },
        include: { user: { select: { name: true } } }
      }),
      prisma.farm.findMany({
        where: { status: 'VERIFIED', createdAt: { lte: previousEndDate } }
      }),
      // Harvests
      prisma.activity.findMany({
        where: { activityType: { contains: 'Harvest', mode: 'insensitive' }, activityDate: { gte: startDate, lte: endDate } },
        include: { crop: { select: { cropName: true } } }
      }),
      prisma.activity.findMany({
        where: { activityType: { contains: 'Harvest', mode: 'insensitive' }, activityDate: { gte: previousStartDate, lte: previousEndDate } }
      }),
      // Crops list for mapping
      prisma.crop.findMany({ select: { id: true, cropName: true } })
    ]);

    // ─── Calculations ───────────────────────────────────────────────────────────
    
    // Total Sales
    const currentSales = orders.filter(o => o.orderStatus === 'DELIVERED' && o.paymentStatus === 'PAID')
                               .reduce((sum, o) => sum + o.totalAmount, 0);
    const prevSales = previousOrders.filter(o => o.orderStatus === 'DELIVERED' && o.paymentStatus === 'PAID')
                                    .reduce((sum, o) => sum + o.totalAmount, 0);
    const salesGrowth = prevSales ? (((currentSales - prevSales) / prevSales) * 100).toFixed(1) : 'N/A';

    // Active Farmers
    const currentFarmers = farms.length;
    const prevFarmers = previousFarms.length;
    const farmersGrowth = currentFarmers - prevFarmers;

    // Harvest Volume (assuming quantity is in kg, convert to MT)
    const currentHarvestMt = harvestActivities.reduce((sum, a) => sum + (a.quantity || 0), 0) / 1000;
    const prevHarvestMt = previousHarvestActivities.reduce((sum, a) => sum + (a.quantity || 0), 0) / 1000;
    const harvestGrowth = prevHarvestMt ? (((currentHarvestMt - prevHarvestMt) / prevHarvestMt) * 100).toFixed(1) : 'N/A';

    // Avg Order Value
    const currentAov = orders.length ? currentSales / orders.length : 0;
    const prevAov = previousOrders.length ? prevSales / previousOrders.length : 0;
    const aovGrowth = prevAov ? (((currentAov - prevAov) / prevAov) * 100).toFixed(1) : 'N/A';

    // Top Crops
    const cropTotals: Record<string, number> = {};
    harvestActivities.forEach(a => {
      const name = a.crop?.cropName || 'Unknown';
      cropTotals[name] = (cropTotals[name] || 0) + ((a.quantity || 0) / 1000);
    });
    const topCrops = Object.entries(cropTotals)
      .sort((a, b) => b[1] - a[1])
      .map(([name, vol], index) => ({ rank: index + 1, name, vol: vol.toFixed(2) }));

    // Most Active Farmers
    const farmerSales: Record<string, { name: string, farm: string, orders: number, total: number }> = {};
    orders.filter(o => o.orderStatus === 'DELIVERED' && o.paymentStatus === 'PAID').forEach(o => {
      // Find farm from order items
      o.items.forEach(item => {
        // Need farmId... wait, we didn't include product.farmId. We'll do our best with what we have
      });
    });

    // Instead of doing complex joins here in memory without product.farm, let's just do a simpler grouped query
    const activeFarmersData = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { createdAt: { gte: startDate, lte: endDate }, orderStatus: 'DELIVERED', paymentStatus: 'PAID' } },
      _sum: { subtotal: true },
      _count: { orderId: true }
    });

    // Fetch product details to map back to farmers
    const productIds = activeFarmersData.map(d => d.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: { farm: { include: { user: true } } }
    });

    const farmerMap: Record<string, { name: string, farm: string, orders: number, total: number }> = {};
    activeFarmersData.forEach(data => {
      const p = products.find(prod => prod.id === data.productId);
      if (p && p.farm) {
        const farmId = p.farm.id;
        if (!farmerMap[farmId]) {
          farmerMap[farmId] = { name: p.farm.user.name, farm: p.farm.farmName, orders: 0, total: 0 };
        }
        farmerMap[farmId].orders += data._count.orderId;
        farmerMap[farmId].total += data._sum.subtotal || 0;
      }
    });

    const activeFarmersList = Object.values(farmerMap)
      .sort((a, b) => b.total - a.total);

    // ─── Build CSV String ───────────────────────────────────────────────────────

    let csv = '';

    // Section 1: Header
    csv += 'Report Title,Date Range,Exported At\n';
    csv += `${escapeCsv('FarmFlow Analytics Report')},${escapeCsv(period)},${escapeCsv(format(new Date(), 'yyyy-MM-dd HH:mm:ss'))}\n\n`;

    // Section 2: KPI Summary
    csv += 'Metric,Current Value,Comparison (vs previous period)\n';
    csv += `${escapeCsv('Total Sales (PHP)')},${escapeCsv(currentSales.toFixed(2))},${escapeCsv(salesGrowth + '%')}\n`;
    csv += `${escapeCsv('Active Farmers')},${escapeCsv(currentFarmers)},${escapeCsv((farmersGrowth > 0 ? '+' : '') + farmersGrowth)}\n`;
    csv += `${escapeCsv('Total Harvest Volume (MT)')},${escapeCsv(currentHarvestMt.toFixed(2))},${escapeCsv(harvestGrowth + '%')}\n`;
    csv += `${escapeCsv('Average Order Value (PHP)')},${escapeCsv(currentAov.toFixed(2))},${escapeCsv(aovGrowth + '%')}\n\n`;

    // Section 3: Harvest Trends (by month)
    csv += 'Month,Harvest Volume (MT)\n';
    const trends: Record<string, number> = {};
    harvestActivities.forEach(a => {
      const monthStr = format(a.activityDate, 'MMM yyyy');
      trends[monthStr] = (trends[monthStr] || 0) + ((a.quantity || 0) / 1000);
    });
    Object.entries(trends).forEach(([m, v]) => {
      csv += `${escapeCsv(m)},${escapeCsv(v.toFixed(2))}\n`;
    });
    csv += '\n';

    // Section 4: Top Crops
    csv += 'Rank,Crop Name,Harvest Volume (MT)\n';
    topCrops.forEach(c => {
      csv += `${escapeCsv(c.rank)},${escapeCsv(c.name)},${escapeCsv(c.vol)}\n`;
    });
    csv += '\n';

    // Section 5: Most Active Farmers
    csv += 'Farmer Name,Farm Name,Total Orders,Total Sales (PHP)\n';
    activeFarmersList.forEach(f => {
      csv += `${escapeCsv(f.name)},${escapeCsv(f.farm)},${escapeCsv(f.orders)},${escapeCsv(f.total.toFixed(2))}\n`;
    });
    csv += '\n';

    // Section 6: Orders Summary
    csv += 'Order ID,Buyer,Product,Amount (PHP),Status,Date\n';
    orders.forEach(o => {
      const productsStr = o.items.map(i => i.product.name).join(' | ');
      csv += `${escapeCsv(o.id.slice(0, 8))},${escapeCsv(o.buyer.name)},${escapeCsv(productsStr)},${escapeCsv(o.totalAmount.toFixed(2))},${escapeCsv(o.orderStatus)},${escapeCsv(format(o.createdAt, 'yyyy-MM-dd'))}\n`;
    });

    // ─── Response ───────────────────────────────────────────────────────────────

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="farmflow-analytics-${format(new Date(), 'yyyy-MM-dd')}.csv"`,
      },
    });

  } catch (error) {
    console.error('[Analytics Export Error]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
