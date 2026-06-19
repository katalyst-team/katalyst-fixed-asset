import { Keyboard, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import useGetRfidDataQuery from "@/hooks/api/rfid/useGetRfidDataQuery";
import { toastError } from "@/services";
import { RfidItemType } from "@/types/rfid";

interface EpcScanFindBypassSectionProps {
  organizationId: string;
  onResult: (found: RfidItemType[], notFound: string[]) => void;
  onReset: () => void;
}

const EpcScanFindBypassSection = ({
  onResult,
  onReset,
  organizationId,
}: EpcScanFindBypassSectionProps) => {
  const { t } = useTranslation(["epc"]);

  const [manualEpcInputs, setManualEpcInputs] = useState<string[]>([""]);
  const [isChecking, setIsChecking] = useState(false);

  const epcsToQuery = manualEpcInputs
    .map((e) => e.trim())
    .filter((e) => e.length > 0);

  const { refetch: getRfidsData } = useGetRfidDataQuery({
    enabled: false,
    filters: { epcs: epcsToQuery.length > 0 ? epcsToQuery : undefined },
    organizationId,
  });

  const addInput = useCallback(() => {
    setManualEpcInputs((prev) => [...prev, ""]);
  }, []);

  const removeInput = useCallback((index: number) => {
    setManualEpcInputs((prev) => {
      if (prev.length === 1) return [""];
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updateInput = useCallback((index: number, value: string) => {
    setManualEpcInputs((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }, []);

  const handleCheck = useCallback(async () => {
    const unique = [...new Set(epcsToQuery)];
    if (unique.length === 0) {
      toast.error(t("bypass.noEpcsEntered"));
      return;
    }

    setIsChecking(true);
    try {
      const result = await getRfidsData();
      const found = result.data?.data?.rfids ?? [];
      const foundEpcSet = new Set(found.map((r) => r.epc));
      const notFound = unique.filter((epc) => !foundEpcSet.has(epc));
      onResult(found, notFound);

      if (found.length === 0) {
        toast.info(t("scanFind.noneFound"));
      } else {
        toast.success(t("scanFind.found", { count: found.length }));
      }
    } catch (error) {
      toastError(error as Error);
    } finally {
      setIsChecking(false);
    }
  }, [epcsToQuery, getRfidsData, onResult, t]);

  const handleReset = useCallback(() => {
    setManualEpcInputs([""]);
    onReset();
  }, [onReset]);

  const hasAnyInput = manualEpcInputs.some((e) => e.trim());

  return (
    <div className="space-y-4 border-b pb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Keyboard className="h-4 w-4 text-muted-foreground" />
          <Label>{t("bypass.manualInput")}</Label>
        </div>
        <Badge variant="secondary">{t("bypass.modeEnabled")}</Badge>
      </div>

      <p className="text-sm text-muted-foreground">{t("bypass.description")}</p>

      <div className="space-y-2">
        <Label>{t("bypass.epcCodes")}</Label>
        <div className="max-h-40 space-y-2 overflow-y-auto">
          {manualEpcInputs.map((epc, index) => (
            <div key={index} className="flex items-center gap-2">
              <InputWithLabel
                className="flex-1"
                placeholder={t("bypass.epcPlaceholder")}
                value={epc}
                onChange={(e) => updateInput(index, e.target.value)}
              />
              {manualEpcInputs.length > 1 && (
                <Button
                  className="h-9 w-9 flex-shrink-0"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeInput(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          ))}
        </div>
        <Button
          className="w-full"
          size="sm"
          variant="outline"
          onClick={addInput}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("bypass.addMore")}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={isChecking || !hasAnyInput}
          onClick={handleCheck}
        >
          {isChecking ? t("bypass.checking") : t("scanFind.searchButton")}
        </Button>
        {hasAnyInput && (
          <Button disabled={isChecking} variant="outline" onClick={handleReset}>
            {t("scan.reset")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EpcScanFindBypassSection;
