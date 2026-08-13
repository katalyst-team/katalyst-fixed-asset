# Agent Guidelines

> `CLAUDE.md` and `GEMINI.md` are **synced copies of this file** (**not symlinks** — checked in as separate files). Their bodies are identical; **only the title + this sync-note header differ** (each references its own siblings). When you edit `AGENTS.md`, **manually copy the change to `CLAUDE.md` and `GEMINI.md`** so they don't drift. (A separate user-level `~/.claude/CLAUDE.md` also loads; where it conflicts with this repo file, this file is authoritative for this codebase.)

## Commands

## Commands

- **Dev**: `bun run dev` (Turbopack, port **7331** — NOT 3000)
- **Build**: `bun run build` (Next.js build + sitemap via `postbuild` → `next-sitemap`)
- **Lint**: `bun run lint` — **always run after changes**
- **Typecheck**: `bun tsc --noEmit`

**Always use `bun`** — never npm/yarn/pnpm. Lockfile is `bun.lockb`. **No tests are configured** (no test runner, no test files) — verify with `lint` + `tsc --noEmit`.

**No build/lint/typecheck in CI.** The only GitHub workflows are Claude code review (`pull_request`), Claude on `@claude` mentions, and a malware scanner. Quality gates are **local-only** — always run lint + typecheck yourself before considering work done.

## Architecture

Next.js 15 **Pages Router** (not App Router). `trailingSlash: true` in `next.config.ts` means all routes end with `/`. Path alias: `@/*` → `./src/*`.

### Layer Pattern

1. **Services** (`src/services/[domain]/`): pure async functions calling `fetcher()` (axios wrapper in `src/services/index.ts`). Return shape: `ApiResponse<T>` with `data`, `metadata`, and page-based pagination. FA endpoints use the `page_pagination` key; other domains use `pagination`. There is no top-level `message` — it lives in `metadata.message`.
2. **React Query Hooks** (`src/hooks/api/[domain]/`): wrap service calls with `useQuery`/`useMutation`; query key factories like `KEY_USE_GET_LEDGER_DATA`.
3. **Feature Module** (`src/modules/dashboard/[feature]/`): one `Fa*Page.tsx` component per route, local `useState` for view state, `useFaModal` for dialogs. There are no per-feature Zustand stores or feature Context providers left in this repo (the dep is still installed; don't add one without reason).
4. **Pages** (`src/pages/dashboard/[feature]/index.tsx`): thin wrappers composing `<DashboardLayout>`, `<FaLayout>`, and SEO via `createPageSEO()` from `@/utils/seo`.

**Only two dashboard modules exist**: `fixed-assets/` (everything) and `profile/`. All inventory/log/SKU modules were deleted in commit `02b5cb4` — if you find a doc or import referencing them, it's stale.

### Backend (katalyst-core)

The backend lives in a **separate sibling repo** at `../katalyst-core/` (same parent
directory, outside this repo). Stack: **Go 1.26 + Fiber + GORM + PostgreSQL + Redis +
MinIO**, migrations via Atlas. See that repo's `AGENTS.md` for architecture, commands
(`make run`, `make pre-pr`), and the layered domain pattern.

**Fixed Assets backend** (`core/fixed_asset/`): ~75 endpoints under
`/v1/organizations/:organizationID/fa/`, ~31 `fa_*` tables. Runs locally on `:8000`
(matches `NEXT_PUBLIC_ENDPOINT_URL`).

**Roles/permissions** come from the JWT and use backend enum values verbatim —
roles `APP_SUPERADMIN`, `APP_ADMIN`, `ORGANIZATION_OWNER`, `ORGANIZATION_ADMIN`,
`ORGANIZATION_MEMBER`, `ORGANIZATION_OPERATOR`, `ORGANIZATION_VERIFIER`,
`ORGANIZATION_HO`; permissions `ORGANIZATION_{CREATE,READ,UPDATE,DELETE}_ALL` etc.
Never invent lowercase shorthands like `"admin"` or `"fa.delete"` — see
`useFaPermission.ts`.

### Cloud Functions (`cloud-functions/`)

Standalone **Google Cloud Functions** (Node.js, `@google-cloud/functions-framework`), **not** part of the Next.js build/bundle. Currently `uploadFileV2.js` — a streaming multipart upload proxy for large files (up to 1000MB; matches `bodySizeLimit` in `next.config.ts`). Deployed separately; do not import from `src/`. (Excluded from `tsc` since `tsconfig` only includes `*.ts/*.tsx`.)

### Auth & Org Context (important — easy to get wrong)

> **Watch the ID confusion.** The user-level `~/.claude/CLAUDE.md` (loaded into every session) states `selectedTeam` should be passed as `organizationId` — that is **incorrect**. The convention below is verified against 100+ call sites and overrides it.

`useUser()` from `@/context/user-context` is the single entry point. Two distinct IDs:

- **`tokenPayload`** — decoded JWT (`src/lib/jwt.ts`) with `organization_id`, `role`, `permissions[]`, `stores[]`, `account_status`, `account_organization_role_status`.
- **`organizationId`** — **not a property of `useUser()`**. Derive it inline at each call site: `const organizationId = tokenPayload?.organization_id ?? ""`. Pass to *every* API service call as the `organizationId` param (universal convention, 100+ call sites do this).
- **`selectedTeam`** — the selected **store** ID (NOT org). Persisted to `localStorage` as `selectedStoreId`; `"0"` means "all stores". Passed as `store_id` / `store_ids` in per-store queries.

Middleware (`src/middleware.ts`) gates `/dashboard/*`. **Its own default locale is `"en"`** (not `id` — that's the next-i18next default). Redirects: unauthenticated → `/${locale}/`; authenticated user hitting auth pages (`/`, `/sign-up`, `/reset-password`, etc.) → `/${locale}/dashboard/fixed-assets/`; `account_status === "PENDING"` → `/${locale}/sign-up/${encryptedEmail}`; `account_organization_role_status === "SUSPENDED"` → `/${locale}/verification-access`. PENDING/SUSPENDED checks only run when already authenticated.

### JWT Refresh (Automatic — do not handle manually)

`src/services/index.ts` checks token expiry before each request, refreshes via `/v1/accounts/refresh`, queues concurrent requests, and logs out on refresh failure. Tokens stored in cookies (`token`, `refresh_token`) via `cookies-next` / `src/lib/authTokens.ts`. **Never** write manual refresh logic.

### Pagination

Server-side, **page-based** — despite the component name, no endpoint this app calls uses cursor pagination. (A few orphaned files under `src/types/` still declare `next_cursor`/`prev_cursor`; nothing reads them.) Requests send `page` + `limit`. Fixed-assets endpoints return `page_pagination` (`page`, `limit`, `total_pages`, `total_records`, `count`, `has_next`, `has_prev`, `next_page`, `prev_page`); other domains return `pagination`. Keep the current page in local `useState` and drive nav from `has_next` / `has_prev`. Use `<PaginationCursor>` from `@/components/shared/PaginationCursor` for UI.

### State Management Split

- **Server state**: React Query (all API data)
- **Feature state**: local `useState` inside the `Fa*Page` component; modals through `useFaModal`
- **Global auth/menu/preferences**: React Context — only `user-context`, `menu-context`, `user-preferences-context` in `src/context/`

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

Reusable components — check here before building new ones: `ButtonDelete` (AlertDialog confirm), `ButtonAdd`, `ButtonEdit`, `ButtonDetail`, `PaginationCursor` (page-based pagination, despite the name), `EmptyState`, `Loading`, `SkeletonTable`, `FilterBar`, `FilterBadge`, `BadgeStatus`, `ColumnVisibility`, `TableExportButton`, `DensitySwitcher`, `ColorThemeSwitcher`.

## Forms

Use `react-hook-form` + shadcn `Form`/`FormField`/`FormControl`/`FormItem`/`FormLabel`/`FormMessage` (from `@/components/ui/form`). Validation via `@hookform/resolvers` with `zod` or `yup`. See `src/modules/dashboard/fixed-assets/modals/EditAssetModal.tsx` for the canonical form pattern.

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
| Components | PascalCase | `FaAuditPage`, `EditAssetModal` |
| Hooks | camelCase + `use` prefix | `useFaPermission`, `useGetAssetsQuery` |
| Service files | `[action][Domain]Service.ts` | `getAssetsService` |
| Types | `[Domain][Type]Type` | `FaAsset`, `AssetStatus` |
| Query keys | `KEY_USE_GET_[DOMAIN]_DATA` | `KEY_USE_GET_ASSETS_DATA` |
| Event handlers | `handle[Action]` | `handleSubmit` |

### Error Handling

Use `toastError` from `@/services` for mutation errors. Do not create ad-hoc error toast logic.

### Filters

Filter state **must sync with URL query params** for shareable URLs. Use `useUrlFilterSync` (`src/hooks/useUrlFilterSync.ts`) — it initializes from `router.query` once on mount and returns `syncToUrl(filters)` doing a shallow `router.replace`. Don't hand-roll the `useRef` init guard.

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

**Scale**: ~105 service files in `src/services/fixed-assets/`, matching React Query hooks in `src/hooks/api/fixed-assets/`, and 20 sub-routes under `src/pages/dashboard/fixed-assets/`. All follow the repo-wide naming conventions.

## Key Gotchas

(Non-obvious items not covered above — see prior sections for bun, port, trailing slash, and i18n quirks.)

- Menu hierarchy is **API-driven** (`/accounts/me/menus`), not hardcoded. Route + icon mapping lives in `MENU_CONFIG` (`src/lib/menu-utils.ts`); fallback route map in `MENU_ROUTE_MAP` (`src/types/menu.ts`). `MOBILE_*` menus are filtered out. To add a new sidebar page, add the entry to `MENU_CONFIG` and ensure `MenuName` enum + `MENU_ROUTE_MAP` have the key.
- Icons: always use `lucide-react`, never other icon libraries
- shadcn/ui config (`components.json`): `rsc: false`, style `default`, base color `slate`, icon library `lucide`
- `cn()` utility from `@/lib/utils` for Tailwind class merging
- `reactStrictMode: true` is on
- **Printing (QZ Tray)**: only the plumbing survives — `useQZSigning` (`src/hooks/useQZSigning.ts`), the signing endpoint `src/pages/api/qz/sign-message.ts`, and `<script src="/js/qz-tray.js">` in `src/pages/_document.tsx`. The print hooks/components that used them were deleted; wire new label printing on top of `useQZSigning` + `window.qz`. Requires QZ Tray running on the client machine.

## Git Workflow

- **Default branch for work**: `develop`. Single-developer repo — do **not** create a new branch unless the user explicitly asks; commit straight to `develop`.
