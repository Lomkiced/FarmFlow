You are an expert full-stack developer. Help me initialize and fully set up a 
Next.js 14 project called "FarmFlow" — an Agricultural Operations Management 
System for Agoo, La Union, Philippines.

This is a PWA-enabled web application with three user roles: Admin, Farmer, 
and Public Buyer. It includes a public marketplace, farm management dashboard, 
and admin panel.

## TECH STACK
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- Styling: Tailwind CSS
- Database: Supabase (PostgreSQL)
- ORM: Prisma
- Auth: Supabase Auth
- State Management: Zustand
- Forms & Validation: React Hook Form + Zod
- PWA: next-pwa
- Payments: PayMongo (to be integrated later)
- Deployment Target: Vercel

---

## TASK 1 — Initialize the Next.js Project

Run the following and select these options:
- TypeScript: Yes
- ESLint: Yes
- Tailwind CSS: Yes
- src/ directory: No
- App Router: Yes
- Import alias: Yes (@/*)

```bash
npx create-next-app@latest farmflow
cd farmflow
```

---

## TASK 2 — Install All Dependencies

Install the following packages exactly:

### Core dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
npm install @prisma/client
npm install zustand
npm install react-hook-form @hookform/resolvers zod
npm install next-pwa
npm install axios
npm install date-fns
npm install lucide-react
npm install clsx tailwind-merge
npm install @tanstack/react-query
npm install recharts
npm install react-hot-toast
npm install sharp
```

### Dev dependencies
```bash
npm install -D prisma
npm install -D @types/node
npm install -D prettier prettier-plugin-tailwindcss
```

---

## TASK 3 — Initialize Prisma

```bash
npx prisma init
```

After running this, update the `prisma/schema.prisma` file with the following 
complete schema for FarmFlow:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  ADMIN
  FARMER
  BUYER
}

enum CropStage {
  SEEDLING
  GROWING
  READY_TO_HARVEST
  HARVESTED
}

enum OrderStatus {
  PENDING
  CONFIRMED
  READY
  DELIVERED
  CANCELLED
}

enum PaymentStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
}

enum ListingStatus {
  ACTIVE
  PENDING_REVIEW
  REMOVED
}

enum FarmerStatus {
  PENDING
  VERIFIED
  SUSPENDED
}

model User {
  id            String       @id @default(uuid())
  email         String       @unique
  name          String
  phone         String?
  avatarUrl     String?
  role          Role         @default(BUYER)
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  farm          Farm?
  ordersAsBuyer Order[]      @relation("BuyerOrders")
  addresses     Address[]
}

model Farm {
  id           String       @id @default(uuid())
  userId       String       @unique
  user         User         @relation(fields: [userId], references: [id])
  farmName     String
  barangay     String
  municipality String       @default("Agoo")
  province     String       @default("La Union")
  landArea     Float
  coverPhoto   String?
  bio          String?
  status       FarmerStatus @default(PENDING)
  rating       Float        @default(0)
  totalSales   Float        @default(0)
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  crops        Crop[]
  products     Product[]
  activities   Activity[]
}

model Crop {
  id             String     @id @default(uuid())
  farmId         String
  farm           Farm       @relation(fields: [farmId], references: [id])
  cropName       String
  variety        String?
  datePlanted    DateTime
  expectedHarvest DateTime
  actualHarvest  DateTime?
  areaSqm        Float
  stage          CropStage  @default(SEEDLING)
  notes          String?
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
  products       Product[]
  activities     Activity[]
}

model Product {
  id            String        @id @default(uuid())
  farmId        String
  farm          Farm          @relation(fields: [farmId], references: [id])
  cropId        String?
  crop          Crop?         @relation(fields: [cropId], references: [id])
  name          String
  category      String
  description   String?
  pricePerKg    Float
  stockKg       Float
  photos        String[]
  harvestDate   DateTime?
  deliveryAvail Boolean       @default(false)
  status        ListingStatus @default(PENDING_REVIEW)
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  orderItems    OrderItem[]
}

model Order {
  id            String        @id @default(uuid())
  buyerId       String
  buyer         User          @relation("BuyerOrders", fields: [buyerId], references: [id])
  totalAmount   Float
  deliveryFee   Float         @default(0)
  orderStatus   OrderStatus   @default(PENDING)
  paymentStatus PaymentStatus @default(PENDING)
  paymentRef    String?
  addressId     String
  address       Address       @relation(fields: [addressId], references: [id])
  notes         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
  items         OrderItem[]
}

model OrderItem {
  id         String   @id @default(uuid())
  orderId    String
  order      Order    @relation(fields: [orderId], references: [id])
  productId  String
  product    Product  @relation(fields: [productId], references: [id])
  quantityKg Float
  pricePerKg Float
  subtotal   Float
}

model Address {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  label     String?
  fullName  String
  phone     String
  street    String
  barangay  String
  city      String
  province  String
  zipCode   String?
  isDefault Boolean  @default(false)
  createdAt DateTime @default(now())
  orders    Order[]
}

model Activity {
  id           String   @id @default(uuid())
  farmId       String
  farm         Farm     @relation(fields: [farmId], references: [id])
  cropId       String?
  crop         Crop?    @relation(fields: [cropId], references: [id])
  activityType String
  description  String?
  inputsUsed   String?
  quantity     Float?
  unit         String?
  activityDate DateTime
  createdAt    DateTime @default(now())
}
```

---

## TASK 4 — Project Folder Structure

Create the following complete folder structure inside the project:

farmflow/
├── app/
│   ├── (public)/
│   │   ├── page.tsx                  # Landing/marketplace homepage
│   │   ├── products/
│   │   │   ├── page.tsx              # Product listing page
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Product detail page
│   │   ├── cart/
│   │   │   └── page.tsx              # Cart page
│   │   ├── checkout/
│   │   │   └── page.tsx              # Checkout page
│   │   └── orders/
│   │       └── [id]/
│   │           └── page.tsx          # Order tracking page
│   ├── (farmer)/
│   │   ├── layout.tsx                # Farmer dashboard layout
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Farmer home dashboard
│   │   ├── farm-profile/
│   │   │   └── page.tsx              # Farm profile management
│   │   ├── crops/
│   │   │   ├── page.tsx              # Crop list
│   │   │   └── [id]/
│   │   │       └── page.tsx          # Crop detail
│   │   ├── products/
│   │   │   ├── page.tsx              # Farmer product listings
│   │   │   └── new/
│   │   │       └── page.tsx          # Add new product
│   │   ├── orders/
│   │   │   └── page.tsx              # Farmer orders & earnings
│   │   └── activities/
│   │       └── page.tsx              # Activity log
│   ├── (admin)/
│   │   ├── layout.tsx                # Admin panel layout
│   │   ├── dashboard/
│   │   │   └── page.tsx              # Admin main dashboard
│   │   ├── farmers/
│   │   │   └── page.tsx              # Farmer management
│   │   ├── listings/
│   │   │   └── page.tsx              # Listing moderation
│   │   ├── orders/
│   │   │   └── page.tsx              # Orders overview
│   │   ├── analytics/
│   │   │   └── page.tsx              # Analytics page
│   │   └── settings/
│   │       └── page.tsx              # System settings
│   ├── auth/
│   │   ├── login/
│   │   │   └── page.tsx              # Login page
│   │   ├── register/
│   │   │   └── page.tsx              # Register page
│   │   └── callback/
│   │       └── route.ts              # Supabase auth callback
│   ├── api/
│   │   ├── auth/
│   │   │   └── route.ts
│   │   ├── products/
│   │   │   └── route.ts
│   │   ├── orders/
│   │   │   └── route.ts
│   │   ├── farms/
│   │   │   └── route.ts
│   │   └── webhooks/
│   │       └── paymongo/
│   │           └── route.ts          # PayMongo webhook handler
│   ├── globals.css
│   ├── layout.tsx                    # Root layout
│   └── not-found.tsx
├── components/
│   ├── ui/                           # Base reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Spinner.tsx
│   │   └── Avatar.tsx
│   ├── layout/
│   │   ├── Navbar.tsx                # Public navbar
│   │   ├── Footer.tsx
│   │   ├── FarmerSidebar.tsx
│   │   └── AdminSidebar.tsx
│   ├── marketplace/
│   │   ├── ProductCard.tsx
│   │   ├── ProductGrid.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterDrawer.tsx
│   │   └── FarmerCard.tsx
│   ├── farmer/
│   │   ├── CropCard.tsx
│   │   ├── StatCard.tsx
│   │   ├── HarvestProgress.tsx
│   │   └── ActivityItem.tsx
│   ├── admin/
│   │   ├── FarmerTable.tsx
│   │   ├── ListingTable.tsx
│   │   ├── OrderTable.tsx
│   │   └── AnalyticsChart.tsx
│   └── shared/
│       ├── OrderStatusStepper.tsx
│       ├── ImageUpload.tsx
│       └── EmptyState.tsx
├── lib/
│   ├── prisma.ts                     # Prisma client singleton
│   ├── supabase/
│   │   ├── client.ts                 # Supabase browser client
│   │   └── server.ts                 # Supabase server client
│   ├── validations/
│   │   ├── auth.ts                   # Zod schemas for auth
│   │   ├── product.ts                # Zod schemas for products
│   │   ├── farm.ts                   # Zod schemas for farm
│   │   └── order.ts                  # Zod schemas for orders
│   └── utils.ts                      # cn(), formatPrice(), formatDate()
├── store/
│   ├── cartStore.ts                  # Zustand cart store
│   └── authStore.ts                  # Zustand auth store
├── types/
│   └── index.ts                      # Global TypeScript types
├── hooks/
│   ├── useAuth.ts
│   ├── useCart.ts
│   └── useFarm.ts
├── prisma/
│   └── schema.prisma
├── public/
│   ├── icons/                        # PWA icons (192x192, 512x512)
│   ├── manifest.json                 # PWA manifest
│   └── images/
├── .env.local                        # Environment variables (template)
├── next.config.js                    # Next.js + PWA config
├── tailwind.config.ts
├── tsconfig.json
└── prettier.config.js

Create all folders and placeholder files with basic content 
(empty exports or placeholder components).

---

## TASK 5 — Environment Variables

Create a `.env.local` file with this template:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database (Prisma)
DATABASE_URL=your_supabase_pooling_connection_string
DIRECT_URL=your_supabase_direct_connection_string

# PayMongo
PAYMONGO_SECRET_KEY=your_paymongo_secret_key
PAYMONGO_PUBLIC_KEY=your_paymongo_public_key
PAYMONGO_WEBHOOK_SECRET=your_paymongo_webhook_secret

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## TASK 6 — Configure Key Files

### next.config.js — with PWA support
```js
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
};

module.exports = withPWA(nextConfig);
```

### lib/prisma.ts — Prisma singleton
```ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### lib/supabase/client.ts
```ts
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### lib/supabase/server.ts
```ts
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function createClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
}
```

### lib/utils.ts
```ts
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

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
}
```

### store/cartStore.ts
```ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  name: string;
  pricePerKg: number;
  quantityKg: number;
  photo: string;
  farmerName: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  total: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const exists = state.items.find(
            (i) => i.productId === item.productId
          );
          if (exists) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantityKg: i.quantityKg + item.quantityKg }
                  : i
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantityKg: quantity } : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      total: () =>
        get().items.reduce(
          (sum, item) => sum + item.pricePerKg * item.quantityKg,
          0
        ),
    }),
    { name: 'farmflow-cart' }
  )
);
```

### public/manifest.json — PWA Manifest
```json
{
  "name": "FarmFlow - Agoo Agricultural Marketplace",
  "short_name": "FarmFlow",
  "description": "Fresh crops directly from Agoo, La Union farmers",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFAF7",
  "theme_color": "#1B4332",
  "orientation": "portrait",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable any"
    }
  ],
  "categories": ["food", "shopping", "agriculture"]
}
```

### tailwind.config.ts — FarmFlow brand colors
```ts
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1B4332',
          50: '#E8F5EE',
          100: '#C6E6D4',
          500: '#2D6A4F',
          600: '#1B4332',
          700: '#143328',
          900: '#081C0F',
        },
        accent: {
          DEFAULT: '#D97706',
          50: '#FEF3C7',
          100: '#FDE68A',
          500: '#F59E0B',
          600: '#D97706',
          700: '#B45309',
        },
        sage: {
          DEFAULT: '#84A98C',
          100: '#D8E8DA',
          200: '#B7D1BB',
          500: '#84A98C',
          600: '#6B9474',
        },
        cream: '#FAFAF7',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        xl: '12px',
        '2xl': '16px',
      },
    },
  },
  plugins: [],
};

export default config;
```

### prettier.config.js
```js
module.exports = {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  plugins: ['prettier-plugin-tailwindcss'],
};
```

---

## TASK 7 — Verify Everything Works

Run the following to confirm zero errors:

```bash
npx prisma generate
npm run dev
```

Confirm:
- Dev server starts on http://localhost:3000 with no errors
- Prisma client generated successfully
- No TypeScript errors on startup
- All folders and files exist as specified

---
