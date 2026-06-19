# COMMENTED CODE IN OVERVIEW MODULE

## Files with Commented Code

### 1. Overview.tsx (src/modules/dashboard/overview/Overview.tsx)

#### Line 299-303: Bottom Row - Recent Transactions + Alerts + Category Distribution
```typescript
{/* <div className="ks-grid-3" style={{ marginBottom: 16 }}>
  <RecentTransactions />
  <Alerts />
  <CategoryDistribution />
</div> */}
```
**Status**: Commented out
**Reason**: Unknown - components already exist and are ready to use
**Action Required**: Uncomment to display these components

---

#### Line 306-310: New Phase 3 Components - Stock Health + Top Movers + Low Stock Watchlist
```typescript
{/* <div className="ks-grid-3" style={{ marginBottom: 16 }}>
  <StockHealth />
  <TopMovers />
  <LowStockWatchlist />
</div> */}
```
**Status**: Commented out
**Reason**: Unknown - Phase 3 components already implemented
**Action Required**: Uncomment to display stock critical threshold (LowStockWatchlist)

---

#### Line 105-107: Stock Health Calculation (Commented Variables)
```typescript
// const inStock = Math.max(0, totalItems);
// const lowStock = Math.floor(totalSku * 0.05);
// const critical = Math.floor(totalSku * 0.02);
```
**Status**: Commented out
**Reason**: Unknown - appears to be old stock health calculation logic
**Action Required**: Remove if unused, or implement if needed

---

## TODO Comments Found

### LowStockWatchlist.tsx (src/modules/dashboard/overview/components/LowStockWatchlist.tsx)

#### Line 85: Restock Action
```typescript
const handleRestock = (_skuId: string, _skuName: string) => {
  void _skuId;
  void _skuName;
  // TODO: implement restock action
};
```
**Status**: TODO - Not implemented
**Action Required**: Implement restock action for low stock items

---

## Summary

**Total Commented Code Blocks**: 3
- 2 multi-line JSX blocks (Overview.tsx line 299-303, 306-310)
- 1 single-line variable declarations (Overview.tsx line 105-107)

**Total TODO Comments**: 1 (in LowStockWatchlist.tsx)

**Priority Actions**:
1. Uncomment line 306-310 to show LowStockWatchlist (threshold stock critical)
2. Uncomment line 299-303 to show Alerts, Category Distribution, and Recent Transactions
3. Remove or implement commented stock health calculation (line 105-107)
4. Implement restock action in LowStockWatchlist (line 85)