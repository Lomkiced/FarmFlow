export type UserRole = 'ADMIN' | 'FARMER' | 'BUYER';
export type GlobalCropStage = 'SEEDLING' | 'GROWING' | 'READY_TO_HARVEST' | 'HARVESTED';
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'READY' | 'DELIVERED' | 'CANCELLED';

export interface ProductDetail {
  id: string;
  name: string;
  price: number;
  unit: string;
  badge: string;
  description: string[];
  harvestDate: string;
  category: string;
  images: string[];
  farmer: {
    id: string;
    name: string;
    avatar: string;
    location: string;
    rating: number;
    reviewCount: number;
  };
}

export interface RelatedProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  image: string;
}

export interface CheckoutForm {
  fullName: string;
  address: string;
  city: string;
  contact: string;
}

export type PaymentMethod = 'cod' | 'gcash' | 'maya' | 'card';

export interface OrderItem {
  id: string;
  name: string;
  farm: string;
  qty: string;
  price: number;
  image: string;
}

export interface OrderTracking {
  id: string;
  placedOn: string;
  status: string;
  currentStep: number;
  statusMessage: {
    title: string;
    body: string;
  };
  items: OrderItem[];
  delivery: {
    address: string;
    note: string;
    eta: string;
    mapImage: string;
    location: string;
  };
  farmer: {
    name: string;
    farm: string;
    avatar: string;
  };
}

export type CropStage = 'seedling' | 'growing' | 'ready' | 'harvested'

export interface MockCrop {
  id: string
  image: string
  name: string
  variety: string
  stage: CropStage
  planted: string
  harvest: string
  progress: number
  harvestDue?: boolean
}

export interface MockActivity {
  id: string
  icon: string
  iconBg: string
  iconColor: string
  title: string
  time: string
  crop: string
  notes: string
}

export interface MockOrder {
  id: string
  initials: string
  name: string
  product: string
  amount: string
  status: string
  statusBg: string
  statusColor: string
}

export type FarmerStatus = 'pending' | 'verified' | 'suspended'

export interface Farmer {
  id: string
  name: string
  avatar?: string
  initials?: string
  location: string
  date: string
  status: FarmerStatus
  farm?: {
    area: string
    location: string
    crops: string[]
  }
  contact?: {
    phone: string
    address: string
  }
}

export interface AdminListing {
  id: string
  name: string
  farm: string
  price: number
  unit: string
  postedAgo: string
  status: 'pending' | 'flagged' | 'active'
  image: string
}

export type PaymentStatus = 'paid' | 'pending'
export type AdminOrderStatus = 'delivered' | 'in-transit' | 'pending'

export interface AdminOrder {
  id: string
  buyer: string
  farmer: string
  product: string
  amount: number
  payment: PaymentStatus
  status: AdminOrderStatus
  date: string
  detail?: {
    items: { name: string; qty: string; subtotal: number }[]
    logistics: number
    platformFee: number
    total: number
    txnId: string
    timeline: {
      label: string
      time: string
      done?: boolean
      active?: boolean
    }[]
  }
}