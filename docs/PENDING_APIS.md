# Pending Dashboard APIs

## Overview
This document outlines the dashboard overview APIs that are not yet implemented by the backend. These APIs are required to complete the Phase 2 implementation of the dashboard features.

## Pending APIs

### 1. Stock Health Donut Chart
**Status**: 🔴 Not Implemented by Backend  
**Frontend Status**: ⚠️ Component created, waiting for API  
**Priority**: High  
**Estimated Backend Effort**: 2-3 hours

#### API Specification
```
GET /v1/organizations/{organization_id}/analytics/stock-health
```

#### Request Headers
```
Authorization: Bearer {jwt_token}
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| store_id | string | No | Filter by specific store |
| start_date | string | No | ISO 8601 date (YYYY-MM-DD) |
| end_date | string | No | ISO 8601 date (YYYY-MM-DD) |

#### Expected Response
```typescript
{
  "message": "Stock health data retrieved successfully",
  "data": {
    "total_items": number,
    "healthy_items": number,
    "low_stock_items": number,
    "overstocked_items": number,
    "expiring_soon_items": number,
    "expired_items": number,
    "health_percentage": number,
    "breakdown": {
      "healthy": {
        "count": number,
        "percentage": number
      },
      "low_stock": {
        "count": number,
        "percentage": number
      },
      "overstocked": {
        "count": number,
        "percentage": number
      },
      "expiring_soon": {
        "count": number,
        "percentage": number
      },
      "expired": {
        "count": number,
        "percentage": number
      }
    }
  },
  "metadata": {
    "code": "SUCCESS",
    "correlation_id": "uuid",
    "message": "Stock health data retrieved successfully",
    "server_time": 1717234567890,
    "success": true
  },
  "pagination": {
    "count": 1,
    "next_cursor": null,
    "prev_cursor": null,
    "total_count": 1
  }
}
```

#### Business Logic Requirements
- **Healthy**: Stock level between min_stock and max_stock, not expiring within 30 days
- **Low Stock**: Stock level at or below min_stock threshold
- **Overstocked**: Stock level at or above max_stock threshold
- **Expiring Soon**: Expiry date within 30 days
- **Expired**: Expiry date is in the past
- **Health Percentage**: (healthy_items / total_items) * 100

#### Frontend Implementation Plan
1. Create `StockHealth.tsx` component with donut chart using recharts
2. Create service: `src/services/dashboard/getStockHealthService.ts`
3. Create React Query hook: `src/hooks/api/dashboard/useStockHealthQuery.ts`
4. Add polling interval: 5 minutes (data updates periodically)
5. Integrate into Overview.tsx

---

### 2. Top Movers
**Status**: 🔴 Not Implemented by Backend  
**Frontend Status**: ⚠️ Component created, waiting for API  
**Priority**: High  
**Estimated Backend Effort**: 3-4 hours

#### API Specification
```
GET /v1/organizations/{organization_id}/analytics/top-movers
```

#### Request Headers
```
Authorization: Bearer {jwt_token}
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| store_id | string | No | Filter by specific store |
| period | string | No | Time period: `day`, `week`, `month` (default: `week`) |
| limit | number | No | Number of items to return (default: `5`) |
| category_id | string | No | Filter by category |
| sort_by | string | No | Sort by: `quantity`, `revenue`, `percentage_change` (default: `quantity`) |
| sort_order | string | No | Sort order: `asc`, `desc` (default: `desc`) |

#### Expected Response
```typescript
{
  "message": "Top movers data retrieved successfully",
  "data": {
    "period": string,
    "top_movers": [
      {
        "sku_id": string,
        "sku_name": string,
        "sku_code": string,
        "product_name": string,
        "product_image": string,
        "category_id": string,
        "category_name": string,
        "current_quantity": number,
        "previous_quantity": number,
        "quantity_change": number,
        "quantity_change_percentage": number,
        "current_revenue": number,
        "previous_revenue": number,
        "revenue_change": number,
        "revenue_change_percentage": number,
        "trend": "up" | "down" | "neutral",
        "movement_type": "inbound" | "outbound" | "net"
      }
    ]
  },
  "metadata": {
    "code": "SUCCESS",
    "correlation_id": "uuid",
    "message": "Top movers data retrieved successfully",
    "server_time": 1717234567890,
    "success": true
  },
  "pagination": {
    "count": 5,
    "next_cursor": null,
    "prev_cursor": null,
    "total_count": 5
  }
}
```

#### Business Logic Requirements
- **Quantity Change**: `current_quantity - previous_quantity`
- **Quantity Change Percentage**: `(quantity_change / previous_quantity) * 100`
- **Revenue Change**: `current_revenue - previous_revenue`
- **Revenue Change Percentage**: `(revenue_change / previous_revenue) * 100`
- **Trend**: 
  - `up` if change_percentage > 5%
  - `down` if change_percentage < -5%
  - `neutral` if between -5% and 5%
- **Period Comparison**:
  - `day`: Compare today vs yesterday
  - `week`: Compare this week vs last week
  - `month`: Compare this month vs last month

#### Frontend Implementation Plan
1. Create `TopMovers.tsx` component with list/table view
2. Create service: `src/services/dashboard/getTopMoversService.ts`
3. Create React Query hook: `src/hooks/api/dashboard/useTopMoversQuery.ts`
4. Add polling interval: 5 minutes (data updates periodically)
5. Add period selector dropdown (day/week/month)
6. Add sort functionality (quantity/revenue/percentage_change)
7. Integrate into Overview.tsx

---

### 3. Low-Stock Watchlist
**Status**: 🔴 Not Implemented by Backend  
**Frontend Status**: ⚠️ Component created, waiting for API  
**Priority**: High  
**Estimated Backend Effort**: 2-3 hours

#### API Specification
```
GET /v1/organizations/{organization_id}/alerts/low-stock
```

#### Request Headers
```
Authorization: Bearer {jwt_token}
```

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| store_id | string | No | Filter by specific store |
| category_id | string | No | Filter by category |
| severity | string | No | Filter by severity: `critical`, `warning`, `all` (default: `all`) |
| limit | number | No | Number of items to return (default: `10`) |

#### Expected Response
```typescript
{
  "message": "Low stock alerts retrieved successfully",
  "data": {
    "total_alerts": number,
    "critical_alerts": number,
    "warning_alerts": number,
    "alerts": [
      {
        "alert_id": string,
        "sku_id": string,
        "sku_name": string,
        "sku_code": string,
        "product_name": string,
        "product_image": string,
        "category_id": string,
        "category_name": string,
        "store_id": string,
        "store_name": string,
        "current_quantity": number,
        "min_stock": number,
        "max_stock": number,
        "stock_deficit": number,
        "severity": "critical" | "warning",
        "last_restocked_date": string,
        "days_since_restock": number,
        "estimated_days_until_stockout": number,
        "recommended_reorder_quantity": number,
        "created_at": string,
        "updated_at": string
      }
    ]
  },
  "metadata": {
    "code": "SUCCESS",
    "correlation_id": "uuid",
    "message": "Low stock alerts retrieved successfully",
    "server_time": 1717234567890,
    "success": true
  },
  "pagination": {
    "count": 10,
    "next_cursor": null,
    "prev_cursor": null,
    "total_count": 50
  }
}
```

#### Business Logic Requirements
- **Severity Calculation**:
  - `critical`: `current_quantity <= 0` (out of stock)
  - `warning`: `0 < current_quantity <= min_stock` (low stock)
- **Stock Deficit**: `min_stock - current_quantity`
- **Days Since Restock**: `(current_date - last_restocked_date) in days`
- **Estimated Days Until Stockout**: Based on average daily consumption rate
- **Recommended Reorder Quantity**: `max_stock - current_quantity`

#### Frontend Implementation Plan
1. Create `LowStockWatchlist.tsx` component with table view
2. Create service: `src/services/alert/getLowStockAlertsService.ts`
3. Create React Query hook: `src/hooks/api/alert/useLowStockAlertsQuery.ts`
4. Add polling interval: 2 minutes (urgent alerts)
5. Add severity filter (critical/warning/all)
6. Add "Restock Now" action button (opens create inbound dialog)
7. Integrate into Overview.tsx

---

## Implementation Priority

### Phase 2a (High Priority)
1. **Low-Stock Watchlist** - Critical for inventory management
2. **Stock Health Donut** - Provides at-a-glance inventory status

### Phase 2b (Medium Priority)
3. **Top Movers** - Useful for analytics and trending analysis

## Backend Implementation Notes

### Database Queries Needed

#### Stock Health
```sql
SELECT 
  COUNT(*) as total_items,
  SUM(CASE WHEN quantity >= min_stock AND quantity <= max_stock 
           AND expiry_date > NOW() + INTERVAL 30 DAY THEN 1 ELSE 0 END) as healthy_items,
  SUM(CASE WHEN quantity <= min_stock THEN 1 ELSE 0 END) as low_stock_items,
  SUM(CASE WHEN quantity >= max_stock THEN 1 ELSE 0 END) as overstocked_items,
  SUM(CASE WHEN expiry_date BETWEEN NOW() AND NOW() + INTERVAL 30 DAY 
           THEN 1 ELSE 0 END) as expiring_soon_items,
  SUM(CASE WHEN expiry_date < NOW() THEN 1 ELSE 0 END) as expired_items
FROM inventory
WHERE organization_id = ? AND deleted_at IS NULL
```

#### Top Movers
```sql
WITH current_period AS (
  SELECT 
    sku_id,
    SUM(quantity) as quantity,
    SUM(quantity * price) as revenue
  FROM inventory_transactions
  WHERE organization_id = ? 
    AND transaction_type IN ('inbound', 'outbound')
    AND created_at >= CURRENT_DATE - INTERVAL '1 week'
  GROUP BY sku_id
),
previous_period AS (
  SELECT 
    sku_id,
    SUM(quantity) as quantity,
    SUM(quantity * price) as revenue
  FROM inventory_transactions
  WHERE organization_id = ? 
    AND transaction_type IN ('inbound', 'outbound')
    AND created_at >= CURRENT_DATE - INTERVAL '2 weeks'
    AND created_at < CURRENT_DATE - INTERVAL '1 week'
  GROUP BY sku_id
)
SELECT 
  s.id as sku_id,
  s.name as sku_name,
  s.code as sku_code,
  p.name as product_name,
  p.image_url as product_image,
  c.id as category_id,
  c.name as category_name,
  COALESCE(cp.quantity, 0) as current_quantity,
  COALESCE(pp.quantity, 0) as previous_quantity,
  COALESCE(cp.quantity, 0) - COALESCE(pp.quantity, 0) as quantity_change,
  CASE 
    WHEN pp.quantity > 0 
    THEN ((COALESCE(cp.quantity, 0) - COALESCE(pp.quantity, 0)) * 100.0 / pp.quantity)
    ELSE 0 
  END as quantity_change_percentage,
  COALESCE(cp.revenue, 0) as current_revenue,
  COALESCE(pp.revenue, 0) as previous_revenue,
  COALESCE(cp.revenue, 0) - COALESCE(pp.revenue, 0) as revenue_change,
  CASE 
    WHEN pp.revenue > 0 
    THEN ((COALESCE(cp.revenue, 0) - COALESCE(pp.revenue, 0)) * 100.0 / pp.revenue)
    ELSE 0 
  END as revenue_change_percentage
FROM skus s
LEFT JOIN products p ON s.product_id = p.id
LEFT JOIN categories c ON p.category_id = c.id
LEFT JOIN current_period cp ON s.id = cp.sku_id
LEFT JOIN previous_period pp ON s.id = pp.sku_id
WHERE s.organization_id = ? AND s.deleted_at IS NULL
ORDER BY quantity_change DESC
LIMIT 5
```

#### Low-Stock Alerts
```sql
SELECT 
  s.id as sku_id,
  s.name as sku_name,
  s.code as sku_code,
  p.name as product_name,
  p.image_url as product_image,
  c.id as category_id,
  c.name as category_name,
  store.id as store_id,
  store.name as store_name,
  i.quantity as current_quantity,
  s.min_stock as min_stock,
  s.max_stock as max_stock,
  s.min_stock - i.quantity as stock_deficit,
  CASE 
    WHEN i.quantity <= 0 THEN 'critical'
    ELSE 'warning'
  END as severity,
  it.created_at as last_restocked_date,
  DATEDIFF(NOW(), it.created_at) as days_since_restock,
  CASE 
    WHEN daily_consumption_rate > 0 
    THEN FLOOR(i.quantity / daily_consumption_rate)
    ELSE NULL
  END as estimated_days_until_stockout,
  s.max_stock - i.quantity as recommended_reorder_quantity,
  i.updated_at as updated_at
FROM inventory i
JOIN skus s ON i.sku_id = s.id
JOIN products p ON s.product_id = p.id
JOIN categories c ON p.category_id = c.id
JOIN stores store ON i.store_id = store.id
LEFT JOIN LATERAL (
  SELECT created_at
  FROM inventory_transactions
  WHERE sku_id = s.id 
    AND store_id = i.store_id
    AND transaction_type = 'inbound'
  ORDER BY created_at DESC
  LIMIT 1
) it ON TRUE
LEFT JOIN LATERAL (
  SELECT AVG(quantity) as daily_consumption_rate
  FROM inventory_transactions
  WHERE sku_id = s.id 
    AND store_id = i.store_id
    AND transaction_type = 'outbound'
    AND created_at >= NOW() - INTERVAL '30 days'
) dc ON TRUE
WHERE i.organization_id = ? 
  AND i.deleted_at IS NULL
  AND i.quantity <= s.min_stock
ORDER BY 
  CASE WHEN i.quantity <= 0 THEN 0 ELSE 1 END,
  (s.min_stock - i.quantity) DESC
LIMIT 10
```

## Frontend File Structure Once Implemented

```
src/
├── services/
│   ├── dashboard/
│   │   ├── getStockHealthService.ts          (NEW)
│   │   └── getTopMoversService.ts            (NEW)
│   └── alert/
│       └── getLowStockAlertsService.ts       (NEW)
├── hooks/
│   └── api/
│       ├── dashboard/
│       │   ├── useStockHealthQuery.ts        (NEW)
│       │   └── useTopMoversQuery.ts          (NEW)
│       └── alert/
│           └── useLowStockAlertsQuery.ts     (NEW)
├── types/
│   ├── stock-health.ts                       (NEW)
│   ├── top-movers.ts                         (NEW)
│   └── low-stock-alert.ts                    (NEW)
└── modules/
    └── dashboard/
        └── overview/
            └── components/
                ├── StockHealth.tsx            (NEW)
                ├── TopMovers.tsx              (NEW)
                └── LowStockWatchlist.tsx      (NEW)
```

## Testing Checklist

### Stock Health Donut
- [ ] API returns correct counts for all categories
- [ ] Health percentage is calculated correctly
- [ ] Chart displays data in correct proportions
- [ ] Empty state displays when no data
- [ ] Loading state shows during fetch
- [ ] Polling updates data every 5 minutes
- [ ] Filter by store works correctly
- [ ] Date range filter works correctly

### Top Movers
- [ ] API returns top movers for specified period
- [ ] Quantity and revenue changes calculated correctly
- [ ] Trend indicators (up/down/neutral) display correctly
- [ ] Period selector (day/week/month) works
- [ ] Sort functionality works (quantity/revenue/percentage)
- [ ] Empty state displays when no data
- [ ] Loading state shows during fetch
- [ ] Polling updates data every 5 minutes
- [ ] Filter by store works correctly
- [ ] Filter by category works correctly

### Low-Stock Watchlist
- [ ] API returns low stock items correctly
- [ ] Severity (critical/warning) assigned correctly
- [ ] Stock deficit calculated correctly
- [ ] Days since restock calculated correctly
- [ ] Estimated days until stockout calculated correctly
- [ ] Recommended reorder quantity calculated correctly
- [ ] Severity filter works (critical/warning/all)
- [ ] "Restock Now" button opens inbound dialog
- [ ] Empty state displays when no data
- [ ] Loading state shows during fetch
- [ ] Polling updates data every 2 minutes
- [ ] Filter by store works correctly
- [ ] Filter by category works correctly

## Deployment Considerations

1. **API Versioning**: All endpoints follow v1 API pattern
2. **Rate Limiting**: Consider rate limiting for polling endpoints
3. **Caching**: Implement server-side caching for analytics endpoints (5min TTL recommended)
4. **Performance**: Optimize database queries with proper indexing on:
   - `inventory.sku_id`, `inventory.store_id`
   - `inventory_transactions.sku_id`, `inventory_transactions.created_at`
   - `skus.min_stock`, `skus.max_stock`
5. **Monitoring**: Add metrics for API response times and error rates
6. **Error Handling**: Return 404 when organization not found, 400 for invalid parameters

## Related Documentation
- [API_REQUIREMENTS.md](./API_REQUIREMENTS.md) - Complete API specifications
- [DASHBOARD_IMPLEMENTATION_STATUS.md](./DASHBOARD_IMPLEMENTATION_STATUS.md) - Current implementation status
- [PHASE1_IMPLEMENTATION_SUMMARY.md](./PHASE1_IMPLEMENTATION_SUMMARY.md) - Phase 1 completion summary

## Contact
For questions or clarifications about these API specifications, contact the backend team.

**Last Updated**: 2025-01-16  
**Status**: Awaiting Backend Implementation  
**Estimated Completion**: 3-4 business days
