"use client";

import React from "react";

import DetailInventory from "./DetailInventory";
import { DetailInventoryProvider } from "./useDetailInventory";

interface DetailInventoryWrapperProps {
  skuId: string;
  itemsPerPage?: number;
}

const DetailInventoryWrapper: React.FC<DetailInventoryWrapperProps> = ({
  skuId,
  itemsPerPage = 10,
}) => {
  return (
    <DetailInventoryProvider itemsPerPage={itemsPerPage} skuId={skuId}>
      <DetailInventory skuId={skuId} />
    </DetailInventoryProvider>
  );
};

export default DetailInventoryWrapper;
