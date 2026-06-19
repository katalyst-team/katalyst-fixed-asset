import { StockMovementEpcItemType, StockMovementProductItemType } from "@/types/stockMovementDetail";
import { exportToExcel } from "@/utils/exportUtils";
import { convertToTitleCase } from "@/utils/text";

interface ExportAllParams {
  allProductData: StockMovementProductItemType[];
  allEpcDataBySku: Record<string, StockMovementEpcItemType[]>;
  epcDataBySku: Record<string, { skuName: string }>;
  imageUrls: string[];
  note: string;
  ledgerId: string;
  t: (key: string) => string;
  commonT: (key: string) => string;
}

export const exportAllData = async ({
  allProductData,
  allEpcDataBySku,
  epcDataBySku,
  imageUrls,
  note,
  ledgerId,
  t,
  commonT,
}: ExportAllParams) => {
  // Build a single comprehensive data array with all sections
  const allData: Array<Record<string, string>> = [];
  const merges: Array<{ s: { r: number; c: number }; e: { r: number; c: number } }> = [];
  const titleRows: number[] = []; // Track which rows are titles for gray background
  let currentRow = 0;

  // ==================== SECTION 1: TRANSACTION INFO ====================
  allData.push({
    A: "═════════════════════════════════════════════════════════",
    B: "",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
  });
  merges.push({ e: { c: 6, r: currentRow }, s: { c: 0, r: currentRow } });
  currentRow++;

  // Title row - merge across all 7 columns (A-G)
  allData.push({
    A: "TRANSACTION INFORMATION",
    B: "",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
  });
  merges.push({ e: { c: 6, r: currentRow }, s: { c: 0, r: currentRow } });
  titleRows.push(currentRow); // Mark as title row for gray background
  currentRow++;

  allData.push({
    A: "═════════════════════════════════════════════════════════",
    B: "",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
  });
  merges.push({ e: { c: 6, r: currentRow }, s: { c: 0, r: currentRow } });
  currentRow++;
  allData.push({
    A: "Ledger ID",
    B: ledgerId || "-",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
  });
  currentRow++;

  allData.push({
    A: "Export Date",
    B: new Date().toLocaleString(),
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
  });
  currentRow++;

  if (note) {
    allData.push({
      A: t("note"),
      B: note,
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
    });
    currentRow++;
  }
  allData.push({
    A: "",
    B: "",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
  }); // Empty row
  currentRow++;

  // ==================== SECTION 2: IMAGES (if available) ====================
  if (imageUrls && imageUrls.length > 0) {
    allData.push({
      A: "═════════════════════════════════════════════════════════",
      B: "",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
    });
    merges.push({ e: { c: 6, r: currentRow }, s: { c: 0, r: currentRow } });
    currentRow++;

    // Title row - merge across 2 columns (A-B) for images section
    allData.push({
      A: t("images.title").toUpperCase(),
      B: "",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
    });
    merges.push({ e: { c: 1, r: currentRow }, s: { c: 0, r: currentRow } });
    titleRows.push(currentRow); // Mark as title row for gray background
    currentRow++;

    allData.push({
      A: "═════════════════════════════════════════════════════════",
      B: "",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
    });
    merges.push({ e: { c: 6, r: currentRow }, s: { c: 0, r: currentRow } });
    currentRow++;

    allData.push({
      A: "No",
      B: "Image URL",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
    });
    currentRow++;

    imageUrls.forEach((url, index) => {
      allData.push({
        A: String(index + 1),
        B: url,
        C: "",
        D: "",
        E: "",
        F: "",
        G: "",
      });
      currentRow++;
    });
    allData.push({
      A: "",
      B: "",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
    }); // Empty row
    currentRow++;
  }

  // ==================== SECTION 3: PRODUCT SUMMARY ====================
  allData.push({
    A: "═════════════════════════════════════════════════════════",
    B: "",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
  });
  merges.push({ e: { c: 6, r: currentRow }, s: { c: 0, r: currentRow } });
  currentRow++;

  // Title row - merge across 5 columns (A-E) for product table
  allData.push({
    A: t("productList").toUpperCase(),
    B: "",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
  });
  merges.push({ e: { c: 4, r: currentRow }, s: { c: 0, r: currentRow } });
  titleRows.push(currentRow); // Mark as title row for gray background
  currentRow++;

  allData.push({
    A: "═════════════════════════════════════════════════════════",
    B: "",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
  });
  merges.push({ e: { c: 6, r: currentRow }, s: { c: 0, r: currentRow } });
  currentRow++;

  allData.push({
    A: t("productTable.header.no"),
    B: t("productTable.header.productName"),
    C: t("productTable.header.category"),
    D: t("productTable.header.quantity"),
    E: t("productTable.header.lastStatus"),
    F: "",
    G: "",
  });
  currentRow++;

  allProductData.forEach((product) => {
    allData.push({
      A: product.no,
      B: product.productName,
      C: commonT(String(product.category || "").toLowerCase()),
      D: String(product.quantity),
      E: convertToTitleCase(product.lastStatus),
      F: "",
      G: "",
    });
    currentRow++;
  });
  allData.push({
    A: "",
    B: "",
    C: "",
    D: "",
    E: "",
    F: "",
    G: "",
  }); // Empty row
  currentRow++;

  // ==================== SECTION 4: EPC DETAILS (per SKU) ====================
  Object.entries(allEpcDataBySku).forEach(([skuId, epcItems]) => {
    const skuName =
      epcDataBySku[skuId]?.skuName || `SKU-${skuId.substring(0, 8)}`;

    allData.push({
      A: "═════════════════════════════════════════════════════════",
      B: "",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
    });
    merges.push({ e: { c: 6, r: currentRow }, s: { c: 0, r: currentRow } });
    currentRow++;

    // Title row - merge across 7 columns (A-G) for EPC table
    allData.push({
      A: `EPC LIST: ${skuName.toUpperCase()}`,
      B: "",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
    });
    merges.push({ e: { c: 6, r: currentRow }, s: { c: 0, r: currentRow } });
    titleRows.push(currentRow); // Mark as title row for gray background
    currentRow++;

    allData.push({
      A: "═════════════════════════════════════════════════════════",
      B: "",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
    });
    merges.push({ e: { c: 6, r: currentRow }, s: { c: 0, r: currentRow } });
    currentRow++;

    allData.push({
      A: t("epcTable.header.no"),
      B: t("epcTable.header.epc"),
      C: t("epcTable.header.rfidName"),
      D: t("epcTable.header.category"),
      E: t("epcTable.header.amount"),
      F: t("epcTable.header.lastUpdate"),
      G: t("epcTable.header.status"),
    });
    currentRow++;

    const singleItems = epcItems.filter((item) => item.category === "SINGLE");
    const packageItems = epcItems.filter(
      (item) => item.category === "PACKAGE"
    );

    // Add single items
    singleItems.forEach((item, index) => {
      allData.push({
        A: String(index + 1),
        B: item.epc,
        C: item.rfidName || "N/A",
        D: commonT("single"),
        E: "1",
        F: item.lastUpdate,
        G: convertToTitleCase(item.lastStatus),
      });
      currentRow++;
    });

    // Group and expand package items
    if (packageItems.length > 0) {
      const packageMap = new Map<string, StockMovementEpcItemType[]>();
      packageItems.forEach((item) => {
        const key = item.epc;
        if (!packageMap.has(key)) {
          packageMap.set(key, []);
        }
        packageMap.get(key)!.push(item);
      });

      let packageGroupNo = singleItems.length + 1;
      Array.from(packageMap.values()).forEach((packageGroup) => {
        const firstItem = packageGroup[0];
        // Add parent package row
        allData.push({
          A: String(packageGroupNo),
          B: `${commonT("package")} (${packageGroup.length} items)`,
          C: firstItem.rfidName || "N/A",
          D: commonT("package"),
          E: String(packageGroup.length),
          F: firstItem.lastUpdate,
          G: convertToTitleCase(firstItem.lastStatus),
        });
        currentRow++;

        // Add all child items
        packageGroup.forEach((item, childIndex) => {
          allData.push({
            A: `  ${packageGroupNo}.${childIndex + 1}`,
            B: item.epc,
            C: item.rfidName || "N/A",
            D: "-",
            E: "-",
            F: "-",
            G: convertToTitleCase(item.lastStatus),
          });
          currentRow++;
        });

        packageGroupNo++;
      });
    }

    allData.push({
      A: "",
      B: "",
      C: "",
      D: "",
      E: "",
      F: "",
      G: "",
    }); // Empty row after each SKU section
    currentRow++;
  });

  // Create single sheet with all data
  const columns = [
    { key: "A", label: "A" },
    { key: "B", label: "B" },
    { key: "C", label: "C" },
    { key: "D", label: "D" },
    { key: "E", label: "E" },
    { key: "F", label: "F" },
    { key: "G", label: "G" },
  ];

  await exportToExcel({
    columnWidths: [10, 40, 25, 15, 15, 20, 15], // Widths for columns A-G
    columns,
    data: allData,
    filename: `stock_movement_detail_${ledgerId || "export"}_${new Date().toISOString().split("T")[0]}`,
    grayBackgroundRows: titleRows, // Apply gray background to title rows
    merges,
    sheetName: "Stock Movement Detail",
  });
};
