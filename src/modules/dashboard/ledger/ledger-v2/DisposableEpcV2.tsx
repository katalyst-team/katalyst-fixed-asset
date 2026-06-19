"use client";

import { useEffect } from "react";

import { EnumLedgerStatus } from "@/types/ledger";
import { RfidType } from "@/types/rfid";

import LedgerV2 from "./LedgerV2";
import { useLedgerV2 } from "./useLedgerV2";

const DisposableEpcV2 = () => {
  const { setSelectedStatus } = useLedgerV2();

  // Set default status to WAITING_PRINT for disposable EPC
  useEffect(() => {
    setSelectedStatus(EnumLedgerStatus.WAITING_PRINT);
  }, [setSelectedStatus]);

  // Disposable EPC shows both tabs (same as ledger-v2)
  return (
    <LedgerV2 epcType={RfidType.DISPOSABLE} visibleTabs={[EnumLedgerStatus.WAITING_PRINT, EnumLedgerStatus.WAITING_INBOUND]} />
  );
};

export default DisposableEpcV2;