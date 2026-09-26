import { ArrowRight } from "lucide-react";
import { useTranslation } from "next-i18next";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUser } from "@/context/user-context";
import { useGetTransferHistoryQuery } from "@/hooks/api/fixed-assets";
import { cn } from "@/lib/utils";

interface TransferHistoryModalProps {
  onClose: () => void;
  open: boolean;
}

export function TransferHistoryModal({
  onClose,
  open,
}: TransferHistoryModalProps) {
  const { t } = useTranslation("fixed-assets");
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { data: resp } = useGetTransferHistoryQuery({ organizationId });
  const rows = resp?.data?.history ?? [];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{t("modals.transferHistory.title")}</DialogTitle>
          <DialogDescription>
            {t("modals.transferHistory.description")}
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="py-2 pr-3 font-medium">
                  {t("modals.transferHistory.colTransfer")}
                </th>
                <th className="px-3 py-2 font-medium">
                  {t("modals.transferHistory.colRoute")}
                </th>
                <th className="px-3 py-2 font-medium">
                  {t("modals.transferHistory.colCompleted")}
                </th>
                <th className="py-2 pl-3 font-medium">
                  {t("modals.transferHistory.colBy")}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn("border-b border-border/60", "last:border-0")}
                >
                  <td className="py-3 pr-3">
                    <div className="font-medium text-foreground">{row.asset_name}</div>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      {row.from_loc}
                      <ArrowRight
                        className={cn(
                          "h-3.5 w-3.5 shrink-0",
                          "text-foreground",
                        )}
                      />
                      {row.to_loc}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-muted-foreground">
                    {row.received_at ?? row.dispatched_at}
                  </td>
                  <td className="py-3 pl-3 text-muted-foreground">{row.cost_center}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <button
            className="ks-btn ks-btn-ghost"
            type="button"
            onClick={onClose}
          >
            {t("modals.transferHistory.close")}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
