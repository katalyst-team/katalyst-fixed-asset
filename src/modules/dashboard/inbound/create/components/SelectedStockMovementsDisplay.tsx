import { useTranslation } from "next-i18next";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RfidMapData } from "@/types/rfid";

import { ItemDetailModal } from "./ItemDetailModal";

type SelectedStockMovementsDisplayProps = {
  selectedRfidMapData: RfidMapData[];
};

export function SelectedStockMovementsDisplay({
  selectedRfidMapData,
}: SelectedStockMovementsDisplayProps) {
  const { t } = useTranslation("inbound");

  if (selectedRfidMapData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading">
          {t("create.stockMovementGrid.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {selectedRfidMapData.map((rfid) => (
              <div
                key={rfid.id}
                className="border rounded-lg p-4 bg-muted/50 space-y-3"
              >
                {/* RFID Header */}
                <div className="space-y-2">
                  <div className="font-medium text-sm">
                    ID: {rfid.id.substring(0, 12)}...
                  </div>
                  <div className="text-sm text-muted-foreground">{rfid.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {rfid.type} • {rfid.category} •{" "}
                    {new Date(rfid.created_at).toLocaleDateString()}
                  </div>
                </div>

                {/* Products List */}
                <div className="space-y-2">
                  <div className="text-xs font-medium text-foreground">
                    Items ({rfid.items?.length || 0}):
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {rfid.items?.map((item, index) => (
                      <div
                        key={`${rfid.id}-${index}`}
                        className="flex items-start gap-2 text-xs p-2 bg-background rounded border"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {item.sku?.name || "-"}
                          </div>
                          {item.sku?.internal_code && (
                            <div className="text-muted-foreground">
                              Internal Code: {item.sku.internal_code}
                            </div>
                          )}
                          {item.rfid_detail?.name && (
                            <div className="text-muted-foreground">
                              RFID Name: {item.rfid_detail.name}
                            </div>
                          )}
                          {item.rfid_detail?.epc && (
                            <div className="font-mono text-muted-foreground">
                              EPC: {item.rfid_detail.epc}
                            </div>
                          )}
                          {(item.rfid_detail?.type ||
                            item.rfid_detail?.category) && (
                            <div className="flex gap-2 text-muted-foreground">
                              {item.rfid_detail?.type && (
                                <span>
                                  Type: {item.rfid_detail.type}
                                </span>
                              )}
                              {item.rfid_detail?.category && (
                                <span>
                                  Category: {item.rfid_detail.category}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <ItemDetailModal item={item} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
