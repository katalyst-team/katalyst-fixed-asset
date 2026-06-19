"use client";

import { useMemo } from "react";

import { ScrollArea } from "@/components/ui/scroll-area";

import {
  AssignRfidCard,
  AssignRfidFooter,
  AssignRfidHeader,
} from "./components";
import { useAssignRfid } from "./useAssignRfid";

const AssignRfid = () => {
  const {
    ledgers,
    isProcessing,
    updateLedger,
    addLedger,
    removeLedger,
    resetLedgers,
    isLedgerValid,
    areAllLedgersValid,
    handleSave,
  } = useAssignRfid();

  const validLedgersCount = useMemo(() => {
    return ledgers.filter((l) => isLedgerValid(l)).length;
  }, [ledgers, isLedgerValid]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <AssignRfidHeader onAddLedger={addLedger} />

      <ScrollArea className="h-[calc(100vh-250px)]">
        <div className="space-y-4 pr-4">
          {ledgers.map((ledger, index) => (
            <AssignRfidCard
              key={ledger.id}
              canRemove={ledgers.length > 1}
              isValid={isLedgerValid(ledger)}
              ledger={ledger}
              ledgerIndex={index}
              onRemove={() => removeLedger(index)}
              onUpdate={(updates) => updateLedger(index, updates)}
            />
          ))}
        </div>
      </ScrollArea>

      <AssignRfidFooter
        areAllLedgersValid={areAllLedgersValid}
        isProcessing={isProcessing}
        totalLedgersCount={ledgers.length}
        validLedgersCount={validLedgersCount}
        onReset={resetLedgers}
        onSave={handleSave}
      />
    </div>
  );
};

export default AssignRfid;
