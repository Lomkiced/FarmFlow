# FarmFlow - Design System

## 1. Branding Identity
**FarmFlow** connects local farmers in Agoo, La Union, directly with buyers. The brand identity is grounded, fresh, and trustworthy. The design must avoid "AI slop" by strictly adhering to a premium, highly-curated aesthetic that feels native, modern, and accessible.

## 2. Color Palette
The color palette is inspired by agriculture, nature, and harvest. Extracted from `tailwind.config.ts`.

### Primary Colors (Greens)
- **Base (`primary`):** `#1B4332` (Deep Forest Green - Trust, stability, branding)
- **50:** `#E8F5EE` (Backgrounds)
- **100:** `#C6E6D4` (Hover states for light elements)
- **500:** `#2D6A4F` (Active states)
- **700:** `#143328` (Dark text)

### Accent Colors (Oranges/Harvest)
- **Base (`accent`):** `#D97706` (Harvest Gold - CTA buttons, highlights, urgency)
- **50:** `#FEF3C7` (Warning backgrounds)
- **500:** `#F59E0B` (Icons, badges)

### Sage (Muted Greens/Utility)
- **Base (`sage`):** `#84A98C` (Borders, secondary text, disabled states)
- **100:** `#D8E8DA`

### Neutral/Background
- **Cream:** `#FAFAF7` (Main app background, soft and organic compared to stark white)

## 3. Typography
- **Primary Font:** `Inter` (sans-serif)
- **Usage:** Modern, clean, and highly readable.
- **Hierarchy:**
  - `h1`: 32px (2rem), Bold (700)
  - `h2`: 24px (1.5rem), SemiBold (600)
  - `h3`: 20px (1.25rem), Medium (500)
  - `body`: 16px (1rem), Regular (400)
  - `small`: 14px (0.875rem), Regular (400)

## 4. Spacing & Layout
- Use Tailwind's default spacing scale (`4`, `8`, `16`, `24`, `32` px).
- **Border Radius:**
  - Standard cards/modals: `xl` (12px)
  - Large containers: `2xl` (16px)
  - Buttons: `lg` (8px) or `full` for pills.
- **Max Widths:** Limit content width to `max-w-7xl` (1280px) for ultra-wide screens to maintain readability.

## 5. Components & UI Elements
Do not deviate from the core components in `components/ui/`.
- **Buttons:** Use consistent padding, rounded corners, and hover states. Primary actions use `bg-primary`, secondary actions use outline styles.
- **Cards:** Use subtle shadows (`shadow-sm` or `shadow-md`) and `bg-white` over the `bg-cream` main background to create depth.
- **Badges:** Use tinted backgrounds (e.g., `bg-accent-50 text-accent-700`) for statuses (Pending, Confirmed).

## 6. Animations & Micro-interactions
- **Transitions:** Use Tailwind's `transition-all duration-200 ease-in-out` on all interactive elements (buttons, links, form inputs).
- **Hover Effects:** Lift cards slightly (`-translate-y-1 shadow-lg`) and darken button backgrounds.
- **Loading States:** Use skeleton loaders instead of traditional spinners for content heavy areas (Product Grids). Use the `Spinner` component for buttons.

## 7. Accessibility (a11y)
- **Contrast:** Ensure all text passes WCAG AA standards (e.g., white text on `primary`, dark text on `cream`).
- **Focus Rings:** Never remove `focus:ring`. Style it with `focus:ring-2 focus:ring-primary focus:outline-none`.
- **Semantic HTML:** Use `<nav>`, `<main>`, `<article>`, `<section>`, and `<aside>` appropriately.
## 8. Mobile Navigation Patterns
- **Bottom Navigation (`FarmerBottomNav`):** For mobile devices, core actions are placed at the bottom to accommodate thumb reachability. The bottom nav is fixed, uses explicit icons with labels, and dynamically highlights the active page. Keep the bottom inset safe area into consideration for modern devices with gesture bars (`env(safe-area-inset-bottom)`).

## 8.1 Location & Barangay Selection Pattern
- **Mobile-First Select/Combobox:** Since Agoo has 49 barangays, standard select dropdowns on budget Android devices can be cumbersome without quick-search or grouped layout.
- **Visual Design:** Use consistent rounded borders (`rounded-xl` or `rounded-lg`), subtle outline colors (`border-outline-variant`), and clear focus rings (`focus:ring-2 focus:ring-primary/20`).
- **PWA Form Performance:** Keep dropdown DOM light to avoid memory spikes on low-RAM devices (1GB–2GB Android). Grouping or searchable select enhances UX significantly.

## 9. State Guidelines
- **Empty States:** Never show a blank screen. If a farmer has no crops, show an illustration with a clear Call to Action (CTA) like "Add your first crop".
- **Error States:** Use friendly error boundaries. If a data fetch fails, show a "Something went wrong" message with a "Try Again" button instead of crashing the app.
- **Loading States:** Use skeleton screens that mimic the layout of the content being loaded, to reduce perceived latency.

## 10. Accessibility (a11y)
- **Screen Readers:** Ensure all images and icons have `alt` tags or `aria-labels`.
- **Keyboard Navigation:** All interactive elements must be accessible via the `Tab` key.
- **Testing:** Periodically run Lighthouse Accessibility audits or use `axe-core` to catch contrast and semantic HTML issues.
