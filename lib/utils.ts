import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
  }).format(amount);
}

import { ProductCategory } from './validations/product';

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}

// Define low stock thresholds in kg based on category
const LOW_STOCK_THRESHOLDS: Record<string, number> = {
  'Grains & Rice': 50,
  'Vegetables': 15,
  'Fruits': 10,
  'Root Crops': 20,
  'Herbs & Spices': 2,
  'Legumes': 10,
  'Leafy Greens': 5,
  'Other': 10,
};

export function getProductStockBadge(stockKg: number, category?: string): 'In Stock' | 'Low Stock' | 'Out of Stock' {
  if (stockKg <= 0) return 'Out of Stock';
  
  const threshold = (category && LOW_STOCK_THRESHOLDS[category]) || 10;
  
  return stockKg <= threshold ? 'Low Stock' : 'In Stock';
}
