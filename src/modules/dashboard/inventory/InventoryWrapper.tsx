"use client";

import React from "react";

import Inventory from "./Inventory";

interface InventoryWrapperProps {
  itemsPerPage?: number;
}

const InventoryWrapper: React.FC<InventoryWrapperProps> = () => {
  return <Inventory />;
};

export default InventoryWrapper;
