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

/**
 * Checks if a unit string is weight-based (kilograms/grams).
 * Defaults to true if unit is missing or undefined (marketplace default is kg).
 */
export function isWeightUnit(unit?: string): boolean {
  if (!unit) return true;
  const normalized = unit.toLowerCase().trim();
  return ['kg', 'kilo', 'kilogram', 'kilograms', 'kilos', 'g', 'gram', 'grams'].includes(normalized);
}

/**
 * Formats a decimal quantity into a fraction representation (e.g. 0.25 -> "1/4", 1.5 -> "1 1/2").
 */
export function formatFraction(qty: number): string {
  if (typeof qty !== 'number' || isNaN(qty)) return '0';
  
  const whole = Math.floor(qty);
  const decimal = Math.round((qty - whole) * 100) / 100;
  
  let fractionStr = '';
  if (Math.abs(decimal - 0.25) < 0.03) {
    fractionStr = '1/4';
  } else if (Math.abs(decimal - 0.5) < 0.03) {
    fractionStr = '1/2';
  } else if (Math.abs(decimal - 0.75) < 0.03) {
    fractionStr = '3/4';
  } else if (Math.abs(decimal - 0.33) < 0.03) {
    fractionStr = '1/3';
  } else if (Math.abs(decimal - 0.67) < 0.03) {
    fractionStr = '2/3';
  } else if (decimal > 0) {
    fractionStr = decimal.toString().replace(/^0/, '');
  }

  if (whole === 0) {
    return fractionStr || '0';
  }
  if (!fractionStr) {
    return whole.toString();
  }
  return `${whole} ${fractionStr}`;
}

/**
 * Formats quantity and unit for display with market fractions.
 * For kg products:
 *   - 0.25 -> "1/4 kg (0.25 kg)"
 *   - 0.5 -> "1/2 kg (0.5 kg)"
 *   - 0.75 -> "3/4 kg (0.75 kg)"
 *   - 1 -> "1 kg"
 *   - 1.5 -> "1 1/2 kg (1.5 kg)"
 * For discrete units:
 *   - 2, "bundle" -> "2 bundle"
 */
export function formatQuantity(qty: number, unit: string = 'kg'): string {
  if (typeof qty !== 'number' || isNaN(qty)) return `0 ${unit}`;

  const cleanQty = Number(qty.toFixed(2));
  const isWeight = isWeightUnit(unit);
  const unitStr = unit || 'kg';

  if (Number.isInteger(cleanQty) || cleanQty % 1 === 0) {
    return `${cleanQty} ${unitStr}`;
  }

  if (isWeight) {
    const fractionStr = formatFraction(cleanQty);
    return `${fractionStr} ${unitStr} (${cleanQty} ${unitStr})`;
  }

  return `${cleanQty} ${unitStr}`;
}

