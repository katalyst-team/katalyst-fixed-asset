import { CheckOutModal } from "./CheckOutModal";
import { DisposalRequestModal } from "./DisposalRequestModal";
import { EditAssetModal } from "./EditAssetModal";
import { EpcRangeModal } from "./EpcRangeModal";
import { useFaModal } from "./FaModalContext";
import { LocateAssetModal } from "./LocateAssetModal";
import { OrderStockModal } from "./OrderStockModal";
import { PmRuleModal } from "./PmRuleModal";
import { ReservationModal } from "./ReservationModal";
import { TransferHistoryModal } from "./TransferHistoryModal";
import { TransferModal } from "./TransferModal";
import { WorkOrderModal } from "./WorkOrderModal";

export function FaModalRoot() {
  const { closeModal, payload, type } = useFaModal();

  return (
    <>
      <CheckOutModal
        open={type === "checkout"}
        onClose={closeModal}
      />
      <DisposalRequestModal
        open={type === "disposal"}
        onClose={closeModal}
      />
      <EditAssetModal
        asset={payload.asset ?? null}
        open={type === "editAsset"}
        onClose={closeModal}
      />
      <EpcRangeModal
        open={type === "epcRange"}
        onClose={closeModal}
      />
      <LocateAssetModal
        open={type === "locateAsset"}
        onClose={closeModal}
      />
      <OrderStockModal
        open={type === "orderStock"}
        onClose={closeModal}
      />
      <PmRuleModal
        open={type === "pmRule"}
        onClose={closeModal}
      />
      <ReservationModal
        open={type === "reservation"}
        onClose={closeModal}
      />
      <TransferHistoryModal
        open={type === "transferHistory"}
        onClose={closeModal}
      />
      <TransferModal
        open={type === "transfer"}
        onClose={closeModal}
      />
      <WorkOrderModal
        open={type === "workOrder"}
        onClose={closeModal}
      />
    </>
  );
}
