# Required API Endpoints for New Features

## Overview: Alert Strip
The alert strip displays critical inventory information that requires backend API support.

### 1. Critical Stock Alerts
**Endpoint:** `GET /v1/organizations/{organization_id}/alerts/critical-stock`
**Purpose:** Get SKUs below safety stock threshold

**Response:**
```typescript
{
  count: number;
  items: Array<{
    sku_id: string;
    sku_name: string;
    current_stock: number;
    safety_stock: number;
    store_id: string;
  }>;
}
```

### 2. Aging Stock Alerts
**Endpoint:** `GET /v1/organizations/{organization_id}/alerts/aging-stock`
**Purpose:** Get SKUs with slow movement (aging > 90 days)

**Response:**
```typescript
{
  count: number;
  items: Array<{
    sku_id: string;
    sku_name: string;
    last_movement_date: string;
    days_aging: number;
    current_stock: number;
  }>;
}
```

### 3. EPC Mismatch Alerts
**Endpoint:** `GET /v1/organizations/{organization_id}/alerts/epc-mismatches`
**Purpose:** Get discrepancies between gate scans and ledger

**Response:**
```typescript
{
  count: number;
  date: string;
  mismatches: Array<{
    epc: string;
    expected_location: string;
    actual_location?: string;
    last_scan_time: string;
  }>;
}
```

### 4. Pending Stock Audits
**Endpoint:** `GET /v1/organizations/{organization_id}/alerts/pending-audits`
**Purpose:** Get count of stock audits pending completion

**Response:**
```typescript
{
  count: number;
  audits: Array<{
    audit_id: string;
    audit_name: string;
    store_id: string;
    scheduled_date: string;
    status: 'scheduled' | 'in_progress';
  }>;
}
```

---

## Overview: Recent Transactions
Displays latest inbound/outbound transactions.

**Endpoint:** `GET /v1/organizations/{organization_id}/transactions/recent`
**Query Parameters:**
- `limit`: number (default: 10)
- `store_id`: string (optional)

**Response:**
```typescript
{
  transactions: Array<{
    id: string;
    type: 'Inbound' | 'Outbound';
    item_name: string;
    sku_id: string;
    quantity: number;
    timestamp: string;
    store_id: string;
    user_id: string;
  }>;
}
```

---

## Overview: Category Distribution
Pie chart showing inventory distribution by category.

**Endpoint:** `GET /v1/organizations/{organization_id}/analytics/category-distribution`
**Query Parameters:**
- `store_id`: string (optional)

**Response:**
```typescript
{
  distribution: Array<{
    category_id: string;
    category_name: string;
    item_count: number;
    percentage: number;
  }>;
}
```

---

## Overview: Stock Health (Donut Chart)
Visual representation of stock status.

**Endpoint:** `GET /v1/organizations/{organization_id}/analytics/stock-health`
**Query Parameters:**
- `store_id`: string (optional)

**Response:**
```typescript
{
  in_stock: number;
  low_stock: number;
  critical: number;
  total_sku: number;
  accuracy_percentage: number;
}
```

---

## Overview: Top Movers
Shows items with highest movement velocity.

**Endpoint:** `GET /v1/organizations/{organization_id}/analytics/top-movers`
**Query Parameters:**
- `period`: '7d' | '30d' | '90d' | 'YTD'
- `store_id`: string (optional)
- `limit`: number (default: 10)

**Response:**
```typescript
{
  movers: Array<{
    sku_id: string;
    sku_name: string;
    inbound_quantity: number;
    outbound_quantity: number;
    total_movement: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}
```

---

## Overview: Low-Stock Watchlist
List of SKUs approaching or below safety stock.

**Endpoint:** `GET /v1/organizations/{organization_id}/alerts/low-stock`
**Query Parameters:**
- `threshold`: 'safety' | 'critical' (default: 'safety')
- `store_id`: string (optional)

**Response:**
```typescript
{
  items: Array<{
    sku_id: string;
    sku_name: string;
    current_stock: number;
    safety_stock: number;
    reorder_point: number;
    days_until_out_of_stock?: number;
    supplier_lead_time_days: number;
  }>;
}
```

---

## User Preferences
For saving theme, density, and other user preferences.

**Endpoint:** `GET /v1/users/{user_id}/preferences`
**Response:**
```typescript
{
  theme: 'light' | 'dark' | 'system';
  color_theme: 'blue' | 'green' | 'indigo' | 'slate' | 'purple';
  density: 'comfortable' | 'compact';
  dismissed_alerts: string[];
}
```

**Endpoint:** `PATCH /v1/users/{user_id}/preferences`
**Request Body:**
```typescript
{
  theme?: 'light' | 'dark' | 'system';
  color_theme?: 'blue' | 'green' | 'indigo' | 'slate' | 'purple';
  density?: 'comfortable' | 'compact';
  dismiss_alert_id?: string;
}
```

---

## Notification System
For real-time alerts and notifications.

**Endpoint:** `GET /v1/users/{user_id}/notifications`
**Query Parameters:**
- `unread_only`: boolean
- `limit`: number

**Response:**
```typescript
{
  notifications: Array<{
    id: string;
    type: 'warning' | 'info' | 'success' | 'danger';
    title: string;
    message: string;
    count?: number;
    timestamp: string;
    is_read: boolean;
    action_url?: string;
  }>;
}
```

**Endpoint:** `PATCH /v1/users/{user_id}/notifications/{notification_id}/read`

**Endpoint:** `DELETE /v1/users/{user_id}/notifications/{notification_id}`

---

## Backend Implementation Status

**Note:** All endpoints documented in this file have been implemented by the backend team.

## Frontend Implementation Status

For detailed tracking of frontend implementation progress, see:
- **`docs/DASHBOARD_IMPLEMENTATION_STATUS.md`** - Complete status of all features

### Quick Summary

**✅ Fully Implemented (Frontend):**
- Notification System (with polling)
- Theme System (light/dark, color themes, density)
- Filter Header Standardization (8 pages)

**🎨 UI Ready - Need API Integration:**
- Recent Transactions (UI complete, using mock data)
- Category Distribution (UI complete, using mock data)
- Alerts Component (UI complete, using mock data)
- Alert Strip (UI complete, hardcoded values)
- User Preferences (switchers exist, localStorage only)

**⏳ Pending - Backend APIs Not Ready:**
- Stock Health Donut (component commented out)
- Top Movers (component not created)
- Low-Stock Watchlist (component not created)

### Frontend Implementation Priority

**Phase 1 (Backend Ready - High Priority):**
1. **Recent Transactions** - Connect to `GET /v1/organizations/{organization_id}/transactions/recent`
2. **Category Distribution** - Connect to `GET /v1/organizations/{organization_id}/analytics/category-distribution`
3. **Alerts + Alert Strip** - Connect to 4 alert endpoints (critical, aging, EPC, audits)
4. **User Preferences** - Connect to `GET/PATCH /v1/users/{user_id}/preferences`

**Phase 2 (Backend Not Ready - Medium Priority):**
1. **Stock Health Donut** - Waiting for `GET /v1/organizations/{organization_id}/analytics/stock-health`
2. **Top Movers** - Waiting for `GET /v1/organizations/{organization_id}/analytics/top-movers`
3. **Low-Stock Watchlist** - Waiting for `GET /v1/organizations/{organization_id}/alerts/low-stock`

---

## Notes

- All endpoints should support organization_id filtering
- Consider adding caching for analytics endpoints
- Real-time features (EPC mismatches) may need WebSocket support
- User preferences should sync across devices
- Alert dismissal state should be persisted
