export interface LogisticsCheckpoint {
  id: string;
  timestamp: string;
  status: string;
  title: string;
  description: string;
  location: string;
  actor: string;
  badge?: string;
  proofPhotoUrl?: string;
}

export const COURIER_PRESETS = [
  {
    courierName: 'FarmFlow Cold-Chain Express',
    driverName: 'Kuya Rommel Dacanay',
    driverPhone: '+63 917 842 1190',
    vehicleInfo: 'White Mitsubishi L300 Reefer Van • Plate: ALA-4821',
    estimatedDelivery: 'Today, 2:00 PM - 4:00 PM',
  },
  {
    courierName: 'Farmer Direct Delivery',
    driverName: 'Mang Ernesto Valdez',
    driverPhone: '+63 918 530 7742',
    vehicleInfo: 'Honda TMX 125 Agro-Tricycle • Plate: LU-4582',
    estimatedDelivery: 'Today, 1:00 PM - 3:00 PM',
  },
  {
    courierName: 'Lalamove / L300 Van',
    driverName: 'Jayson Aspiras',
    driverPhone: '+63 927 319 6004',
    vehicleInfo: 'Hyundai H-100 Utility Van • Plate: NGD-9023',
    estimatedDelivery: 'Today, 3:00 PM - 5:00 PM',
  },
  {
    courierName: 'Buyer Farm Pickup',
    driverName: 'Farm Gate Dispatch Desk',
    driverPhone: '+63 917 123 4567',
    vehicleInfo: 'Agoo Municipal Agri-Trading Post • Bay 4',
    estimatedDelivery: 'Ready for Pickup Today',
  },
] as const;

export function generateTrackingNumber(orderId: string): string {
  const clean = (orderId || '000000').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const suffix = clean.slice(0, 6).padEnd(6, '8');
  return `FF-LU-2026-${suffix}`;
}

export function resolveOrderLogistics(order: {
  id: string;
  orderStatus: string;
  createdAt: Date | string;
  trackingNumber?: string | null;
  courierName?: string | null;
  driverName?: string | null;
  driverPhone?: string | null;
  vehicleInfo?: string | null;
  estimatedDelivery?: string | null;
  proofOfDeliveryUrl?: string | null;
  buyerConfirmedAt?: Date | string | null;
  freshnessRating?: number | null;
  buyerReview?: string | null;
  logisticsLogs?: any;
  address?: {
    barangay?: string | null;
    city?: string | null;
    province?: string | null;
  } | null;
  items?: Array<{
    product?: {
      farm?: {
        farmName?: string | null;
        barangay?: string | null;
      } | null;
      [key: string]: any;
    } | null;
    [key: string]: any;
  }>;
}) {
  const trackingNumber = order.trackingNumber || generateTrackingNumber(order.id);
  const courierName = order.courierName || 'FarmFlow Cold-Chain Express';
  const driverName = order.driverName || 'Kuya Rommel Dacanay';
  const driverPhone = order.driverPhone || '+63 917 842 1190';
  const vehicleInfo =
    order.vehicleInfo || 'White Mitsubishi L300 Reefer Van • Plate: ALA-4821';
  const estimatedDelivery = order.estimatedDelivery || 'Today, 2:00 PM - 4:00 PM';
  const proofOfDeliveryUrl =
    order.proofOfDeliveryUrl ||
    (order.orderStatus === 'DELIVERED'
      ? 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80'
      : null);

  const farmName =
    order.items?.[0]?.product?.farm?.farmName || 'Agoo Verified Partner Farm';
  const farmBarangay =
    order.items?.[0]?.product?.farm?.barangay || 'San Vicente Norte';
  const buyerBarangay = order.address?.barangay || 'Poblacion';
  const buyerCity = order.address?.city || 'Agoo';

  let logs: LogisticsCheckpoint[] = [];
  if (Array.isArray(order.logisticsLogs) && order.logisticsLogs.length > 0) {
    logs = order.logisticsLogs as LogisticsCheckpoint[];
  } else {
    // Synthesize realistic timestamped checkpoints for existing demo orders
    const createdTime = new Date(order.createdAt).getTime();
    const t0 = new Date(createdTime).toISOString();
    const t1 = new Date(createdTime + 15 * 60 * 1000).toISOString();
    const t2 = new Date(createdTime + 45 * 60 * 1000).toISOString();
    const t3 = new Date(createdTime + 75 * 60 * 1000).toISOString();
    const t4 = new Date(createdTime + 110 * 60 * 1000).toISOString();
    const t5 = new Date(createdTime + 140 * 60 * 1000).toISOString();

    logs.push({
      id: `${order.id}-placed`,
      timestamp: t0,
      status: 'ORDER_PLACED',
      title: 'Order Placed',
      description: 'Order submitted. Payment secured in FarmFlow Escrow.',
      location: `Brgy. ${buyerBarangay}, ${buyerCity}`,
      actor: 'Buyer',
      badge: 'Escrow Secured',
    });

    if (['CONFIRMED', 'READY', 'DELIVERED'].includes(order.orderStatus)) {
      logs.push({
        id: `${order.id}-confirmed`,
        timestamp: t1,
        status: 'CONFIRMED',
        title: 'Order Confirmed',
        description: `Farmer ${farmName} confirmed your order and scheduled harvest.`,
        location: `Brgy. ${farmBarangay}, Agoo, La Union`,
        actor: farmName,
        badge: 'Farm Verified',
      });
      logs.push({
        id: `${order.id}-harvested`,
        timestamp: t2,
        status: 'HARVESTED_QC',
        title: 'Harvested & Quality Checked',
        description:
          'Fresh produce harvested, weighed, and passed Quality & Freshness Inspection.',
        location: `${farmName} Packing Shed, La Union`,
        actor: 'Quality Inspector',
        badge: '100% Freshness QC',
      });
    }

    if (['READY', 'DELIVERED'].includes(order.orderStatus)) {
      logs.push({
        id: `${order.id}-dispatched`,
        timestamp: t3,
        status: 'DISPATCHED',
        title: 'Sorting / Handed to Courier',
        description: `Order handed over to ${courierName} — Rider: ${driverName} (${vehicleInfo}). Tracking #: ${trackingNumber}.`,
        location: 'Agoo Agri-Consolidation Hub, La Union',
        actor: courierName,
        badge: 'Cold-Chain Active',
      });
      logs.push({
        id: `${order.id}-transit`,
        timestamp: t4,
        status: 'IN_TRANSIT',
        title: 'Out for Delivery',
        description: `Rider ${driverName} is en route to Brgy. ${buyerBarangay}, ${buyerCity}.`,
        location: `${buyerCity} Distribution Route`,
        actor: driverName,
        badge: 'GPS Live',
      });
    }

    if (order.orderStatus === 'DELIVERED') {
      logs.push({
        id: `${order.id}-delivered`,
        timestamp: t5,
        status: 'DELIVERED',
        title: 'Delivered',
        description:
          'Parcel delivered to buyer address. Proof of delivery photo verified.',
        location: `Brgy. ${buyerBarangay}, ${buyerCity}`,
        actor: driverName,
        badge: 'Delivered',
        proofPhotoUrl: order.proofOfDeliveryUrl || undefined,
      });
    }

    if (order.buyerConfirmedAt) {
      logs.push({
        id: `${order.id}-completed`,
        timestamp: new Date(order.buyerConfirmedAt).toISOString(),
        status: 'COMPLETED',
        title: 'Order Received & Rated',
        description: `Buyer confirmed receipt in good condition${
          order.freshnessRating ? ` (${order.freshnessRating}★ Freshness)` : ''
        }. Escrow payout released to Farmer.`,
        location: `Brgy. ${buyerBarangay}, ${buyerCity}`,
        actor: 'Buyer',
        badge: 'Escrow Released',
      });
    }
  }

  // Return reverse-chronological logs (newest at index 0)
  const sortedDesc = [...logs].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return {
    trackingNumber,
    courierName,
    driverName,
    driverPhone,
    vehicleInfo,
    estimatedDelivery,
    proofOfDeliveryUrl,
    farmName,
    farmBarangay,
    buyerBarangay,
    buyerCity,
    logs: sortedDesc,
  };
}

