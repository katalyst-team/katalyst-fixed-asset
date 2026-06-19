"use client";

import React from "react";

import EpcDetail from "./EpcDetail";
import { EpcDetailProvider } from "./useEpcDetail";

interface EpcDetailWrapperProps {
  epcId: string;
  itemsPerPage?: number;
}

const EpcDetailWrapper: React.FC<EpcDetailWrapperProps> = ({
  epcId,
  itemsPerPage = 10,
}) => {
  return (
    <EpcDetailProvider epcId={epcId} itemsPerPage={itemsPerPage}>
      <EpcDetail />
    </EpcDetailProvider>
  );
};

export default EpcDetailWrapper;
