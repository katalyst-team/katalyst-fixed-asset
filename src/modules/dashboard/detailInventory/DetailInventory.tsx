"use client";

import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import EmptyState from "@/components/shared/EmptyState";
import Loading from "@/components/shared/Loading";

import DetailInventoryArea from "./DetailInventoryArea";
import DetailInventoryHeader from "./DetailInventoryHeader";
import DetailInventorySkuInfo from "./DetailInventorySkuInfo";
import DetailInventoryStores from "./DetailInventoryStores";
import DetailInventorySummary from "./DetailInventorySummary";
import { useDetailInventory } from "./useDetailInventory";

interface DetailInventoryProps {
  skuId: string;
  storeId?: string;
}

const DetailInventory: React.FC<DetailInventoryProps> = ({ skuId, storeId }) => {
  const { t } = useTranslation("inventory");
  const router = useRouter();
  const {
    areas,
    isSkuLoading,
    itemName: skuName,
    skuData,
  } = useDetailInventory();

  const [isAllStoresSelected, setIsAllStoresSelected] = useState<boolean>(false);

  // Check if "All stores" is selected from path parameter
  useEffect(() => {
    const pathStoreId = storeId || (router.query.store_id as string);
    setIsAllStoresSelected(pathStoreId === "0");
  }, [storeId, router.query.store_id]);

  // Show loading when fetching SKU data
  if (isSkuLoading) {
    return <Loading />;
  }

  if (!skuData) {
    return (
      <EmptyState
        description={t("detailEmpty.description")}
        title={t("detailEmpty.title")}
      />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <DetailInventoryHeader skuName={skuName} />
      <DetailInventorySkuInfo skuData={skuData} />
      <DetailInventorySummary skuId={skuId} />

      {/* Conditionally render based on store selection */}
      {isAllStoresSelected ? (
        // Show store-wise inventory data when "All stores" is selected
        <DetailInventoryStores skuId={skuId} />
      ) : (
        // Show area-based inventory data for specific store selection
        <>
          {/* Display all sections for selection */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {areas.map((section) => (
              <DetailInventorySection
                key={section.id}
                isActive={selectedSection === section.id}
                section={section}
              />
            ))}
          </div> */}

          {/* Display the selected section with its items */}
          {areas.map((area) => (
            <DetailInventoryArea key={area.id} area={area} skuId={skuId} />
          ))}
          <DetailInventoryArea area={{ id: null, name: null }} skuId={skuId} />
        </>
      )}
    </div>
  );
};

export default DetailInventory;
