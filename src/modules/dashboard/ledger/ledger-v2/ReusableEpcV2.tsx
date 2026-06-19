"use client";

import { EnumLedgerStatus } from "@/types/ledger";
import { RfidType } from "@/types/rfid";

import LedgerV2 from "./LedgerV2";

const ReusableEpcV2 = () => {
  return (
    <LedgerV2 
      epcType={RfidType.REUSABLE} 
      initialStatus={EnumLedgerStatus.WAITING_INBOUND}
      visibleTabs={[EnumLedgerStatus.WAITING_INBOUND]} 
    />
  );
};

export default ReusableEpcV2;