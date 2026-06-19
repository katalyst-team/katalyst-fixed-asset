import { useTranslation } from "next-i18next";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ActionType } from "@/types/addRemoveRfid";

interface ConfirmationDialogProps {
  actionType: ActionType;
  isOpen: boolean;
  itemCount: number;
  onClose: () => void;
  onConfirm: () => void;
  rfidMappings: Array<{
    epc: string;
    itemIds: string[];
    rfidCategory: string;
    rfidName: string | null;
  }>;
}

export function ConfirmationDialog({
  actionType,
  isOpen,
  itemCount,
  onClose,
  onConfirm,
  rfidMappings,
}: ConfirmationDialogProps) {
  const { t } = useTranslation("add-remove-rfid");

  const isAdd = actionType === ActionType.ADD;
  const actionText = isAdd ? t("actionType.add") : t("actionType.remove");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("confirmation.title").replace("{action}", actionText)}
          </DialogTitle>
          <DialogDescription>
            {isAdd
              ? t("confirmation.addMessage", { count: itemCount })
              : t("confirmation.removeMessage", { count: itemCount })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {isAdd && rfidMappings.length > 0 && (
            <ScrollArea className="h-[200px] rounded-md border p-4">
              <div className="space-y-2">
                {rfidMappings.map((mapping, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{mapping.epc}</span>
                    <span className="text-muted-foreground">
                      {" "}
                      ({mapping.rfidName || t("common:unnamed")})
                    </span>
                    <span className="ml-2 rounded bg-muted px-2 py-0.5 text-xs">
                      {mapping.itemIds.length} {t("table.items")}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {t("confirmation.cancel")}
          </Button>
          <Button onClick={onConfirm}>
            {t("confirmation.submit")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
