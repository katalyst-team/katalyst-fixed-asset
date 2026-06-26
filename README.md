# Fixed Asset Frontend (katalyst-fixed-asset)

Frontend for the Katalyst Fixed Asset Management System — a comprehensive platform for tracking, auditing, and managing physical assets across locations with RFID/EPC integration.

## Getting Started

**Prerequisites:** [bun](https://bun.sh/) (required — do not use npm/yarn/pnpm)

```bash
bun install
bun dev        # http://localhost:7331 (Turbopack)
bun run build  # production build + sitemap
bun run lint   # always run after changes
bun tsc --noEmit
```

Copy `.env.local.example` to `.env.local` and set `NEXT_PUBLIC_ENDPOINT_URL` to point at the API server.

## Technology Stack

| Concern | Library |
|---------|---------|
| Framework | Next.js 15, Pages Router, React 19 |
| Language | TypeScript |
| Styling | Tailwind CSS + shadcn/ui (Radix primitives) |
| Server state | TanStack React Query v5 |
| Client state | Zustand v5 (complex), React Context (simple/global) |
| Forms | React Hook Form + Zod / Yup |
| API client | Axios (`src/services/index.ts` — automatic JWT refresh) |
| i18n | next-i18next (en / id) |
| Charts | Recharts |
| Printing | QZ Tray via `jsprintmanager` |

## Project Structure

```
src/
├── components/shared/   # Reusable UI (ButtonDelete, PaginationCursor, EmptyState, …)
├── context/             # Global React Context (user, theme, menu)
├── hooks/api/[domain]/  # React Query hooks wrapping service calls
├── lib/                 # jwt.ts, menu-utils.ts, authTokens.ts, utils.ts
├── middleware.ts         # Auth + locale redirect gating /dashboard/*
├── modules/
│   ├── auth/            # Sign-in, sign-up, password reset
│   └── dashboard/
│       ├── fixed-assets/  # PRIMARY FEATURE (see below)
│       ├── overview/
│       ├── store/
│       ├── employee/
│       ├── gate-*/
│       ├── device-monitoring/
│       └── [other features]/
├── pages/dashboard/     # Next.js file-based routes (thin wrappers)
├── services/[domain]/   # Pure async functions calling fetcher()
├── styles/globals.css   # Design system CSS classes
└── types/               # TypeScript interfaces per domain
```

Configuration files: `next.config.ts`, `tailwind.config.ts`, `eslint.config.mjs`, `postcss.config.mjs`, `next-i18next.config.js`.

## Architecture

### Layer Pattern

1. **Service** (`src/services/[domain]/`) — pure async functions wrapping `fetcher()` (Axios). Every call receives `organizationId` derived from `tokenPayload?.organization_id ?? ""`.
2. **React Query hook** (`src/hooks/api/[domain]/`) — `useQuery`/`useMutation` wrappers with key factories.
3. **Feature module** (`src/modules/dashboard/[feature]/`) — page components + state. Newer modules use Zustand slices; legacy modules use React Context providers.
4. **Page** (`src/pages/dashboard/[feature]/index.tsx`) — thin wrapper with `<DashboardLayout>`, provider/store, and `createPageSEO()`.

### Fixed Assets Module (`src/modules/dashboard/fixed-assets/`)

The primary feature of this repo. Key internal patterns:

- **`<FaLayout>`** — wraps every FA page with `FaModalProvider` + `FaErrorBoundary`. Required.
- **Modal system** — centralized via `useFaModal` (`modals/FaModalContext.tsx`). Call `openModal(type, payload)` where `type` is a `FaModalType` string. `FaModalRoot` renders the active modal. Never use ad-hoc `useState` for modal visibility.
- **`useFaPermission`** — exposes `isAdmin`, `isManager`, `canDelete`, `canManage`, `canManageSettings`, `canManageUsers`, `hasPermission(name)`. Admin bypasses all checks.
- **`<FaQueryState>`** / **`<FaQueryError>`** (`FaQueryState.tsx`) — standardized loading/error/empty states. Use instead of inline branching.
- **Shell components** (`FaShell.tsx`) — `FaShellHead`, `FaStat`, `FaKpiStrip`, `FaMeter`, `FaProtoIcon`.
- **Constants** (`constants.ts`) — `CAT_ICON/TONE/LABEL` (category slugs) and `STATUS_TONE/LABEL` (status slugs).
- **Types** — `src/types/fixed-assets.ts` (`FaAsset`, `AssetCategory`, `AssetStatus`, …).
- **Scale** — 80+ service files, 80+ React Query hooks, 20 page sub-routes.

### Auth & Identity

`useUser()` from `@/context/user-context` is the single entry point:
- `tokenPayload` — decoded JWT with `organization_id`, `role`, `permissions[]`, `stores[]`, account status flags.
- Derive `organizationId` inline at every call site: `const organizationId = tokenPayload?.organization_id ?? ""`.
- `selectedTeam` is a **store** ID (not org), persisted as `selectedStoreId` in localStorage.

JWT refresh is automatic in `src/services/index.ts` — never write manual refresh logic.

### State Management

| State type | Tool |
|-----------|------|
| Server / API data | React Query |
| Complex feature state (filters, pagination) | Zustand slices |
| Simple feature state | React Context |
| Global (auth, menu, theme) | React Context |

### Pagination

Cursor-based: `next_cursor` / `prev_cursor` in `ApiResponse.pagination`. Use `<PaginationCursor>` from `@/components/shared/PaginationCursor` for UI.

### Internationalization

Default locale: `id` (Indonesian). Supported: `en`, `id`. Namespace JSON files live in `public/locales/{lang}/{namespace}.json`. When adding a page, register the namespace in `next-i18next.config.js` and create both locale files.

## Design System

Project-specific CSS classes in `src/styles/globals.css`:

- Layout: `.ks-page-head`, `.ks-page-title`, `.ks-page-desc`, `.ks-page-actions`
- Card: `.ks-card`, `.ks-card-head`, `.ks-card-title`, `.ks-card-desc`, `.ks-card-body`
- Buttons: `.ks-btn`, `.ks-btn-primary`, `.ks-btn-ghost`, `.ks-btn-sm`, `.ks-btn-icon`
- Badges: `.ks-badge .success/.warn/.danger/.info/.brand/.outline`

Use semantic Tailwind tokens (`text-foreground`, `bg-muted`) over hardcoded colors for dark-mode safety.

## QZ Tray Integration

Direct-printer communication for RFID label printing via [QZ Tray](https://qz.io/).

**Setup:** Install and start QZ Tray on the client machine.

**Entry points:**
- `src/hooks/usePrintV5.ts` — `usePrintV5` hook wrapping `window.qz`
- `src/pages/api/qz/sign-message.ts` — signing endpoint
- `public/js/qz-tray.js` — client library (loaded in `src/pages/_document.tsx`)

**Flow:** TLJ template → ThermalLabel API → ZPL → QZ Tray → printer.

## Environment Variables

```
NEXT_PUBLIC_ENDPOINT_URL=http://localhost:8000/api   # required
NEXT_PUBLIC_BASE_URL_FE=http://localhost:7331
NEXT_PUBLIC_BASE_URL=http://localhost:7331
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_MIXPANEL_TOKEN=<token>
NEXT_PUBLIC_API_URL_DESKTOP_READER=<url>             # optional
```

## Cloud Functions

`cloud-functions/uploadFileV2.js` — standalone Google Cloud Function for streaming large file uploads (up to 1000 MB). Not part of the Next.js bundle; deployed separately.
