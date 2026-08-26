# FarmFlow - Coding and Implementation Rules

To ensure maintainable code, faster development, and fewer bugs, all contributions to FarmFlow must strictly adhere to the following rules.

## 1. SOLID Principles
- **Single Responsibility:** A component, function, or file should do one thing. If a component handles fetching, complex state, and UI rendering, abstract the logic into a custom hook (e.g., `hooks/useFarm.ts`) or server action.
- **Open/Closed:** Write components that are open for extension but closed for modification. Use composition (`children` props, polymorphic components) instead of passing 20 different boolean flags to a UI component.
- **Dependency Inversion:** Depend on abstractions. For example, UI components shouldn't directly import Prisma; they should receive data as props from Server Components.

## 2. DRY (Don't Repeat Yourself) Method
- **Rule of 4:** If a function, UI pattern, or business logic is repeated **4 times or more**, it MUST be abstracted.
- **UI Components:** Push repeated UI to `components/ui/`.
- **Utility Functions:** Push repeated string formatting, date manipulation, or math to `lib/utils.ts`.
- **Types:** Extract repeated inline TypeScript types or Zod schemas to `types/index.ts` or `lib/validations/`.

## 3. KISS (Keep It Simple, Stupid)
- Avoid over-engineering. Do not create complex generic types or multi-layered architectures for simple CRUD operations.
- Prefer explicit Server Actions over creating complex API route handlers unless absolutely necessary (like for webhooks).
- If a feature can be implemented securely and performantly in 10 lines of code, do not write 100 lines of abstractions.

## 4. Next.js App Router specific Rules
- **Server by Default:** All components should be Server Components by default.
- **Client Boundary:** Use `"use client"` as far down the component tree as possible. Do not wrap entire pages in `"use client"`.
- **Data Fetching:** Fetch data in Server Components and pass it down as props. Do not use `useEffect` for initial data fetching.

## 5. Forms and Validation
- **Always use React Hook Form** for complex forms to prevent unnecessary re-renders.
- **Always validate with Zod** both on the client (resolvers) and on the server (Server Actions validation). Never trust client data.

## 6. Database and Prisma
- Never expose Prisma Client to the browser.
- Use strict typing. Do not use `any`.
- Keep queries efficient. Use `select` to fetch only the required fields instead of pulling massive relational graphs into memory.

## 7. Error Handling
- Use `try/catch` blocks in all Server Actions and API Routes.
- Show user-friendly error messages using `react-hot-toast`.
- Log critical errors appropriately (do not expose stack traces to the client).

## 8. Testing Standards
- **Unit Testing:** Write unit tests for critical business logic, specifically around cart calculations, payment processing, and complex data transformations.
- **End-to-End (E2E) Testing:** Implement E2E tests (e.g., Playwright) for critical user flows: User Login, Farmer Product Creation, and Buyer Checkout.

## 9. Git & Commits
- **Conventional Commits:** Use standard commit prefixes (`feat:`, `fix:`, `chore:`, `refactor:`, `docs:`) to maintain a readable history.
- **Pull Requests:** PRs must be reviewed and tested locally before merging to the `main` branch. Avoid pushing directly to `main`.
