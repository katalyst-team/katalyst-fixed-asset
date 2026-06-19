import { Keyboard, Plus, Trash2 } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCallback, useState } from "react";
import { toast } from "sonner";

import { InputWithLabel } from "@/components/shared/InputWithLabel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toastError } from "@/services";
import { RfidItemType } from "@/types/rfid";

interface EpcBypassInputSectionProps {
  onEpcsChecked: (
    unregisteredEpcs: string[],
    epcNames: Record<string, string>
  ) => void;
  onReset: () => void;
  getRfidsData: () => Promise<{
    data?: {
      data?: {
        rfids?: RfidItemType[] | null;
      };
    };
  }>;
}

const EpcBypassInputSection = ({
  getRfidsData,
  onEpcsChecked,
  onReset,
}: EpcBypassInputSectionProps) => {
  const { t } = useTranslation(["epc"]);

  // Manual EPC input state
  const [manualEpcInputs, setManualEpcInputs] = useState<string[]>([""]);
  const [isCheckingManualEpcs, setIsCheckingManualEpcs] = useState(false);

  // Manual EPC input handlers
  const addManualEpcInput = useCallback(() => {
    setManualEpcInputs((prev) => [...prev, ""]);
  }, []);

  const removeManualEpcInput = useCallback((index: number) => {
    setManualEpcInputs((prev) => {
      if (prev.length === 1) return [""]; // Always keep at least one input
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const updateManualEpcInput = useCallback((index: number, value: string) => {
    setManualEpcInputs((prev) => {
      const newInputs = [...prev];
      newInputs[index] = value;
      return newInputs;
    });
  }, []);

  const checkManualEpcs = useCallback(async () => {
    // Filter out empty inputs and get unique EPCs
    const epcsToCheck = [
      ...new Set(
        manualEpcInputs.map((epc) => epc.trim()).filter((epc) => epc.length > 0)
      ),
    ];

    if (epcsToCheck.length === 0) {
      toast.error(t("bypass.noEpcsEntered"));
      return;
    }

    setIsCheckingManualEpcs(true);
    try {
      const rfidResult = await getRfidsData();
      if (rfidResult.data?.data?.rfids) {
        // Get EPCs that are found in the response (registered)
        const registeredEpcs = new Set(
          rfidResult.data.data.rfids.map((rfid) => rfid.epc)
        );

        // Find unregistered EPCs (entered but not in response)
        const unregistered = epcsToCheck.filter(
          (epc) => !registeredEpcs.has(epc)
        );

        // Initialize names for unregistered EPCs
        const initialNames: Record<string, string> = {};
        unregistered.forEach((epc) => {
          initialNames[epc] = "";
        });

        onEpcsChecked(unregistered, initialNames);

        if (unregistered.length === 0) {
          toast.info(t("scan.allRegistered"));
        } else {
          toast.success(
            t("scan.foundUnregistered", { count: unregistered.length })
          );
        }
      }
    } catch (error) {
      toastError(error as Error);
    } finally {
      setIsCheckingManualEpcs(false);
    }
  }, [manualEpcInputs, getRfidsData, t, onEpcsChecked]);

  const resetManualInput = useCallback(() => {
    setManualEpcInputs([""]);
    onReset();
  }, [onReset]);

  const hasAnyInput = manualEpcInputs.some((epc) => epc.trim());

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

      {/* Manual EPC Input Fields */}
      <div className="space-y-2">
        <Label>{t("bypass.epcCodes")}</Label>
        <div className="max-h-40 space-y-2 overflow-y-auto">
          {manualEpcInputs.map((epc, index) => (
            <div key={index} className="flex items-center gap-2">
              <InputWithLabel
                className="flex-1"
                placeholder={t("bypass.epcPlaceholder")}
                value={epc}
                onChange={(e) => updateManualEpcInput(index, e.target.value)}
              />
              {manualEpcInputs.length > 1 && (
                <Button
                  className="h-9 w-9 flex-shrink-0"
                  size="icon"
                  variant="ghost"
                  onClick={() => removeManualEpcInput(index)}
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
          onClick={addManualEpcInput}
        >
          <Plus className="mr-2 h-4 w-4" />
          {t("bypass.addMore")}
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          className="flex-1"
          disabled={isCheckingManualEpcs || !hasAnyInput}
          onClick={checkManualEpcs}
        >
          {isCheckingManualEpcs ? t("bypass.checking") : t("bypass.checkEpcs")}
        </Button>

        {hasAnyInput && (
          <Button
            disabled={isCheckingManualEpcs}
            variant="outline"
            onClick={resetManualInput}
          >
            {t("scan.reset")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default EpcBypassInputSection;
