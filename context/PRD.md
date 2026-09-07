# FarmFlow - Product Requirements Document (PRD)

## 1. Project Scope
FarmFlow is an Agricultural Operations Management System and PWA targeting the municipality of Agoo, La Union. It serves as a direct bridge between local farmers and public buyers, eliminating unnecessary middlemen, while providing an administrative overview for moderation and analytics.

### 1.1 Geographic Scope (Agoo, La Union)
The platform operates strictly within the official jurisdiction of Agoo, La Union (PSGC: 013301000, Postal Code: 2504), covering all 49 legally constituted barangays:
- **Ambitacay**, **Balawarte**, **Capas**, **Consolacion (Poblacion)**, **Macalva Central**, **Macalva Norte**, **Macalva Sur**, **Nazareno**, **Purok**
- **San Agustin East**, **San Agustin Norte**, **San Agustin Sur**, **San Antonino**, **San Antonio**, **San Francisco**, **San Isidro**, **San Joaquin Norte**, **San Joaquin Sur**
- **San Jose Norte**, **San Jose Sur**, **San Juan**, **San Julian Central**, **San Julian East**, **San Julian Norte**, **San Julian West**
- **San Manuel Norte**, **San Manuel Sur**, **San Marcos**, **San Miguel**, **San Nicolas Central (Poblacion)**, **San Nicolas East**, **San Nicolas Norte (Poblacion)**, **San Nicolas Sur (Poblacion)**, **San Nicolas West**
- **San Pedro**, **San Roque East**, **San Roque West**, **San Vicente Norte**, **San Vicente Sur**, **Santa Ana**, **Santa Barbara (Poblacion)**, **Santa Fe**, **Santa Maria**, **Santa Monica**
- **Santa Rita (Nalinac)**, **Santa Rita East**, **Santa Rita Norte**, **Santa Rita Sur**, **Santa Rita West**

All farm locations must strictly map to one of these 49 barangays for verification and localized agricultural analytics. Buyer delivery addresses within Agoo must also map to these standardized barangays for accurate order fulfillment.

## 2. Minimum Viable Product (MVP) Features
### For Public Buyers
- Browse and search for fresh crops and agricultural products.
- View detailed farmer profiles and product origins.
- Add items to cart (Zustand persistent storage).
- Checkout with delivery or pickup options.
- Track order status.

### For Farmers
- Farm Profile Management (Bio, location, cover photo).
- Crop Management (Track crops from seedling to harvest).
- Product Listing (Convert harvested crops to marketplace listings).
- Order Management (Accept, prepare, and update orders).
- Activity Logging (Track inputs used, activities on the farm).

### For Admins
- User and Farmer Verification (Approve pending farmer registrations).
- Listing Moderation (Remove inappropriate or fake listings).
- Order Overview & Dispute Resolution.
- High-level Analytics (Sales, active users, top crops).

## 3. Goals & Objectives
- **Economic:** Increase profit margins for Agoo farmers by enabling direct-to-consumer sales.
- **Operational:** Provide farmers with a digital tool to track their crops and activities efficiently.
- **Consumer:** Give buyers access to fresh, traceable, and locally grown produce.

## 4. Technical Requirements
- **Progressive Web App (PWA):** Must be installable on mobile devices (Android/iOS) for offline-like access and native feel.
- **Performance:** Fast load times utilizing Next.js Image Optimization, Font Optimization, and Server Components.
- **Responsiveness:** Mobile-first design approach. The farmer dashboard must be highly usable on budget Android smartphones.
- **Security:** Secure authentication via Supabase Auth. Protection against SQL injection and XSS via Prisma and React.

## 5. Success Metrics
- **Adoption:** 50+ verified farmers and 500+ registered buyers within the first 3 months of launch.
- **Engagement:** Daily active users (DAU) on the farmer dashboard.
- **Transactions:** Number of completed orders and total Gross Merchandise Value (GMV).
- **Performance:** Lighthouse score of 90+ for Performance, Accessibility, Best Practices, and SEO.

## 6. Out of Scope (For Future Phases)
- AI-based crop disease detection.
- IoT integration for soil moisture monitoring.
- Complex multi-vendor cart routing (Currently handled as separate orders per farm).

## 7. Milestones & Phased Rollout
- **Phase 1 (Alpha):** Core marketplace operations, basic auth, product listing, and simple order flow.
- **Phase 2 (Beta):** PayMongo integration, robust webhook handling, and admin moderation dashboard.
- **Phase 3 (V1 Launch):** Performance optimization, PWA installation prompts, and onboarding 50 pilot farmers.

## 8. User Personas
- **The Local Farmer (Mang Juan):** Uses a budget Android smartphone. Needs large buttons, clear offline-capable flows, and simple tracking to list inventory without technical hassle.
- **The Public Buyer (Maria):** Values fresh, traceable produce. Wants a fast, intuitive cart experience with reliable delivery tracking and secure payment via GCash/PayMaya (PayMongo).

## 9. Risk Management
- **Risk:** Low technical literacy among farmers.
  - **Mitigation:** Extremely simplified UI, onboarding tooltips, and local community workshops for the Alpha phase.
- **Risk:** Poor internet connectivity in rural farms.
  - **Mitigation:** Strict adherence to PWA caching strategies and optimistic UI updates for farm activity logging.
