# FarmFlow - Database Schema & Architecture

This document outlines the database design for FarmFlow, managed via Prisma ORM and hosted on Supabase PostgreSQL.

## 1. Schema Overview

The database consists of 8 core models supporting the marketplace, farm operations, and notifications:
- **User:** Manages authentication, profiles, and roles (Admin, Farmer, Buyer).
- **Farm:** Central hub for a farmer's operations. Linked 1-to-1 with a Farmer User.
- **Crop:** Represents the agricultural yield lifecycle on a farm.
- **Product:** The marketplace listing derived from a Crop (or created standalone).
- **Order & OrderItem:** E-commerce transaction records.
- **Address:** User delivery/billing addresses.
- **Activity:** Audit/log of farm activities (planting, fertilizing, harvesting).
- **Notification:** System notifications for users.

## 2. Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    USER ||--o| FARM : "owns (if FARMER)"
    USER ||--o{ ORDER : "places (as BUYER)"
    USER ||--o{ ADDRESS : "has"
    FARM ||--o{ CROP : "grows"
    FARM ||--o{ PRODUCT : "lists"
    FARM ||--o{ ACTIVITY : "logs"
    CROP ||--o{ PRODUCT : "converts to"
    CROP ||--o{ ACTIVITY : "has"
    ORDER ||--|{ ORDER_ITEM : "contains"
    PRODUCT ||--o{ ORDER_ITEM : "included in"
    ADDRESS ||--o{ ORDER : "used for"
    USER ||--o{ NOTIFICATION : "receives"

## 3. Data Integrity & Cascades
To maintain a clean database and prevent orphan records, cascading deletes are implemented:
- Deleting a `User` cascades to delete their `Farm`, `Orders`, and `Addresses`.
- Deleting a `Farm` cascades to delete its `Crops`, `Products`, and `Activities`.
- Deleting a `Product` or `Order` cascades to delete the respective `OrderItem`s.
- `Crop` to `Product`/`Activity` is `SetNull` so historical marketplace listings and activity logs remain intact even if the crop record is removed.

## 4. Row Level Security (RLS) & Security Policies
Since we are using Prisma from a secure Node.js environment (Next.js Server Components / Server Actions), database operations are performed via a secure server environment using the `DATABASE_URL`. 
- **Prisma Bypass:** Prisma operates with service-level access, bypassing Supabase RLS.
- **Application-Level Security:** We enforce security and authorization within our Next.js Server Actions and API Routes. Before executing a Prisma query, we MUST verify the user's session and role.
  - *Example:* A farmer can only update a `Product` if `product.farm.userId === currentUser.id`.

## 5. Migrations
Database schema changes are strictly managed through Prisma Migrations.
- **Development:** `npx prisma migrate dev --name <migration_name>`
- **Production:** `npx prisma migrate deploy`
- Never modify the database schema directly through the Supabase UI. Always update `schema.prisma` and run a migration to ensure code and database stay synchronized.

## 6. Enums & Reference Data Dictionary
- **Role:** ADMIN, FARMER, BUYER
- **CropStage:** SEEDLING, GROWING, READY_TO_HARVEST, HARVESTED
- **OrderStatus:** PENDING, CONFIRMED, READY, DELIVERED, CANCELLED
- **PaymentStatus:** PENDING, PAID, FAILED, REFUNDED
- **ListingStatus:** ACTIVE, PENDING_REVIEW, REMOVED
- **FarmerStatus:** PENDING, VERIFIED, SUSPENDED
- **NotificationType:**
  - *Admin-facing:* NEW_USER, PENDING_FARMER, NEW_LISTING, NEW_ORDER, ORDER_STATUS_CHANGE, PAYMENT_CONFIRMED
  - *Farmer-facing:* ACCOUNT_APPROVED, LISTING_APPROVED, LISTING_REMOVED, NEW_CUSTOMER_ORDER, ORDER_CONFIRMED, ORDER_READY, ORDER_DELIVERED, ORDER_CANCELLED
- **Agoo Barangays (49 Canonical LGUs):**
  - Stored as `String` in `Farm.barangay` and `Address.barangay` to maintain database flexibility, but strictly validated at the application boundary (Zod schemas) against `AGOO_BARANGAYS`.
  - Canonical list: Ambitacay, Balawarte, Capas, Consolacion (Poblacion), Macalva Central, Macalva Norte, Macalva Sur, Nazareno, Purok, San Agustin East, San Agustin Norte, San Agustin Sur, San Antonino, San Antonio, San Francisco, San Isidro, San Joaquin Norte, San Joaquin Sur, San Jose Norte, San Jose Sur, San Juan, San Julian Central, San Julian East, San Julian Norte, San Julian West, San Manuel Norte, San Manuel Sur, San Marcos, San Miguel, San Nicolas Central (Poblacion), San Nicolas East, San Nicolas Norte (Poblacion), San Nicolas Sur (Poblacion), San Nicolas West, San Pedro, San Roque East, San Roque West, San Vicente Norte, San Vicente Sur, Santa Ana, Santa Barbara (Poblacion), Santa Fe, Santa Maria, Santa Monica, Santa Rita (Nalinac), Santa Rita East, Santa Rita Norte, Santa Rita Sur, Santa Rita West.

## 7. Indexing Strategy
To ensure fast reads as the marketplace scales, we apply targeted indexes in our Prisma schema:
- **Foreign Keys:** All relation scalar fields (e.g., `userId`, `farmId`, `productId`) MUST be indexed.
- **Searchable Fields:** High-frequency search fields (e.g., `Product.name`, `Product.category`) should be indexed.
- **Status/Filter Fields:** Fields frequently used in WHERE clauses (e.g., `Order.status`, `Product.listingStatus`) should be indexed.

## 8. Soft Deletes vs Hard Deletes
- **Default Strategy:** Prefer Soft Deletes (adding a `deletedAt` timestamp or toggling `status`) for critical business data (e.g., `Products`, `Orders`, `Farms`). This preserves historical analytics and order integrity.
- **Hard Deletes:** Only permanently delete data (using `CASCADE`) when required for privacy (e.g., a user requesting account deletion) or for cleaning up irrelevant intermediate records (e.g., an abandoned cart session if we choose to store it in DB).
