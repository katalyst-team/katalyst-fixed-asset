"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useUser } from "@/context/user-context";
import useGetInventorySkuQuery from "@/hooks/api/inventory/useGetInventorySkuQuery";
import useGetLedgerDataQuery from "@/hooks/api/ledger/useGetLedgerDataQuery";
import useGetSkuSectionsQuery from "@/hooks/api/sku/useGetSkuSectionsQuery";
import { InventorySectionItem } from "@/types/detailInventory";
import { LedgerFilter, LedgerItemType } from "@/types/ledger";
import { SkuItemType, SkuStatus, SkuType } from "@/types/sku";

interface DetailInventoryContextType {
  areas: InventorySectionItem[];
  inventoryItems: LedgerItemType[];
  isLoading: boolean;
  isSectionLoading: boolean;
  isSkuLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  setCurrentPage: (page: number) => void;
  selectedSection: string | null;
  setSelectedSection: (sectionId: string | null) => void;
  fetchSectionItems: (sectionId: string) => void;
  itemName: string;
  skuData: SkuItemType | null;
}

const DetailInventoryContext = createContext<
  DetailInventoryContextType | undefined
>(undefined);

interface DetailInventoryProviderProps {
  children: ReactNode;
  skuId: string;
  itemsPerPage?: number;
}

export const DetailInventoryProvider: React.FC<
  DetailInventoryProviderProps
> = ({ children, skuId, itemsPerPage = 10 }) => {
  const { tokenPayload, selectedTeam } = useUser();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [localItemsPerPage] = useState<number>(itemsPerPage);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Create filters without limit property for LedgerFilter
  const [filters, setFilters] = useState<LedgerFilter>({});

  // Fetch sections by SKU
  const {
    data: sectionsData,
    isLoading: isSectionLoading,
    isSuccess: isSectionSuccess,
  } = useGetSkuSectionsQuery({
    filters: {
      limit: localItemsPerPage,
      store_id: selectedTeam || undefined,
    },
    organizationId: tokenPayload?.organization_id || "",
    skuId,
  });

  // Update filters for items within a section
  useEffect(() => {
    if (selectedSection) {
      // Only include properties that are in LedgerFilter type
      setFilters({
        section_id: selectedSection,
        sku_ids: [skuId],
      });
    }
  }, [selectedSection, skuId]);

  // Fetch inventory items in selected section
  const {
    data: itemsData,
    isLoading,
    isSuccess,
  } = useGetLedgerDataQuery({
    enabled: false,
    filters,
    organizationId: tokenPayload?.organization_id || "",
    storeId: selectedTeam || "",
  });

  // Using sections directly instead of areas.sections
  const [areas, setAreas] = useState<InventorySectionItem[]>([]);
  const [inventoryItems, setInventoryItems] = useState<LedgerItemType[]>([]);
  const [totalItems, setTotalItems] = useState<number>(0);

  useEffect(() => {
    if (isSectionSuccess && sectionsData) {
      setAreas(sectionsData.data.sections || []);
    }
  }, [sectionsData, isSectionSuccess]);

  useEffect(() => {
    if (isSuccess && itemsData) {
      const items = itemsData.data.items || [];
      setInventoryItems(items);
      // Since LedgerResponse doesn't have pagination, we'll set total from array length
      setTotalItems(items.length);
    }
  }, [itemsData, isSuccess]);

  const fetchSectionItems = (sectionId: string) => {
    setSelectedSection(sectionId);
    setCurrentPage(1);
  };

  // Fetch SKU detail data
  const { data: inventorySkuData, isLoading: isSkuLoading } = useGetInventorySkuQuery({
    enabled: Boolean(skuId),
    organizationId: tokenPayload?.organization_id || "",
    skuId: skuId || "",
  });

  const itemName = useMemo(() => {
    return inventorySkuData?.data.inventory.name || "";
  }, [inventorySkuData]);

  const skuData = useMemo((): SkuItemType | null => {
    if (!inventorySkuData?.data.inventory) return null;

    const inventory = inventorySkuData.data.inventory;

    // Map InventorySkuData to SkuItemType
    // Note: Some fields might need empty defaults if not present in response
    return {
      attributes: (inventory.attributes ?? []).map((attr) => ({
        Description: attr.Description,
        Name: attr.Name,
        Type: attr.Type,
        Values: attr.Values,
        attribute_id: attr.attribute_id,
        description: attr.description,
        name: attr.name,
        resolved_values: attr.resolved_values,
        type: attr.type,
        values: attr.values,
      })),
      brand: {
        id: inventory.brand?.id || "",
        name: inventory.brand?.name || "",
      },
      brand_id: inventory.brand?.id || "",
      categories: inventory.categories,
      color: {
        id: inventory.color?.id || "",
        name: inventory.color?.name || "",
      },
      color_id: inventory.color?.id || "",
      created_at: "", // Not provided in inventory detail
      deleted_at: null,
      description: "", 
      id: inventory.id,
      image_urls: inventory.image_urls || [],
      internal_code: inventory.internal_code,
      name: inventory.name,
      organization_id: tokenPayload?.organization_id || "",
      size: {
        id: inventory.size?.id || "",
        name: inventory.size?.name || "",
      },
      size_id: inventory.size?.id || "",
      sku: inventory.sku,
      status: (inventory.status as SkuStatus) || SkuStatus.ACTIVE,
      type: SkuType.COMMON,
      updated_at: "",
    };
  }, [inventorySkuData, tokenPayload?.organization_id]);

  const value: DetailInventoryContextType = {
    areas,
    currentPage,
    fetchSectionItems,
    inventoryItems,
    isLoading,
    isSectionLoading,
    isSkuLoading,
    itemName,
    itemsPerPage: localItemsPerPage,
    selectedSection,
    setCurrentPage,
    setSelectedSection,
    skuData,
    totalItems,
  };

  return (
    <DetailInventoryContext.Provider value={value}>
      {children}
    </DetailInventoryContext.Provider>
  );
};

export const useDetailInventory = (): DetailInventoryContextType => {
  const context = useContext(DetailInventoryContext);
  if (!context) {
    throw new Error(
      "useDetailInventory must be used within a DetailInventoryProvider"
    );
  }
  return context;
};
