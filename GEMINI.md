# Agent Guidelines

> `CLAUDE.md` and `AGENTS.md` are **synced copies of this file** (**not symlinks** — checked in as separate files). Their bodies are identical; **only the title + this sync-note header differ** (each references its own siblings). When you edit `GEMINI.md`, **manually copy the change to `CLAUDE.md` and `AGENTS.md`** so they don't drift. (A separate user-level `~/.claude/CLAUDE.md` also loads; where it conflicts with this repo file, this file is authoritative for this codebase.)

## Commands

- **Dev**: `bun run dev` (Turbopack, port **7331** — NOT 3000)
- **Build**: `bun run build` (Next.js build + sitemap via `postbuild` → `next-sitemap`)
- **Lint**: `bun run lint` — **always run after changes**
- **Typecheck**: `bun tsc --noEmit`

**Always use `bun`** — never npm/yarn/pnpm. Lockfile is `bun.lockb`. A stale `package-lock.json` is also checked in — **ignore it; do not run npm against it.** **No tests are configured** (no test runner, no test files) — verify with `lint` + `tsc --noEmit`.

**No build/lint/typecheck in CI.** The only GitHub workflows are Claude code review (`pull_request`), Claude on `@claude` mentions, and a malware scanner. Quality gates are **local-only** — always run lint + typecheck yourself before considering work done.

## Architecture

Next.js 15 **Pages Router** (not App Router). `trailingSlash: true` in `next.config.ts` means all routes end with `/`. Path alias: `@/*` → `./src/*`.

### Layer Pattern

1. **Services** (`src/services/[domain]/`): pure async functions calling `fetcher()` (axios wrapper in `src/services/index.ts`). Return shape: `ApiResponse<T>` with `data`, `metadata`, `pagination` (cursor-based: `next_cursor` / `prev_cursor`), and top-level `message`.
2. **React Query Hooks** (`src/hooks/api/[domain]/`): wrap service calls with `useQuery`/`useMutation`; query key factories like `KEY_USE_GET_LEDGER_DATA`.
3. **Feature Module** (`src/modules/dashboard/[feature]/`): state via either **Zustand store with slices** (newer — e.g. `src/modules/dashboard/sku/store/`, consumed through a thin `use[Feature].tsx` hook) or **React Context Provider** (legacy — `use[Feature].tsx` exports a `<FeatureProvider>` + `useFeature`). Both patterns coexist. Some features split store/components to `src/modules/[feature]/` (root, not under `dashboard/`) — check both locations.
4. **Pages** (`src/pages/dashboard/[feature]/index.tsx`): thin wrappers composing `<DashboardLayout>`, the feature provider/store, and SEO via `createPageSEO()` from `@/utils/seo`.

### Cloud Functions (`cloud-functions/`)

Standalone **Google Cloud Functions** (Node.js, `@google-cloud/functions-framework`), **not** part of the Next.js build/bundle. Currently `uploadFileV2.js` — a streaming multipart upload proxy for large files (up to 1000MB; matches `bodySizeLimit` in `next.config.ts`). Deployed separately; do not import from `src/`. (Excluded from `tsc` since `tsconfig` only includes `*.ts/*.tsx`.)

### Auth & Org Context (important — easy to get wrong)

> **Watch the ID confusion.** The user-level `~/.claude/CLAUDE.md` (loaded into every session) states `selectedTeam` should be passed as `organizationId` — that is **incorrect**. The convention below is verified against 100+ call sites and overrides it.

`useUser()` from `@/context/user-context` is the single entry point. Two distinct IDs:

- **`tokenPayload`** — decoded JWT (`src/lib/jwt.ts`) with `organization_id`, `role`, `permissions[]`, `stores[]`, `account_status`, `account_organization_role_status`.
- **`organizationId`** — **not a property of `useUser()`**. Derive it inline at each call site: `const organizationId = tokenPayload?.organization_id ?? ""`. Pass to *every* API service call as the `organizationId` param (universal convention, 100+ call sites do this).
- **`selectedTeam`** — the selected **store** ID (NOT org). Persisted to `localStorage` as `selectedStoreId`; `"0"` means "all stores". Passed as `store_id` / `store_ids` in per-store queries.

Middleware (`src/middleware.ts`) gates `/dashboard/*`. **Its own default locale is `"en"`** (not `id` — that's the next-i18next default). Redirects: unauthenticated → `/${locale}/`; authenticated user hitting auth pages (`/`, `/sign-up`, `/reset-password`, etc.) → `/dashboard/overview`; `account_status === "PENDING"` → `/${locale}/sign-up/${encryptedEmail}`; `account_organization_role_status === "SUSPENDED"` → `/${locale}/verification-access`. PENDING/SUSPENDED checks only run when already authenticated.

### JWT Refresh (Automatic — do not handle manually)

`src/services/index.ts` checks token expiry before each request, refreshes via `/v1/accounts/refresh`, queues concurrent requests, and logs out on refresh failure. Tokens stored in cookies (`token`, `refresh_token`) via `cookies-next` / `src/lib/authTokens.ts`. **Never** write manual refresh logic.

### Pagination

Server-side, **cursor-based** (`next_cursor` / `prev_cursor` in `ApiResponse.pagination`). Frontend abstraction lives in Context Providers or Zustand pagination slices (see `src/modules/device-monitoring/store/paginationSlice.ts` for a cursor-history stack implementation). Use `<PaginationCursor>` from `@/components/shared/PaginationCursor` for UI.

### Log Modules (shared blueprint)

Modules like st-kering-log, lamina-log, st-basah-log, penerimaan-log, and ledger-product all follow the same pattern — understanding one unlocks the rest:

- Reuse the **generic product API** (`useGetProductDataQuery` + `ProductFilterOptions` from `src/services/product/getProductService.ts`) — no per-module service files.
- Dynamic attribute columns via `<AttributeColumnHeader>` (`src/modules/dashboard/ledger-product/`). Type support: SELECT/CHECKBOX → checkbox presets, TEXT/NUMBER → input, BOOLEAN → true/false. **REFERENCE_GROUP is unsupported** for inline filtering.
- Attribute filters use `query_attributes` (`Record<string, string[]>` — attribute ID → values array; store can hold object or JSON string, service serializes either) and `query_date_attributes` (`{ date_attributes: [{ attribute_id, start_date, end_date }] }`, JSON string).
- Filter popovers keep **local state** during editing, commit to store + URL only on Apply. When building `query_attributes`, preserve keys managed by `<AttributeColumnHeader>` (column-header filters) and only replace the popover-managed keys.

### State Management Split

- **Server state**: React Query (all API data)
- **Complex feature state** (filters, pagination, store selection): Zustand stores with slices (e.g. `src/modules/dashboard/sku/store/`) — newer pattern
- **Simple feature state**: React Context Provider (legacy pattern)
- **Global auth/menu/preferences**: React Context (`src/context/`)

### Internationalization

Default locale: Indonesian (`id`). Supported: `en`, `id`. Namespace-based: `public/locales/{lang}/{namespace}.json` (full namespace list in `next-i18next.config.js`; default NS is `common`). Always use `useTranslation("namespace")`. `localeDetection: false` — locale handled manually via `NEXT_LOCALE` cookie. When adding a new feature page, register the namespace in `next-i18next.config.js` `ns[]` and create JSON files for both `en` and `id`.

## Design System (CSS)

Project-specific layout classes defined in `src/styles/globals.css` — use these instead of reinventing with raw Tailwind:

- `.ks-page-head` / `.ks-page-title` / `.ks-page-desc` / `.ks-page-actions` — page header layout
- `.ks-card` / `.ks-card-head` / `.ks-card-title` / `.ks-card-desc` / `.ks-card-body` — card container
- `.ks-btn` / `.ks-btn-primary` / `.ks-btn-ghost` / `.ks-btn-sm` / `.ks-btn-icon` — button variants
- `.ks-badge` with `.success` / `.warn` / `.danger` / `.info` / `.brand` / `.outline` — badge variants

All use CSS variables (`--text`, `--border`, `--surface`, `--brand`, etc.) so they are **dark-mode safe**. When writing custom Tailwind, prefer semantic tokens (`text-foreground`, `bg-muted`, `text-muted-foreground`) over hardcoded colors (`text-gray-900`, `bg-white`). A density switcher (`.density-compact`) further adjusts spacing.

## Shared Components (`src/components/shared/`)

Reusable components — check here before building new ones: `ButtonDelete` (AlertDialog confirm), `ButtonAdd`, `ButtonEdit`, `ButtonDetail`, `PaginationCursor` (cursor-based pagination), `EmptyState`, `Loading`, `SkeletonTable`, `FilterBar`, `FilterBadge`, `BadgeStatus`, `ColumnVisibility`, `ExportButton`, `DensitySwitcher`, `ColorThemeSwitcher`.

## Forms

Use `react-hook-form` + shadcn `Form`/`FormField`/`FormControl`/`FormItem`/`FormLabel`/`FormMessage` (from `@/components/ui/form`). Validation via `@hookform/resolvers` with `zod` or `yup`. See `src/modules/dashboard/gate-management/GateManagementPage.tsx` for the canonical create-form pattern.

## Code Style (Enforced by ESLint — `eslint.config.mjs`)

- **Max 500 lines per file** (error) — use `/* eslint-disable max-lines */` only when unavoidable
- **Semicolons**: required (`semi: error`)
- **Import sorting**: `simple-import-sort` (error, auto-fixable)
- **No unused imports/vars**: error (auto-fixed by `unused-imports` plugin; prefix discarded vars with `_`)
- **Private members**: must be camelCase with leading underscore (`@typescript-eslint/naming-convention`)
- **Event handler props**: must use `on` prefix (`react/jsx-handler-names`: `onSubmit`, `onCancel`)
- **Component defs**: named → `function-declaration` | `arrow-function`; unnamed → `arrow-function`
- **Object keys**: sorted alphabetically (`sort-keys-fix`, warn)
- **JSX props**: sorted alphabetically, `ref`/`key` first (`reservedFirst`), callbacks last, shorthand first; **one prop per line when multiline** (`react/jsx-max-props-per-line`, error)
- **No comments** unless explicitly requested

### Naming

| Type | Pattern | Example |
|------|---------|---------|
| Components | PascalCase | `LedgerItem`, `SkuModalAdd` |
| Hooks | camelCase + `use` prefix | `useLedger`, `useGetSkuDataQuery` |
| Service files | `[action][Domain]Service.ts` | `getLedgerDataService` |
| Types | `[Domain][Type]Type` | `LedgerItemType` |
| Query keys | `KEY_USE_GET_[DOMAIN]_DATA` | `KEY_USE_GET_LEDGER_DATA` |
| Event handlers | `handle[Action]` | `handleSubmit` |

### Error Handling

Use `toastError` from `@/services` for mutation errors. Do not create ad-hoc error toast logic.

### Filters

Filter state **must sync with URL query params** for shareable URLs (40+ modules follow this). On change, call `router.replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true })`. Initialize filter state from URL query once on mount (guard with `useRef`).

## Environment Variables

Public vars referenced in code. The first four are present in `.env.local` for local dev; the rest are deployment-only or have fallbacks:
```
NEXT_PUBLIC_ENDPOINT_URL=http://localhost:8000/api   # API base — required
NEXT_PUBLIC_BASE_URL_FE=http://localhost:7331        # redirects/logout (fallback: katalyst-fixed-asset.vercel.app)
NEXT_PUBLIC_BASE_URL=http://localhost:7331           # src/utils/seo.ts
NEXT_PUBLIC_ENV=development
NEXT_PUBLIC_MIXPANEL_TOKEN=<token>
NEXT_PUBLIC_API_URL_DESKTOP_READER=<url>             # optional, desktop reader services
NEXT_PUBLIC_VERCEL_ENV                               # auto-set by Vercel; read to detect deploy context
```

## Fixed Assets Module (Primary Feature)

This repo's primary feature is `src/modules/dashboard/fixed-assets/`. All work in this codebase likely involves this module.

**Layout wrapper**: Every FA page wraps its content in `<FaLayout>` (from `FaLayout.tsx`), which provides `FaModalProvider` + `FaErrorBoundary`. Never render an FA page without this wrapper.

**Modal system**: FA uses a single centralized modal context (`useFaModal` from `modals/FaModalContext.tsx`). Open modals with `openModal(type, payload)` where `type` is a `FaModalType` value (`"disposal"`, `"transfer"`, `"editAsset"`, etc.). `FaModalRoot` reads `type` and renders the correct modal. Do not use ad-hoc `useState` for modal visibility inside FA pages.

**Permission hook**: `useFaPermission` (`useFaPermission.ts`) exposes `isAdmin`, `isManager`, `canDelete`, `canManage`, `canManageSettings`, `canManageUsers`, `hasPermission(name)`, `hasAnyPermission(names[])`. Admin automatically bypasses all permission checks.

**Query state helpers**: Use `<FaQueryState>` (loading/error/empty gate) and `<FaQueryError>` (error-only with retry) from `FaQueryState.tsx`. Do not inline isLoading/isError branching in FA page JSX.

**Shell components** (`FaShell.tsx`): `FaShellHead` (page title + actions row), `FaStat` (KPI spark card), `FaKpiStrip` (horizontal KPI row), `FaMeter` (mini progress bar), `FaProtoIcon` (icon by name string via `protoIcon()` from `helpers.ts`). Use these for consistent FA page UI.

**Constants** (`constants.ts`): `CAT_ICON` / `CAT_TONE` / `CAT_LABEL` map asset category slugs (`it`, `furn`, `veh`, `lab`, `med`, `mach`, `tool`). `STATUS_TONE` / `STATUS_LABEL` map asset status slugs (`deployed`, `in-service`, `checked-out`, `maint`, `idle`, `retired`).

**Types**: All FA types live in `src/types/fixed-assets.ts` — `FaAsset`, `AssetCategory`, `AssetStatus`, `FaSite`, `FaCategoryStat`, etc. Always import from there.

**Scale**: 80+ service files in `src/services/fixed-assets/`, matching React Query hooks in `src/hooks/api/fixed-assets/`, and 20 sub-routes under `src/pages/dashboard/fixed-assets/`. All follow the repo-wide naming conventions.

## Key Gotchas

(Non-obvious items not covered above — see prior sections for bun, port, trailing slash, and i18n quirks.)

- Menu hierarchy is **API-driven** (`/accounts/me/menus`), not hardcoded. Route + icon mapping lives in `MENU_CONFIG` (`src/lib/menu-utils.ts`); fallback route map in `MENU_ROUTE_MAP` (`src/types/menu.ts`). `MOBILE_*` menus are filtered out. To add a new sidebar page, add the entry to `MENU_CONFIG` and ensure `MenuName` enum + `MENU_ROUTE_MAP` have the key.
- Some modules are tenant-specific (prefixed `kbm-`) for a timber/lumber tenant
- Icons: always use `lucide-react`, never other icon libraries
- shadcn/ui config (`components.json`): `rsc: false`, style `default`, base color `slate`, icon library `lucide`
- `cn()` utility from `@/lib/utils` for Tailwind class merging
- `reactStrictMode: true` is on
- **Printing (QZ Tray)**: direct-printer integration via `jsprintmanager`. Entry points: `usePrintV5` (`src/hooks/usePrintV5.ts`, wraps `window.qz`), signing via `useQZSigning` / `src/pages/api/qz/sign-message.ts`, and `<script src="/js/qz-tray.js">` loaded in `src/pages/_document.tsx`. Used by `PrintRfid.tsx` and `PrintModalV5.tsx`.
