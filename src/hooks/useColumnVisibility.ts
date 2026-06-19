import { useEffect, useRef, useState } from "react";

export interface ColumnDefinition {
  id: string;
  label: string;
}

interface StoredColumnData {
  visible: string[];
  allKnown: string[];
}

const STORAGE_PREFIX = "column-visibility-";

/**
 * Parse stored data from localStorage, handling both the new format
 * ({ visible, allKnown }) and the legacy format (string[]).
 */
const parseStoredData = (raw: string | null): StoredColumnData | null => {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    // New format: { visible: [...], allKnown: [...] }
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      Array.isArray(parsed.visible)
    ) {
      const allKnown = Array.isArray(parsed.allKnown)
        ? parsed.allKnown
        : parsed.visible;
      return {
        allKnown,
        visible: parsed.visible,
      };
    }
    // Legacy format: string[]
    if (Array.isArray(parsed)) {
      return { allKnown: parsed, visible: parsed };
    }
  } catch {
    // Parsing failed
  }
  return null;
};

export const useColumnVisibility = (
  pageKey: string,
  allColumns: ColumnDefinition[],
) => {
  const storageKey = `${STORAGE_PREFIX}${pageKey}`;

  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(() => {
    if (typeof window === "undefined") {
      return new Set();
    }
    const stored = parseStoredData(localStorage.getItem(storageKey));
    if (stored) {
      return new Set(stored.visible);
    }
    return new Set();
  });

  // Track all columns the user has ever seen, so we can distinguish
  // "truly new column" from "user intentionally hid this column".
  const allKnownRef = useRef<Set<string>>(new Set());
  const previousColumnsRef = useRef<Set<string>>(new Set());
  const isInitializedRef = useRef(false);
  const [isInitialized, setIsInitialized] = useState(false);
  // Track whether we started from existing stored data (returning visit)
  // vs from scratch (first visit). On first visit, ALL new columns should auto-show.
  const hadStoredDataRef = useRef(false);

  // Initialize and merge when columns change
  useEffect(() => {
    const allColumnIds = new Set(allColumns.map((col) => col.id));
    const previousColumnIds = previousColumnsRef.current;

    // Check if columns have changed by comparing actual IDs
    const sizeChanged = previousColumnIds.size !== allColumnIds.size;
    const hasNewColumns = Array.from(allColumnIds).some(
      (id) => !previousColumnIds.has(id),
    );
    const hasRemovedColumns = Array.from(previousColumnIds).some(
      (id) => !allColumnIds.has(id),
    );
    const hasColumnsChanged = sizeChanged || hasNewColumns || hasRemovedColumns;

    if (!hasColumnsChanged && isInitializedRef.current) {
      return; // No changes, skip
    }

    if (typeof window !== "undefined") {
      const stored = parseStoredData(localStorage.getItem(storageKey));

      if (stored) {
        const storedVisibleSet = new Set(stored.visible);
        const storedAllKnownSet = new Set(stored.allKnown);

        if (!isInitializedRef.current) {
          // First time initialization from localStorage — auto-show new columns
          allColumnIds.forEach((id) => {
            if (!storedAllKnownSet.has(id) || id.startsWith("attr-")) {
              storedVisibleSet.add(id);
            }
          });
          setVisibleColumns(storedVisibleSet);
          allKnownRef.current = storedAllKnownSet;
          allColumnIds.forEach((id) => allKnownRef.current.add(id));
          hadStoredDataRef.current = true;

          // previousColumnsRef tracks the ACTUAL current columns (for change detection only).
          // allKnownRef separately tracks which columns we've ever seen (for new-vs-hidden decisions).
          previousColumnsRef.current = allColumnIds;

          setIsInitialized(true);
          isInitializedRef.current = true;
          return;
        } else {
          // Columns changed after initialization — merge
          setVisibleColumns((prev) => {
            const merged = new Set(prev);
            let changed = false;

            // Handle new columns that weren't in the previous column set
            allColumnIds.forEach((id) => {
              if (!previousColumnIds.has(id)) {
                if (!hadStoredDataRef.current) {
                  // First visit (no stored data) — always show new columns
                  merged.add(id);
                  changed = true;
                } else if (!allKnownRef.current.has(id) || id.startsWith("attr-")) {
                  // Returning visit — show truly new columns OR dynamic attribute columns
                  // (attr- columns are data-driven, not user-controlled visibility)
                  merged.add(id);
                  changed = true;
                }
                // If returning visit AND non-attr column is in allKnown but not visible,
                // the user hid it — keep hidden
              }
            });

            // Remove columns that no longer exist in the current column set
            // BUT keep dynamic attribute columns (they may load later)
            prev.forEach((id) => {
              if (!allColumnIds.has(id) && !id.startsWith("attr-")) {
                merged.delete(id);
                changed = true;
              }
            });

            // Return same reference if nothing changed (avoids re-render)
            return changed ? merged : prev;
          });

          // Update allKnown with newly discovered columns
          allColumnIds.forEach((id) => allKnownRef.current.add(id));

          // previousColumnsRef tracks ACTUAL current columns (for change detection)
          previousColumnsRef.current = allColumnIds;
          return;
        }
      }
    }

    // No stored data or parsing failed — show all columns
    setVisibleColumns(allColumnIds);
    allKnownRef.current = new Set(allColumnIds);
    previousColumnsRef.current = allColumnIds;
    setIsInitialized(true);
    isInitializedRef.current = true;
  }, [storageKey, allColumns]);

  // Save to localStorage whenever visibility changes (after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    if (typeof window === "undefined") return;

    // Update allKnown with all current columns
    allColumns.forEach((col) => allKnownRef.current.add(col.id));

    const data: StoredColumnData = {
      allKnown: Array.from(allKnownRef.current),
      visible: Array.from(visibleColumns),
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
  }, [storageKey, visibleColumns, isInitialized, allColumns]);

  const toggleColumn = (columnId: string) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
      } else {
        next.add(columnId);
      }
      return next;
    });
  };

  const showAllColumns = () => {
    setVisibleColumns(new Set(allColumns.map((col) => col.id)));
  };

  const hideAllColumns = () => {
    setVisibleColumns(new Set());
  };

  const isColumnVisible = (columnId: string) => visibleColumns.has(columnId);

  return {
    hideAllColumns,
    isColumnVisible,
    isInitialized,
    showAllColumns,
    toggleColumn,
    visibleColumns,
  };
};
