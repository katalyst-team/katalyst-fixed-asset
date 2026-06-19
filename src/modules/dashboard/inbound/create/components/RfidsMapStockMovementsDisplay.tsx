import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RfidMapData } from "@/types/rfid";

import { ItemDetailModal } from "./ItemDetailModal";

interface SelectedRfidsDisplayProps {
  rfidsMapData: Record<string, RfidMapData>;
  selectedRfidIds: string[];
}

export function SelectedRfidsDisplay({
  rfidsMapData,
  selectedRfidIds,
}: SelectedRfidsDisplayProps) {
  const { t } = useTranslation("inbound");

  // Filter to only show selected RFIDs
  const filteredRfidsMapData = useMemo(() => {
    if (!rfidsMapData || selectedRfidIds.length === 0) return {};

    return Object.entries(rfidsMapData).reduce((acc, [epc, data]) => {
      if (selectedRfidIds.includes(data.id)) {
        acc[epc] = data;
      }
      return acc;
    }, {} as Record<string, RfidMapData>);
  }, [rfidsMapData, selectedRfidIds]);

  if (!filteredRfidsMapData || Object.keys(filteredRfidsMapData).length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-heading">
          {t("create.selectedRfids.title")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {Object.entries(filteredRfidsMapData).map(([epc, data]) => (
              <div
                key={epc}
                className="border rounded-lg p-4 bg-muted/50 space-y-3"
              >
                <div className="space-y-2">
                  <div className="font-medium text-sm">{data.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {data.epc}
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="outline">
                      {data.category === "SINGLE"
                        ? t("rfidCategory.single")
                        : t("rfidCategory.package")}
                    </Badge>
                    <Badge variant="secondary">
                      {data.type === "REUSABLE"
                        ? t("rfidType.reusable")
                        : t("rfidType.disposable")}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-medium text-foreground">
                    Items ({data.items?.length || 0}):
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {data.items?.map((item, index) => (
                      <div
                        key={`${epc}-${index}`}
                        className="flex items-center gap-2 text-xs p-2 bg-background rounded border"
                      >
                        <div className="flex-1">
                          <div className="font-medium">
                            {item.sku?.name || "-"}
                          </div>
                          {item.sku?.internal_code && (
                            <div className="text-muted-foreground">
                              {item.sku.internal_code}
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

// Backward compatibility export
export const RfidsMapStockMovementsDisplay = SelectedRfidsDisplay;
