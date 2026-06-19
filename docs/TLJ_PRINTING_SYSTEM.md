# TLJ Printing System Documentation

## Overview

This document describes the updated printing system that now supports TLJ (ThermalLabel JSON) template files and uses JSPrintManager for direct printer communication.

## Architecture Flow

1. **Template Upload**: User uploads a `.tlj` file containing label template definition
2. **Template Parsing**: Extract `TextItem` and `RFIDTagItem` elements from TLJ structure
3. **Field Mapping**: Map template fields to ledger item properties
4. **Data Processing**: For each item to print:
   - Replace TextItem values with ledger data
   - Generate EPC codes for RFIDTagItem elements
5. **ZPL Generation**: Send processed template to ThermalLabel API to generate ZPL commands
6. **Printing**: Use JSPrintManager to send ZPL commands directly to printer
7. **Database Update**: Update ledger items with generated EPC codes

## Key Components

### usePrintV3.ts Hook

#### New Functions:

- `initializeJSPM()` - Initialize JSPrintManager connection
- `checkJSPMStatus()` - Verify JSPrintManager status
- `printWithJSPM(zplCommands)` - Send ZPL commands to printer
- `generateEPC(item)` - Generate EPC format codes for RFID items
- `handleTemplateSelect()` - Parse TLJ files and extract template fields

#### Updated Interfaces:

- `TLJTemplate` - Structure for ThermalLabel JSON template
- `TLJItem` - Individual template elements (TextItem/RFIDTagItem)
- `PrinterSettings` - Added JSPrintManager status tracking

### PrintModalV3.tsx Component

#### Changes:

- File input now accepts `.tlj` format only
- Dynamic field mapping UI based on extracted template items
- Real-time status display for JSPrintManager connection
- Updated print process with EPC generation feedback

## Template Field Mapping

The system automatically extracts `TextItem` and `RFIDTagItem` elements from the TLJ template:

- **Element ID**: Name of the template element (e.g., "ProductName", "EPC-01")
- **Property Mapping**: Ledger item property to map (e.g., "sku.name", "id")

Available properties for mapping:

- `id` - Item ID
- `epc` - Item EPC code
- `status.name` - Status name
- `sku.id` - SKU ID
- `sku.name` - SKU name
- `sku.brand.name` - Brand name
- `sku.color.name` - Color name
- `sku.size.name` - Size name
- `sku.categories[0].name` - Category name
- `updated_at` - Last updated timestamp

## EPC Generation

For `RFIDTagItem` elements, the system generates EPC codes using this format:

```
3 + timestamp(8 chars) + itemId(8 chars) + skuId(4 chars)
```

Padded to 24 characters total.

## ThermalLabel API Integration

**Endpoint**: `https://thermallabelwebapi.azurewebsites.net/ThermalLabel/Convert`

**Request Format**:

```json
{
  "thermalLabel": "<TLJ_JSON_STRING>",
  "dataSource": "",
  "dpi": 96,
  "pageOrientation": "Portrait",
  "copies": 1,
  "replicates": 0,
  "pdfMetadata": {
    "author": "string",
    "creator": "string",
    "producer": "string",
    "subject": "string",
    "title": "string",
    "useVectorDrawing": true
  }
}
```

**Headers**:

- `Content-Type: application/json`
- `Accept: application/vnd.zpl`

**Response**: Raw ZPL commands for printing

## JSPrintManager Setup

### Prerequisites

1. Download and install JSPrintManager from: https://neodynamic.com/downloads/jspm
2. Ensure JSPrintManager service is running on client machines

### Browser Integration

The system includes JSPrintManager scripts in `_document.tsx`:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jsprintmanager/7.0.2/JSPrintManager.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/bluebird/3.3.5/bluebird.min.js"></script>
```

### Connection Status

The system monitors JSPrintManager connection status:

- **Connected**: Ready for printing
- **Disconnected**: Service not running or not installed
- **Blocked**: Website blocked by JSPrintManager settings

## Error Handling

1. **Template Parsing Errors**: Invalid TLJ format
2. **API Errors**: ThermalLabel API unavailable or invalid template
3. **Print Errors**: JSPrintManager connection issues
4. **Database Errors**: Failed to update ledger items

All errors are logged to the terminal interface with timestamps and detailed messages.

## Usage Instructions

1. Open the print modal from ledger items
2. Upload a `.tlj` template file
3. Map template fields to ledger properties
4. Ensure JSPrintManager status shows "Connected"
5. Click "Print" to process items
6. Monitor progress in the terminal log
7. Successfully printed items are removed from the print queue

## Dependencies

- `jsprintmanager` npm package (v7.0.2)
- JSPrintManager desktop application
- ThermalLabel Web API access

## Troubleshooting

### JSPrintManager Issues

- Ensure JSPrintManager is installed and running
- Check firewall settings for localhost:22443
- Verify website is not blocked in JSPrintManager settings

### Template Issues

- Verify TLJ file format is valid JSON
- Ensure template contains TextItem or RFIDTagItem elements
- Check element names match mapping configuration

### Printing Issues

- Verify printer is connected and ready
- Check ZPL commands are valid for target printer
- Ensure printer supports ZPL command set
