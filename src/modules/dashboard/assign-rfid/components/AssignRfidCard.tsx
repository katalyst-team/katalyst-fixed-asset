import { Ban, X } from "lucide-react";
import { useTranslation } from "next-i18next";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ItemType } from "@/types/ledger";
import { RfidCategory, RfidType } from "@/types/rfid";

import { MultiLedger } from "../store";
import ItemSelectionTypeSection from "./ItemSelectionTypeSection";
import ItemsManualSection from "./ItemsManualSection";
import ItemsPackingSection from "./ItemsPackingSection";
import RfidSelectionSection from "./RfidSelectionSection";
import UnitSection from "./UnitSection";

interface AssignRfidCardProps {
  ledger: MultiLedger;
  ledgerIndex: number;
  isValid: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onUpdate: (updates: Partial<MultiLedger>) => void;
}

const AssignRfidCard: React.FC<AssignRfidCardProps> = ({
  ledger,
  ledgerIndex,
  isValid,
  canRemove,
  onRemove,
  onUpdate,
}) => {
  const { t } = useTranslation(["assign-rfid", "ledger"]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle>
              {t("ledger")} {ledgerIndex + 1}
            </CardTitle>
            <Badge variant={isValid ? "default" : "destructive"}>
              {isValid ? "✓" : "!"}
            </Badge>
          </div>
          {canRemove && (
            <Button
              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
              size="sm"
              variant="ghost"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* RFID Type & Category Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label isRequired>{t("rfidType")}</Label>
            <Select
              value={ledger.rfidType}
              onValueChange={(value: RfidType) => {
                onUpdate({
                  rfidType: value,
                  selectedEpcs: [],
                  selectedRfidIds: [],
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RfidType.REUSABLE}>
                  {t("reusable")}
                </SelectItem>
                <SelectItem value={RfidType.DISPOSABLE}>
                  {t("disposable")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label isRequired>{t("rfidCategory")}</Label>
            <Select
              value={ledger.rfidCategory}
              onValueChange={(value: RfidCategory) => {
                onUpdate({
                  itemType:
                    value === RfidCategory.SINGLE
                      ? ItemType.SINGLE
                      : ItemType.PACKING,
                  rfidCategory: value,
                  selectedEpcs: [],
                  selectedRfidIds: [],
                });
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RfidCategory.SINGLE}>
                  {t("single")}
                </SelectItem>
                <SelectItem value={RfidCategory.PACKAGE}>
                  {t("package")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Item Selection Type (SKU/Product) */}
        <ItemSelectionTypeSection
          itemSelectionType={ledger.itemSelectionType}
          onUpdate={onUpdate}
        />

        {/* RFID Selection */}
        <RfidSelectionSection ledger={ledger} onUpdate={onUpdate} />

        {/* Item Type - only for PACKAGE category */}
        {ledger.rfidCategory === RfidCategory.PACKAGE && (
          <div className="space-y-2">
            <Label isRequired>{t("itemType", { ns: "ledger" })}</Label>
            <Select
              value={ledger.itemType}
              onValueChange={(value: ItemType) =>
                onUpdate({ itemType: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ItemType.SINGLE}>
                  {t("modal.create.itemTypes.single", { ns: "ledger" })}
                </SelectItem>
                <SelectItem value={ItemType.PACKING}>
                  {t("modal.create.itemTypes.packing", { ns: "ledger" })}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Unit Input - only for REUSABLE + PACKING */}
        {ledger.rfidType === RfidType.REUSABLE &&
          ledger.itemType === ItemType.PACKING && (
            <UnitSection unit={ledger.unit} onUpdate={onUpdate} />
          )}

        {/* Selection Mode Tabs */}
        <div className="space-y-2">
          <Label>{t("modal.create.selectionMode", { ns: "ledger" })}</Label>
          <Tabs
            value={ledger.selectionMode}
            onValueChange={(value) =>
              onUpdate({
                selectionMode: value as "manual" | "packing",
              })
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">
                {t("modal.create.manualSelection", { ns: "ledger" })}
              </TabsTrigger>
              <TabsTrigger
                disabled={ledger.itemType === ItemType.SINGLE}
                value="packing"
              >
                <span className="flex items-center gap-2">
                  {t("modal.create.packingCollection", { ns: "ledger" })}
                  {ledger.itemType === ItemType.SINGLE && (
                    <Ban className="h-4 w-4 opacity-50" />
                  )}
                </span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual">
              <ItemsManualSection
                ledger={ledger}
                ledgerIndex={ledgerIndex}
                onUpdate={onUpdate}
              />
            </TabsContent>

            <TabsContent value="packing">
              <ItemsPackingSection
                ledger={ledger}
                ledgerIndex={ledgerIndex}
              />
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
};

export default AssignRfidCard;
