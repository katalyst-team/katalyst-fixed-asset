# Fixed Assets — Menu Grouping (Backend Spec)

Request to backend: group the 16 current flat `WEB_FA_*` menus under
collapsible parent headers so the sidebar is easier to navigate.

Frontend is ready — no UI code needed. `buildNavTreeFromApi()`
(`src/lib/menu-utils.ts`) renders any nesting depth from the API tree.
This doc defines the parent menu names and the tree the API must return.

---

## How grouping works (recap)

`GET /accounts/me/menus` returns a tree of `MeMenuItem`:

```ts
interface MeMenuItem {
  children?: MeMenuItem[];  // nested children → this item becomes a parent
  id: string;
  name: string;             // must exist in frontend MENU_CONFIG
  parent_id?: string;       // links to parent
  sort_order: number;       // order within siblings
}
```

Rules the frontend enforces (`src/lib/menu-utils.ts:200`):

- A menu **with children** → rendered as collapsible header, url forced to `#`.
- A menu **without children** → rendered as a leaf link, url from `MENU_CONFIG`.
- `sort_order` controls order within siblings (ascending).
- Menu names not in frontend `MENU_CONFIG` are silently dropped.

So to create a group, backend must:

1. Insert a **parent menu** row whose `name` is one of the new parent names
   listed below (these will be added to frontend `MENU_CONFIG` as icon-only
   entries).
2. Set the children's `parent_id` to that parent's `id`.
3. Set `sort_order` to control group order and order within each group.

---

## Proposed tree

```
WEB_FA_DASHBOARD                          (leaf, stays top-level — quick access)
WEB_FA_OPERATIONS                         (parent — icon-only)
├── WEB_FA_REGISTER
├── WEB_FA_MASTER_DATA
├── WEB_FA_AUDIT
└── WEB_FA_MAINTENANCE
WEB_FA_MOVEMENT                           (parent — icon-only)
├── WEB_FA_SCAN_IN
├── WEB_FA_SCAN_OUT
├── WEB_FA_CHECK_OUT
├── WEB_FA_TRANSFER
└── WEB_FA_RTLS
WEB_FA_TAGS                               (parent — icon-only)
└── WEB_FA_RFID_TAGS
WEB_FA_ADMIN                              (parent — icon-only)
├── WEB_FA_SECURITY
├── WEB_FA_REPORTS
├── WEB_FA_USERS
├── WEB_FA_SETTINGS
└── WEB_FA_DOCS
```

### Design notes

- **`WEB_FA_DASHBOARD` stays top-level** (not under a group) — it is the FA
  landing page and should be one click away, like `WEB_OVERVIEW`.
- **`WEB_FA_TAGS`** has a single child today. Kept as a group so future tag
  features (bulk import, tag templates) drop in naturally. If only one child
  feels odd, fold `WEB_FA_RFID_TAGS` into `WEB_FA_OPERATIONS` and drop this
  parent.
- **`WEB_FA_SECURITY`** is under Admin because it is permission/policy config,
  not a daily operations page. Move to Operations if security guards are
  operational.

---

## New parent menus (must be created in backend DB)

These names **do not exist yet** — backend must create them. Frontend will add
matching icon-only entries in `MENU_CONFIG` + `MenuName` enum (see
"Frontend changes" below).

| New menu name | Icon (frontend will set) | Purpose |
|---------------|--------------------------|---------|
| `WEB_FA_OPERATIONS` | Boxes | Asset lifecycle: register, master data, audit, maintenance |
| `WEB_FA_MOVEMENT` | ArrowLeftRight | Asset movement: scan in/out, check-out, transfer, RTLS |
| `WEB_FA_TAGS` | Tags | RFID tag management |
| `WEB_FA_ADMIN` | ShieldCheck | Administration: security, reports, users, settings, docs |

> Parent menus should have **no route / no page**. The frontend forces their
> url to `#` automatically when they have children.

---

## sort_order guide

`sort_order` is relative to siblings. Suggested values leave room for
inserts:

### Top-level FA ordering

| sort_order | Menu | Type |
|------------|------|------|
| 10 | `WEB_FA_DASHBOARD` | leaf |
| 20 | `WEB_FA_OPERATIONS` | parent |
| 30 | `WEB_FA_MOVEMENT` | parent |
| 40 | `WEB_FA_TAGS` | parent |
| 50 | `WEB_FA_ADMIN` | parent |

### Within `WEB_FA_OPERATIONS`

| sort_order | Menu |
|------------|------|
| 10 | `WEB_FA_REGISTER` |
| 20 | `WEB_FA_MASTER_DATA` |
| 30 | `WEB_FA_AUDIT` |
| 40 | `WEB_FA_MAINTENANCE` |

### Within `WEB_FA_MOVEMENT`

| sort_order | Menu |
|------------|------|
| 10 | `WEB_FA_SCAN_IN` |
| 20 | `WEB_FA_SCAN_OUT` |
| 30 | `WEB_FA_CHECK_OUT` |
| 40 | `WEB_FA_TRANSFER` |
| 50 | `WEB_FA_RTLS` |

### Within `WEB_FA_TAGS`

| sort_order | Menu |
|------------|------|
| 10 | `WEB_FA_RFID_TAGS` |

### Within `WEB_FA_ADMIN`

| sort_order | Menu |
|------------|------|
| 10 | `WEB_FA_SECURITY` |
| 20 | `WEB_FA_REPORTS` |
| 30 | `WEB_FA_USERS` |
| 40 | `WEB_FA_SETTINGS` |
| 50 | `WEB_FA_DOCS` |

---

## Example API response (partial)

```jsonc
{
  "data": {
    "menus": [
      // ... other top-level menus (WEB_OVERVIEW, etc.) ...
      {
        "id": "menu_fa_dashboard",
        "name": "WEB_FA_DASHBOARD",
        "sort_order": 100
        // no parent_id → top-level leaf
      },
      {
        "id": "menu_fa_operations",
        "name": "WEB_FA_OPERATIONS",
        "sort_order": 110
        // no parent_id → top-level; has children → becomes collapsible header
      },
      {
        "id": "menu_fa_register",
        "name": "WEB_FA_REGISTER",
        "parent_id": "menu_fa_operations",
        "sort_order": 10
      },
      {
        "id": "menu_fa_master_data",
        "name": "WEB_FA_MASTER_DATA",
        "parent_id": "menu_fa_operations",
        "sort_order": 20
      }
      // ... etc
    ]
  }
}
```

> Whether the API nests children inside a `children[]` array **or** returns a
> flat list with `parent_id`, the frontend handles both — `buildNavTreeFromApi`
> reads `children[]`. If the API returns flat + `parent_id`, the data layer
> must tree-ify it before passing to `buildNavTreeFromApi`. Confirm which shape
> the current `/accounts/me/menus` returns.

---

## Frontend changes (do AFTER backend creates the parents)

Once the parent menu names exist in the backend, frontend adds 4 icon-only
entries. No other UI work.

**1. `src/lib/menu-utils.ts` — `MENU_CONFIG`** (add alphabetically):

```ts
WEB_FA_ADMIN: { icon: ShieldCheck },
WEB_FA_MOVEMENT: { icon: ArrowLeftRight },
WEB_FA_OPERATIONS: { icon: Boxes },
WEB_FA_TAGS: { icon: Tags },
```

> Note: `Boxes` is already imported. `ShieldCheck` and `ArrowLeftRight` need
> adding to the `lucide-react` import block at the top of the file. `Tags` is
> already imported.

**2. `src/types/menu.ts` — `MenuName` enum** (add):

```ts
WEB_FA_ADMIN = "WEB_FA_ADMIN",
WEB_FA_MOVEMENT = "WEB_FA_MOVEMENT",
WEB_FA_OPERATIONS = "WEB_FA_OPERATIONS",
WEB_FA_TAGS = "WEB_FA_TAGS",
```

No `MENU_ROUTE_MAP` entries needed — parents have no route (url forced to `#`
when they have children).

**3. `docs/MENU_STRUCTURE.md`** — move the 4 groups from "Standalone" to a new
"FA Grouped" section, matching the final tree.

---

## Rollout order

1. **Backend** creates the 4 parent menu rows + sets `parent_id` on children.
2. **Frontend** adds the 4 icon-only entries to `MENU_CONFIG` + `MenuName`.
3. Verify sidebar renders the collapsible groups.

If backend ships first (before frontend update), the new parents are silently
dropped by the frontend (unknown menu name guard at `menu-utils.ts:204`) — no
crash, but grouping won't appear until frontend catches up. Safe to deploy in
either order.
