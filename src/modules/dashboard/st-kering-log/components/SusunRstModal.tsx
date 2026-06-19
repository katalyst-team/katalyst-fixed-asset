"use client";

import { useTranslation } from "next-i18next";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/user-context";
import useUpdateSkuMutation from "@/hooks/api/sku/useUpdateSkuMutation";
import useGetStatusDataQuery from "@/hooks/api/status/useGetStatusDataQuery";
import { patchItemStatusService } from "@/services/item/patchItemStatusService";
import { SkuItemType } from "@/types/sku";

function formatDateToYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

interface SusunRstModalProps {
  item: SkuItemType | null;
  open: boolean;
  onClose: () => void;
  tanggalPotongAttrId: string | null;
}

const SusunRstModal: React.FC<SusunRstModalProps> = ({
  item,
  onClose,
  open,
  tanggalPotongAttrId,
}) => {
  const { t } = useTranslation("st-kering-log");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const [processDate, setProcessDate] = useState<Date>(new Date());

  const { data: statusData } = useGetStatusDataQuery({ organizationId });

  const waitingInboundStatusId = useMemo(() => {
    return (
      statusData?.data?.statuses?.find(
        (status) => status.name === "WAITING_INBOUND",
      )?.id ?? null
    );
  }, [statusData]);

  const itemStatus = item?.item?.status?.name;
  const itemId = item?.item?.id;
  const storeId = item?.item?.store?.id;

  const updateSkuMutation = useUpdateSkuMutation();

  const handleClose = () => {
    setProcessDate(new Date());
    onClose();
  };

  const handleSubmit = async () => {
    if (!item || !tanggalPotongAttrId) {
      toast.error(
        t("susunRst.validationError", "Cannot update: attribute not found"),
      );
      return;
    }

    const dateStr = formatDateToYYYYMMDD(processDate);

    try {
      if (
        itemStatus === "SUCCESS_INBOUND" &&
        itemId &&
        storeId &&
        waitingInboundStatusId
      ) {
        await patchItemStatusService({
          data: { status_id: waitingInboundStatusId },
          itemId,
          organizationId,
          storeId,
        });
      }

      await updateSkuMutation.mutateAsync({
        attribute_items: [
          { attribute_id: tanggalPotongAttrId, values: dateStr },
        ],
        organization_id: organizationId,
        sku_id: item.id,
      });

      toast.success(
        t("susunRst.success", "Tanggal Potong updated successfully"),
      );
      handleClose();
    } catch {
      toast.error(
        t("susunRst.error", "Failed to update Tanggal Potong"),
      );
    }
  };

  const isSubmitting = updateSkuMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {t("susunRst.title", "Susun RST Kering")}
          </DialogTitle>
          <DialogDescription>
            {item?.internal_code
              ? t("susunRst.description", {
                  code: item.internal_code,
                  defaultValue: `Set Tanggal Potong for palet ${item.internal_code}`,
                })
              : t("susunRst.descriptionGeneric", "Set cutting date for this item")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>{t("susunRst.date", "Tanggal Potong")}</Label>
            <DatePicker
              buttonClassName="w-full"
              className="w-full"
              value={processDate}
              onChangeAction={(d) => d && setProcessDate(d)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            {t("susunRst.cancel", "Cancel")}
          </Button>
          <Button
            disabled={!tanggalPotongAttrId || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting
              ? t("susunRst.submitting", "Updating...")
              : t("susunRst.submit", "Set Tanggal Potong")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SusunRstModal;
