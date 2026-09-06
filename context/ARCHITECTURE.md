# FarmFlow - Project Architecture

## System Overview
FarmFlow is a multi-sided marketplace connecting farmers in La Union directly with buyers. The platform is built using a modern Next.js 16 App Router architecture, focusing heavily on Server-Side Rendering (SSR) for performance, SEO, and robust data security.

## Technology Stack
- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** PostgreSQL (managed via Supabase)
- **ORM:** Prisma
- **Authentication:** Supabase Auth (Email/Password & Magic Links)
- **Styling:** Tailwind CSS + custom Design System
- **State Management:** Zustand (Client-side Cart & UI State)
- **Payments:** PayMongo API integration

## Data Flow & Architecture
1. **Edge Routing & Protection:** Incoming requests hit `proxy.ts` (Next.js 16 Middleware), which checks Supabase session tokens and enforces role-based redirects before rendering even begins.
2. **Server Actions (RPC):** All database mutations and complex data fetching (e.g., `getAnalyticsStatsAction`, `createOrderAction`) happen exclusively on the server in `/app/actions`. This ensures zero DB logic is exposed to the client.
3. **Data Access Layer (DAL):** All server operations pass through `lib/dal.ts` (`requireAuth`, `requireRole`, `requireAdmin`), ensuring strict Server-Side Authorization regardless of UI state.
4. **Prisma Singleton:** DB connections are pooled and managed via `lib/prisma.ts` to prevent connection exhaustion in serverless environments.
5. **Notification Subsystem:** Background notifications are dispatched directly from Server Actions (via `lib/notifications.ts`) to keep admins and farmers informed of state changes asynchronously.

## Component Strategy
- **Server Components (Default):** Used for all data-fetching, SEO-heavy pages, and layouts. These components query Prisma directly via Server Actions.
- **Client Components ('use client'):** Strictly reserved for interactive islands (e.g., `AdminSettingsClient`, `ProductListingCard`, `FarmersSearchBar`). Client components only receive sanitized data as props.

## Geographic Reference Data Architecture
1. **Single Source of Truth (SSOT):**
   - The municipal boundaries of Agoo, La Union comprise exactly 49 legally defined barangays (PSGC: `013301000`).
   - Rather than relying on fragile 3rd-party external APIs (which introduce network latency, availability risks, and rate limiting), geographic data is maintained as an immutable, canonical TypeScript module (`lib/constants/locations.ts`).
2. **Why Not an External API?**
   - **Offline-First PWA Resilience:** Mang Juan and local farmers operating under weak or intermittent rural cellular signals must be able to register and manage farms offline or on low-bandwidth connections without third-party network blocking.
   - **Zero Latency & Zero Cost:** 49 items consume < 2 KB of memory. Querying an external API adds 200ms–1500ms overhead with zero functional benefit since barangay boundaries are legally static.
   - **Deterministic Validation:** Backend Server Actions validate incoming payloads against the canonical enum/tuple using Zod (`z.enum(AGOO_BARANGAYS)`), preventing database corruption or injection.
3. **Internal API & Access Patterns:**
   - Both Server Components and Client Components import the canonical dataset directly.
   - If dynamic fetching is needed by decoupled services or external clients, an internal Next.js API route (`/api/locations/barangays`) can expose this dataset cached with `Cache-Control: public, max-age=31536000, immutable`.

## Security Posture
- **Edge-Level Auth:** `proxy.ts` prevents unauthenticated access to dashboards and redirects logged-in users away from auth pages.
- **Server-Level Auth:** `lib/dal.ts` prevents malicious API calls or Server Action executions by verifying the JWT and checking the user role against the database on every sensitive request.
- **Atomic Transactions:** Critical operations like placing an order use `prisma.$transaction` to ensure inventory isn't decremented if the order creation fails.

## Webhook Architecture (PayMongo)
- **Ingestion:** Dedicated API routes (e.g., `/api/webhooks/paymongo`) will receive `POST` requests from PayMongo.
- **Validation:** Webhooks MUST be validated using the `PAYMONGO_WEBHOOK_SECRET` to verify the signature and prevent spoofing.
- **Idempotency:** Webhook handlers must check if an event has already been processed (e.g., by querying the `Order` status) before applying mutations, ensuring duplicate webhook deliveries don't cause double-processing.

## Deployment & CI/CD
- **Hosting Environment:** Vercel (Optimized for Next.js 16 Server Components and Middleware).
- **Database:** Supabase PostgreSQL (Connection pooling via Supavisor configured in Vercel environment variables).
- **CI Checks:** GitHub Actions / Vercel Build checks will enforce strict TypeScript compilation, ESLint, and Prettier formatting before allowing production deployments.
