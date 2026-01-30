# Vite to Next.js Migration Walkthrough

The project has been migrated from a Vite + React application to Next.js 16 (App Router).

## 1. Project Structure
- **New Project**: `frontend-next` (sibling to `frontend`).
- **Core Structure**:
  - `app/layout.tsx`: Root layout replacing `index.html` and wrapping providers.
  - `app/page.tsx`: Initial entry point.
  - `app/_pages/`: Contains all original page components migrated from `frontend/pages`.
  - `app/components/`: Reused components.
  - `app/store/`: Context providers.
  - `app/styles.css`: Consolidated legacy styles.

## 2. Key Migrations
- **Routing**: Replaced `react-router-dom` with `next/navigation` (`useRouter`, `usePathname`, `Link`).
- **Imports**: Updated all relative imports to match the new structure (e.g., imports from `_pages` or `@/app/types`).
- **Auth & Logic**:
  - `ClientLayout.tsx` implements the logic previously in `AuthWrapper` (user status check, socket connection, notifications).
  - `RouteGuards.tsx` implements `ProtectedRoute` and `AdminRoute` logic using `useEffect` and `useRouter`.
- **Styling**: 
  - Consolidated CSS components to `app/component-styles.css` to comply with Next.js Global CSS rules.
  - Tailwind layout preserved.

## 3. Scripts Used
- `migrate.js`: Automated replacement of `react-router-dom` imports, environment variables, and relative paths.
- `create_pages.js`: Generated the `app/**/page.tsx` file structure based on `App.tsx` routes.
- `consolidate_css.js`: Moved component-level CSS imports to a global file to fix build errors.

## 4. Environment
- `.env.local` created from `.env` with keys renamed to `NEXT_PUBLIC_*`.
- `next.config.ts` configured with API rewrites (proxy to port 8000) and allowed image domains.

## 5. Next Steps for Developer
1. **Verify Environment**: Ensure `.env.local` has correct values.
2. **Run Dev Server**: `cd frontend-next && npm run dev`.
3. **Testing**: Test the critical flows (Login, Checkout, Admin Dashboard) to ensure logic (Context, API) holds up.
