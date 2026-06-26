# Fixed Assets — API Requirements Document

> Base URL: `{NEXT_PUBLIC_ENDPOINT_URL}/v1/organizations/{organizationId}/fa/`
>
> Auth: `Authorization: Bearer {token}` (JWT — auto-refreshed by frontend)
>
| Header | Description |
|--------|-------------|
| `Authorization` | `Bearer {access_token}` |
| `Content-Type` | `application/json; charset=utf-8` |
| `Refresh-Token` | `{refresh_token}` |

All responses follow the standard `ApiResponse<T>` envelope:

```json
{
  "message": "string",
  "data": { ... },
  "metadata": {
    "code": "200",
    "correlation_id": "uuid",
    "message": "OK",
    "server_time": 1700000000,
    "success": true
  },
  "pagination": {
    "count": 20,
    "next_cursor": "string | null",
    "prev_cursor": "string | null",
    "total_count": 12420
  }
}
```

---

## Table of Contents

1. [Dashboard](#1-dashboard)
2. [Asset Register](#2-asset-register)
3. [Master Data](#3-master-data)
4. [RFID Tags](#4-rfid-tags)
5. [Daily Operations](#5-daily-operations)
   - Scan-In (Receiving)
   - Scan-Out (Disposal)
   - Check-Out (Loans)
   - Transfer
6. [Audit & Maintenance](#6-audit--maintenance)
   - Stock Audit
   - Maintenance (CMMS)
   - Predictive Analytics (NEW)
7. [Approval Workflows (NEW)](#7-approval-workflows)
8. [Asset Lifecycle (NEW)](#8-asset-lifecycle)
9. [Financial Integration (NEW)](#9-financial-integration)
10. [Live Tracking](#10-live-tracking)
    - RTLS
    - Security / Loss Prevention
11. [Reports](#11-reports)
12. [Users & Roles](#12-users--roles)
13. [Settings](#13-settings)

---

## 1. Dashboard

### GET `/dashboard`

Returns KPI data, activity feed, category stats, RFID reads, site rollup, financial summary, and maintenance schedule.

**Response:**
```json
{
  "data": {
    "activity": [
      {
        "go": "detail",
        "icon": "arrout",
        "ic": "i",
        "id": "IT-LP-9847",
        "t": "2m ago",
        "txt": "MacBook checked out by Dewi A."
      }
    ],
    "categoryStats": [
      { "cat": "it", "n": "IT Equipment", "pct": 38, "v": 4820 }
    ],
    "financialCategories": [
      { "cost": 3840000000, "n": "IT Equipment", "nbv": 1630000000, "pct": 42 }
    ],
    "maintenanceUpcoming": [
      { "d": "Tomorrow", "dt": "18 Jan", "icon": "cog", "t": "PM IT Servers", "tone": "danger" }
    ],
    "rfidReads": [
      { "a": "IT-LP-9847", "dir": "in", "g": "Gate-8N", "rssi": -48, "t": "2s", "who": "Dewi A." }
    ],
    "sites": [
      {
        "assets": "4,820",
        "city": "Jakarta",
        "n": "JKT-HQ",
        "pct": 84,
        "status": "on",
        "val": 6800000000
      }
    ]
  }
}
```

---

## 2. Asset Register

### GET `/assets`

List assets with cursor-based pagination, search, and filters.

| Param | Type | Description |
|-------|------|-------------|
| `cursor` | string | Pagination cursor |
| `limit` | number | Page size (default 20) |
| `q` | string | Search (name, ID, EPC, S/N, custodian, location) |
| `cat` | string | Category filter: `it`, `tool`, `furn`, `veh`, `lab`, `med`, `mach` |
| `status` | string | Status filter: `deployed`, `checked-out`, `maint`, `idle`, `retired` |

**Response:**
```json
{
  "data": {
    "assets": [
      {
        "age": 14,
        "cat": "it",
        "custodian": "Dewi A.",
        "dep": 48000000,
        "epc": "E280-1170-0000-50CA-9847",
        "id": "IT-LP-9847",
        "loc": "JKT-HQ · Floor 8",
        "name": "MacBook Pro 16\" M3 Max",
        "purchased": "12 Jan 2025",
        "serial": "C02XK9847GP6",
        "spark": [8, 12, 15, 10, 18],
        "status": "deployed",
        "supplier": "PT. Apple Indonesia",
        "val": 50400000,
        "warranty": "AppleCare to Jan 2028"
      }
    ]
  }
}
```

### GET `/assets/{assetId}`

Single asset detail including lifecycle events, health data, and documents.

### POST `/assets`

Create a single asset.

```json
{
  "cat": "it",
  "custodian": "Dewi A.",
  "epc": "E280-1170-0000-50CA-9847",
  "loc": "JKT-HQ · Floor 8",
  "name": "MacBook Pro 16\" M3 Max",
  "purchased": "2025-01-12",
  "serial": "C02XK9847GP6",
  "supplier": "PT. Apple Indonesia",
  "val": 50400000,
  "warranty": "AppleCare to Jan 2028"
}
```

### POST `/assets/bulk`

Bulk create assets (CSV/JSON array).

### PUT `/assets/{assetId}`

Update asset fields.

### POST `/assets/export`

Export filtered assets to CSV/Excel.

```json
{
  "format": "csv",
  "source": "register"
}
```

**Response:** `{ "download_url": "https://..." }`

---

## 3. Master Data

### GET `/master-data`

Returns categories, locations, cost centers, suppliers, depreciation methods, and custom fields.

**Response:**
```json
{
  "data": {
    "categories": [
      { "id": "it", "label": "IT Equipment", "icon": "laptop" }
    ],
    "costCenters": [
      { "code": "CC-800", "label": "IT Dept" }
    ],
    "depreciationMethods": ["straight-line", "declining-balance", "units-of-production"],
    "locations": [
      { "id": "JKT-HQ-F8", "label": "JKT-HQ · Floor 8" }
    ],
    "suppliers": [
      { "id": "SUP-001", "label": "PT. Apple Indonesia" }
    ]
  }
}
```

### POST `/master-data` — Create master data entry
### PUT `/master-data/{id}` — Update master data entry
### DELETE `/master-data/{id}` — Delete master data entry
### POST `/master-data/import` — Bulk import

---

## 4. RFID Tags

### GET `/rfid-tags`

List registered RFID tags.

| Param | Type | Description |
|-------|------|-------------|
| `cursor` | string | Pagination cursor |
| `limit` | number | Page size |
| `status` | string | `assigned`, `unassigned`, `deactivated`, `damaged` |
| `cat` | string | Category filter |

### POST `/rfid-tags/encode`

Encode an EPC value onto a physical tag.

```json
{
  "assetId": "IT-LP-9847",
  "epc": "E280-1170-0000-50CA-9847"
}
```

### POST `/rfid-tags/print`

Queue tags for printing via QZ Tray.

```json
{
  "assetIds": ["IT-LP-9847", "IT-LP-9846"],
  "template": "standard"
}
```

### GET `/epc-ranges`

List registered EPC ranges (whitelisted patterns).

### POST `/epc-ranges`

Register a new EPC range.

```json
{
  "category": "IT Equipment",
  "encoding": "GS1 SGTIN-96",
  "gs1Prefix": "8990012",
  "maxAllocation": 65536
}
```

### POST `/rfid-tags/order`

Create a purchase order for tag stock.

```json
{
  "quantity": 1000,
  "tagType": "Confidex Survivor (anti-metal)"
}
```

---

## 5. Daily Operations

### 5.1 Scan-In (Receiving)

#### GET `/scan-in/history`

List received assets with scan timestamps.

#### POST `/scan-in/deploy`

Register and tag incoming assets in bulk.

```json
{
  "assets": [
    {
      "cat": "it",
      "epc": "E280-1170-0000-50CA-9847",
      "name": "MacBook Pro 16\"",
      "serial": "C02XK9847GP6",
      "supplier": "PT. Apple Indonesia",
      "val": 50400000
    }
  ]
}
```

---

### 5.2 Scan-Out (Disposal)

#### GET `/disposals`

List disposal requests with approval status.

#### POST `/disposals`

Create a new disposal request.

```json
{
  "assetId": "IT-LP-9847",
  "method": "Sold · auction",
  "reason": "5-year EOL reached",
  "recovery": 5000000
}
```

#### POST `/disposals/{disposalId}/approve`
#### POST `/disposals/{disposalId}/reject`
#### POST `/disposals/{disposalId}/revise`
#### POST `/disposals/{disposalId}/journal-entry` — Post GL journal entry on final approval
#### POST `/disposals/{disposalId}/bast` — Generate Berita Acara Serah Terima PDF

---

### 5.3 Check-Out (Loans)

#### GET `/check-outs`

List active loans with due dates and overdue flags.

#### POST `/check-outs`

```json
{
  "assetId": "TL-DR-0142",
  "borrower": "Andi Pratama",
  "dueDays": 7,
  "purpose": "Client site survey"
}
```

#### POST `/check-outs/{checkOutId}/return`

Return a checked-out asset.

#### GET `/reservations`
#### POST `/reservations`

```json
{
  "assetId": "VH-FK-0041",
  "duration": "Full day",
  "reservedBy": "Andi Pratama",
  "start": "2025-01-20T08:00:00Z"
}
```

#### POST `/check-outs/{assetId}/pre-use-check`

Submit pre-use safety inspection.

```json
{
  "assetId": "TL-DR-0142",
  "failItem": null,
  "passed": true
}
```

---

### 5.4 Transfer

#### GET `/transfers`

List active transfers with stage tracking.

#### POST `/transfers`

```json
{
  "assetId": "IT-LP-9847",
  "custodian": "Citra W.",
  "reason": "Team relocation",
  "toLocation": "BDG-Office · Floor 2"
}
```

#### POST `/transfers/{transferId}/confirm-receipt`

Confirm receipt at destination (gate scan triggered).

#### GET `/transfers/history`

Completed transfer history.

---

## 6. Audit & Maintenance

### 6.1 Stock Audit

#### GET `/audit/zones`

List audit zones with match counts.

#### POST `/audit/adjustment`

Post an audit variance adjustment.

```json
{
  "assetId": "IT-LP-9847",
  "adjustmentType": "found",
  "notes": "Found in Zone B3 during audit",
  "zoneId": "ZONE-B3"
}
```

#### POST `/audit/{sweepId}/resume`

Resume a paused audit sweep.

#### POST `/audit/{sweepId}/sign-off`

Sign off on completed audit.

---

### 6.2 Maintenance (CMMS)

#### GET `/maintenance`

| Param | Type | Description |
|-------|------|-------------|
| `tab` | string | `flow`, `health`, `wo`, `schedule` |

Returns work orders, health data, PM rules, PM schedule, and pre-use assets.

#### POST `/maintenance/work-orders`

```json
{
  "assetId": "MC-CN-0011",
  "assignedTo": "Andi Pratama",
  "issue": "Spindle vibration detected",
  "priority": "high",
  "source": "Corrective · breakdown / damage report"
}
```

#### PATCH `/maintenance/work-orders/{woId}/status`

```json
{ "status": "in-progress" }
```

#### GET `/maintenance/pm-rules`
#### POST `/maintenance/pm-rules`
#### PUT `/maintenance/pm-rules/{ruleId}`

PM rule body:
```json
{
  "autoWO": true,
  "interval": "180 days",
  "name": "Generator monthly load test",
  "remind": "14d · 7d · 1d",
  "trigger": "Time interval"
}
```

---

### 6.3 Predictive Analytics (NEW)

#### GET `/predictive/models`

List AI prediction models with accuracy metrics.

**Response:**
```json
{
  "data": {
    "models": [
      {
        "accuracy": 87.5,
        "active": true,
        "assetCount": 142,
        "assetScope": "Machinery · CNC",
        "avgConfidence": 82,
        "createdAt": "2024-10-01",
        "features": ["vibration", "temperature", "run_hours", "age_days"],
        "falsePositives": 3,
        "id": "MODEL-CNC-001",
        "lastTrained": "2025-01-15",
        "modelType": "Random Forest",
        "name": "CNC Spindle Failure Predictor",
        "pendingRetrain": false,
        "precision": 0.91,
        "predictions": 420,
        "recall": 0.88,
        "status": "active",
        "truePositives": 18,
        "version": "2.1.0"
      }
    ],
    "summary": {
      "avgAccuracy": 87.5,
      "avgConfidence": 82,
      "criticalPredictions": 3,
      "healthy": 120,
      "modelsActive": 4,
      "totalAssetsMonitored": 480,
      "totalPredictions": 420,
      "watchItems": 8,
      "warningItems": 5
    }
  }
}
```

#### GET `/predictive/results`

| Param | Type | Description |
|-------|------|-------------|
| `severity` | string | `critical`, `warning`, `watch`, `healthy` |

**Response:**
```json
{
  "data": {
    "predictions": [
      {
        "accuracy": 87.5,
        "assetCat": "mach",
        "assetId": "MC-CN-0011",
        "assetName": "Mazak QTN-200 CNC Lathe",
        "confidence": 89,
        "currentHealth": 34,
        "daysToFailure": 12,
        "estimatedCost": 48000000,
        "failedPart": "Spindle bearing",
        "failureMode": "Bearing wear",
        "lastUpdated": "2025-01-18T10:00:00Z",
        "loc": "Mfg-1 · Cell A",
        "modelName": "CNC Spindle Failure Predictor",
        "recommendedAction": "Replace spindle bearing this week",
        "recommendedActionDate": "2025-01-25",
        "rul": 12,
        "runHours": 18400,
        "severity": "critical",
        "trendData": [78, 72, 65, 58, 48, 42, 34]
      }
    ]
  }
}
```

#### POST `/predictive/models/{modelId}/retrain`

Trigger model retraining.

**Response:**
```json
{
  "data": {
    "estimatedMinutes": 15,
    "modelId": "MODEL-CNC-001",
    "status": "training"
  }
}
```

---

## 7. Approval Workflows (NEW)

### GET `/approvals`

List approval requests with stats.

| Param | Type | Description |
|-------|------|-------------|
| `cursor` | string | Pagination cursor |
| `limit` | number | Page size |
| `status` | string | `pending`, `in-review`, `approved`, `rejected`, `withdrawn`, `escalated` |
| `type` | string | `disposal`, `transfer`, `maintenance`, `acquisition`, `write-off`, `revaluation` |

**Response:**
```json
{
  "data": {
    "requests": [
      {
        "amount": 50400000,
        "assetId": "IT-LP-9847",
        "assetName": "MacBook Pro 16\" M3 Max",
        "createdAt": "2025-01-18T08:00:00Z",
        "currentStep": 2,
        "description": "Disposal request — 5-year EOL",
        "id": "APR-2410-0042",
        "priority": "high",
        "requesterName": "Andi Pratama",
        "status": "in-review",
        "steps": [
          {
            "approverName": "Andi P.",
            "approverRole": "Requester",
            "comment": "Submitted for review",
            "decidedAt": "2025-01-18T08:00:00Z",
            "name": "Request submitted",
            "order": 1,
            "role": "requester",
            "status": "approved"
          },
          {
            "approverName": "Dewi A.",
            "approverRole": "Dept Head",
            "comment": null,
            "decidedAt": null,
            "name": "Dept Head review",
            "order": 2,
            "role": "dept_head",
            "status": "pending"
          },
          {
            "approverName": null,
            "approverRole": "Finance Manager",
            "decidedAt": null,
            "name": "Finance review",
            "order": 3,
            "role": "finance_manager",
            "status": "pending"
          },
          {
            "approverName": null,
            "approverRole": "CFO",
            "decidedAt": null,
            "name": "CFO approval",
            "order": 4,
            "role": "cfo",
            "status": "pending"
          }
        ],
        "totalSteps": 4,
        "type": "disposal",
        "updatedAt": "2025-01-18T10:00:00Z"
      }
    ],
    "stats": {
      "SLACompliance": 94,
      "avgApprovalHours": 18,
      "escalated": 2,
      "pending": 12,
      "pendingCritical": 3,
      "rejectedThisMonth": 4
    }
  }
}
```

### POST `/approvals/{requestId}/approve`

```json
{
  "comment": "Approved — within budget threshold"
}
```

**Response:**
```json
{
  "data": {
    "nextStep": "Finance review",
    "request": { ... },
    "workflowComplete": false
  }
}
```

### POST `/approvals/{requestId}/reject`

```json
{
  "comment": "Reason exceeds disposal threshold"
}
```

### GET `/approvals/rules`

List configured approval workflow rules.

**Response:**
```json
{
  "data": {
    "rules": [
      {
        "appliesTo": "disposal",
        "conditions": "amount > 50000000",
        "escalationAfterHours": 48,
        "id": "RULE-001",
        "isActive": true,
        "minAmount": 50000000,
        "name": "High-value disposal approval",
        "steps": [
          { "approverRole": "dept_head", "name": "Dept Head", "order": 1 },
          { "approverRole": "finance_manager", "name": "Finance Manager", "order": 2 },
          { "approverRole": "cfo", "name": "CFO", "order": 3 }
        ],
        "thresholdDays": 7
      }
    ]
  }
}
```

### POST `/approvals/rules`

Create a new approval rule.

```json
{
  "appliesTo": "transfer",
  "escalationAfterHours": 48,
  "isActive": true,
  "minAmount": 100000000,
  "name": "High-value transfer approval",
  "steps": [
    { "approverRole": "dept_head", "name": "Dept Head", "order": 1 },
    { "approverRole": "cfo", "name": "CFO", "order": 2 }
  ],
  "thresholdDays": 7
}
```

### PUT `/approvals/rules/{ruleId}`

Update an approval rule.

### POST `/approvals/{requestId}/withdraw`

Withdraw a submitted request (requester only).

### POST `/approvals/{requestId}/escalate`

Escalate a stalled request to the next approver.

---

## 8. Asset Lifecycle (NEW)

### GET `/lifecycle`

List assets with lifecycle tracking.

| Param | Type | Description |
|-------|------|-------------|
| `cursor` | string | Pagination cursor |
| `limit` | number | Page size |
| `stage` | string | `planning`, `procurement`, `received`, `tagged`, `deployed`, `in-use`, `maintenance`, `checked-out`, `transfer`, `audit`, `disposal`, `retired` |

**Response:**
```json
{
  "data": {
    "assets": [
      {
        "acquisitionDate": "2025-01-12",
        "acquisitionValue": 50400000,
        "ageDays": 14,
        "cat": "it",
        "currentStage": "deployed",
        "currentValue": 50400000,
        "custodian": "Dewi A.",
        "depreciationRate": 33.33,
        "epc": "E280-1170-0000-50CA-9847",
        "events": [
          {
            "actor": "System",
            "detail": "Asset registered from procurement PO-2025-014",
            "eventId": "EVT-001",
            "fromStage": null,
            "notes": "Initial registration",
            "stage": "procurement",
            "timestamp": "2025-01-10T09:00:00Z",
            "type": "registration"
          },
          {
            "actor": "IT Ops",
            "detail": "Asset received and inspected",
            "eventId": "EVT-002",
            "fromStage": "procurement",
            "stage": "received",
            "timestamp": "2025-01-12T14:00:00Z",
            "type": "received"
          },
          {
            "actor": "IT Ops",
            "detail": "EPC E280-1170-0000-50CA-9847 encoded",
            "eventId": "EVT-003",
            "fromStage": "received",
            "metadata": { "epc": "E280-1170-0000-50CA-9847" },
            "stage": "tagged",
            "timestamp": "2025-01-12T15:00:00Z",
            "type": "tagged"
          },
          {
            "actor": "IT Ops",
            "detail": "Deployed to JKT-HQ Floor 8 · assigned to Dewi A.",
            "eventId": "EVT-004",
            "fromStage": "tagged",
            "stage": "deployed",
            "timestamp": "2025-01-12T16:00:00Z",
            "type": "deployment"
          }
        ],
        "id": "IT-LP-9847",
        "lifecycleProgress": 60,
        "loc": "JKT-HQ · Floor 8",
        "name": "MacBook Pro 16\" M3 Max",
        "netBookValue": 48000000,
        "serial": "C02XK9847GP6",
        "status": "deployed",
        "totalEvents": 4,
        "warrantyExpiry": "2028-01-12"
      }
    ],
    "summary": {
      "acquiring": 8,
      "disposed": 42,
      "inUse": 11280,
      "retired": 180,
      "totalAssets": 12420
    }
  }
}
```

### GET `/lifecycle/{assetId}`

Full lifecycle detail for a single asset including all events.

### POST `/lifecycle/{assetId}/event`

Record a manual lifecycle event (stage transition).

```json
{
  "detail": "Asset transferred to BDG-Office per request",
  "fromStage": "deployed",
  "notes": "Team relocation",
  "stage": "transfer",
  "type": "transfer"
}
```

### GET `/lifecycle/{assetId}/timeline`

Timeline view of all lifecycle events (alias for events array, supports pagination).

---

## 9. Financial Integration (NEW)

### 9.1 Depreciation

#### GET `/finance/depreciation`

| Param | Type | Description |
|-------|------|-------------|
| `asset_id` | string | Filter to single asset |

**Response:**
```json
{
  "data": {
    "schedules": [
      {
        "accumulatedDepreciation": 2400000,
        "ageMonths": 0,
        "ageYears": 0,
        "assetId": "IT-LP-9847",
        "assetName": "MacBook Pro 16\" M3 Max",
        "cat": "it",
        "currentValue": 50400000,
        "depreciableBase": 50400000,
        "depreciationMethod": "straight-line",
        "depreciationRate": 33.33,
        "estimatedLife": 3,
        "fullyDepreciatedDate": "2028-01-12",
        "monthlyDepreciation": 1400000,
        "netBookValue": 48000000,
        "remainingLife": 35,
        "residualValue": 0,
        "salvageValue": 0,
        "schedule": [
          { "depreciation": 16800000, "month": "Jan", "nbv": 33600000, "year": 2025 },
          { "depreciation": 16800000, "month": "Jan", "nbv": 16800000, "year": 2026 },
          { "depreciation": 16800000, "month": "Jan", "nbv": 0, "year": 2027 }
        ],
        "status": "active",
        "usefulLife": 36
      }
    ]
  }
}
```

#### POST `/finance/depreciation/run`

Run monthly depreciation posting (creates journal entries).

```json
{
  "month": "2025-01",
  "dryRun": false
}
```

---

### 9.2 Journal Entries

#### GET `/finance/journal-entries`

| Param | Type | Description |
|-------|------|-------------|
| `cursor` | string | Pagination cursor |
| `limit` | number | Page size |
| `status` | string | `draft`, `posted`, `reversed`, `pending` |
| `type` | string | `acquisition`, `depreciation`, `disposal`, `revaluation`, `transfer`, `maintenance`, `write-off` |

**Response:**
```json
{
  "data": {
    "entries": [
      {
        "accountCode": "1501.01",
        "accountName": "Fixed Assets — IT Equipment",
        "amount": 50400000,
        "assetId": "IT-LP-9847",
        "assetName": "MacBook Pro 16\" M3 Max",
        "createdAt": "2025-01-12T16:00:00Z",
        "createdBy": "IT Ops",
        "credit": 0,
        "debit": 50400000,
        "description": "Acquisition of MacBook Pro",
        "id": "JE-2025-00142",
        "postedAt": "2025-01-12T16:05:00Z",
        "reference": "PO-2025-014",
        "source": "scan-in",
        "status": "posted",
        "type": "acquisition"
      }
    ],
    "summary": {
      "SLACompliance": 100,
      "accumulatedDepreciation": 6580000000,
      "bastsGenerated": 42,
      "glIntegrationStatus": "connected",
      "journalEntriesPending": 8,
      "journalEntriesPosted": 1240,
      "netBookValue": 8240000000,
      "pendingPostings": 3,
      "postSuccessRate": 99.2,
      "totalAcquisitionValue": 14820000000,
      "totalAssets": 12420
    }
  }
}
```

#### POST `/finance/journal-entries`

Create a manual journal entry.

#### POST `/finance/journal-entries/{entryId}/post`

Post a draft entry to the GL.

#### POST `/finance/journal-entries/{entryId}/reverse`

Reverse a posted entry.

---

### 9.3 BAST Documents

#### GET `/finance/bast`

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `draft`, `pending-signature`, `signed`, `voided` |

**Response:**
```json
{
  "data": {
    "documents": [
      {
        "assetId": "IT-LP-9847",
        "assetName": "MacBook Pro 16\" M3 Max",
        "createdAt": "2025-01-18T10:00:00Z",
        "disposalId": "DSP-2410-0042",
        "documentId": "BAST-2025-0088",
        "downloadUrl": "https://...",
        "handoverDate": "2025-01-20",
        "recipientName": "PT. E-Waste Recycler",
        "recipientRole": "Disposal vendor",
        "signedAt": null,
        "signerName": null,
        "status": "pending-signature",
        "type": "disposal"
      }
    ]
  }
}
```

#### POST `/finance/bast/{documentId}/sign`

Sign a BAST document (e-signature).

#### POST `/finance/bast/generate`

Generate a new BAST from a disposal or transfer record.

```json
{
  "recipientName": "PT. E-Waste Recycler",
  "recipientRole": "Disposal vendor",
  "referenceId": "DSP-2410-0042",
  "referenceType": "disposal"
}
```

---

### 9.4 Insurance

#### GET `/finance/insurance`

**Response:**
```json
{
  "data": {
    "policies": [
      {
        "assetCount": 4820,
        "coverageAmount": 10000000000,
        "expiryDate": "2025-12-31",
        "id": "INS-001",
        "insurer": "Allianz Indonesia",
        "policyNumber": "ALLZ-FA-2025-001",
        "premium": 24000000,
        "status": "active",
        "type": "All-risk Fixed Asset"
      }
    ]
  }
}
```

#### POST `/finance/insurance`

Add a new insurance policy.

#### PUT `/finance/insurance/{policyId}`

Update policy details.

---

## 10. Live Tracking

### 10.1 RTLS (Real-Time Location)

#### GET `/rtls/floor-plan`

Returns floor plan SVG/image data with zone boundaries.

#### GET `/rtls/positions`

| Param | Type | Description |
|-------|------|-------------|
| `zone` | string | Filter by zone |
| `cat` | string | Filter by category |

**Response:** Real-time positions with last-seen timestamps and confidence.

---

### 10.2 Security / Loss Prevention

#### GET `/security/alerts`

**Response:**
```json
{
  "data": {
    "alerts": [
      {
        "action": "resolve",
        "asset": "Toyota Hilux Forklift",
        "assetId": "VH-FK-0041",
        "camera": "CAM-EXIT-01",
        "desc": "Left geofence without authorization",
        "id": "ALR-2410-0042",
        "severity": "critical",
        "timestamp": "2025-01-18T14:00:00Z"
      }
    ]
  }
}
```

#### POST `/security/alerts/{alertId}/resolve`
#### POST `/security/alerts/{alertId}/halt`
#### POST `/security/geofence-rules`

Create a geofence rule.

#### GET `/security/cameras`

List CCTV cameras with stream URLs.

---

## 11. Reports

### GET `/reports/templates`

List available report templates.

### GET `/reports/preview?reportId={id}`

Preview a report (HTML/JSON).

### POST `/reports/generate`

Generate a report (async → returns download URL).

```json
{
  "format": "pdf",
  "reportId": "RPT-001",
  "params": { "month": "2025-01" }
}
```

### POST `/reports/generate-all`

Generate all standard reports.

### GET `/reports/history`

List previously generated reports with download links.

---

## 12. Users & Roles

### GET `/users`

List FA module users.

### POST `/users/invite`

Invite a new user.

```json
{
  "email": "user@company.com",
  "roleId": "ROLE-002"
}
```

### GET `/roles`

List roles with permissions.

### PUT `/roles/{roleId}`

Update role permissions.

### GET `/users/audit-log`

User action audit log for compliance.

---

## 13. Settings

### GET `/settings`

Returns organization-level FA settings.

### PUT `/settings`

Update settings.

### GET `/settings/notification-triggers`

### PUT `/settings/notification-triggers`

### POST `/settings/connect-integration`

Connect external system (ERP, accounting, etc.).

```json
{
  "apiKey": "...",
  "type": "sap"
}
```

### GET `/billing`

Subscription and billing info.

### GET `/invoices`

List invoices.

---

## Error Codes

| HTTP Status | Code | Description |
|------------|------|-------------|
| 400 | `BAD_REQUEST` | Invalid input |
| 401 | `UNAUTHORIZED` | Token expired or invalid |
| 403 | `FORBIDDEN` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Duplicate or state conflict |
| 422 | `VALIDATION_ERROR` | Field validation failed |
| 429 | `RATE_LIMITED` | Too many requests |
| 500 | `INTERNAL_ERROR` | Server error |

Error response:
```json
{
  "message": "Validation failed",
  "metadata": {
    "code": "422",
    "correlation_id": "uuid",
    "errors": [
      { "field": "assetId", "message": "Asset ID is required" }
    ],
    "success": false
  }
}
```
