"use client";

import { Printer, Upload } from "lucide-react";
import Image from "next/image";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import ZplTemplatePicker from "@/components/shared/ZplTemplatePicker";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useUser } from "@/context/user-context";
import {
  useGetAssetRegisterQuery,
  usePrintRFIDTagsMutation,
} from "@/hooks/api/fixed-assets";
import { useFaTagPrint } from "@/hooks/useFaTagPrint";
import { useZplTemplateSave } from "@/hooks/useZplTemplateSave";
import { useFaModal } from "@/modules/dashboard/fixed-assets/modals/FaModalContext";
import type { FaRfidTag } from "@/types/fixed-assets";
import type {
  ZplTemplateFieldMapping,
  ZplTemplateType,
} from "@/types/zplTemplate";
import { type RfidTuning, sanitizeZpl } from "@/utils/zpl";

import {
  escapeRegExp,
  extractZplFields,
  FIELD_OPTIONS,
  resolveTagValues,
  SAMPLE_TAG,
} from "./printTagFields";
import { PreviewSettingsGrid, PrintTuningGrid } from "./printTagSettings";

interface PrintTagModalProps {
  onClose: () => void;
  open: boolean;
}

export function PrintTagModal({ onClose, open }: PrintTagModalProps) {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";
  const { payload } = useFaModal();
  const tags: FaRfidTag[] = payload.tags ?? [];

  const print = useFaTagPrint();
  const {
    generatePreview,
    initializeQZ,
    printRaw,
    settings,
    setPreviewSettings,
    setPrintCount,
    setPrinterSelection,
    setRawZplCode,
  } = print;

  const [templateName, setTemplateName] = useState("");
  const [rfidTuning, setRfidTuning] = useState<RfidTuning>({
    encodePosition: "",
    rfPower: "",
  });
  const [jobDelayMs, setJobDelayMs] = useState(0);
  const [fieldMappings, setFieldMappings] = useState<
    Record<string, ZplTemplateFieldMapping[]>
  >({});
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(
    null
  );
  const zplFileInputRef = useRef<HTMLInputElement>(null);

  const { data: assetsResp } = useGetAssetRegisterQuery({
    limit: 200,
    organizationId,
  });
  const assetById = useMemo(
    () => new Map((assetsResp?.data ?? []).map((a) => [a.id, a])),
    [assetsResp]
  );

  const mappings = useMemo(
    () => fieldMappings["default"] ?? [],
    [fieldMappings]
  );

  const { isSaving: isSavingTemplate, saveZplTemplate } = useZplTemplateSave({
    content: settings.rawZplCode,
    defaultName: "Asset label",
    fieldMappings,
    name: templateName,
    organizationId,
    tuning: {
      ...rfidTuning,
      jobDelayMs,
      previewSettings: settings.previewSettings,
      printCount: settings.printCount,
      printer: settings.selectedPrinter,
    },
  });

  const { isPending: isMarkingPrinted, mutateAsync: markPrinted } =
    usePrintRFIDTagsMutation({ organizationId });

  const buildZplForTag = useCallback(
    (tag: FaRfidTag): string => {
      let zpl = sanitizeZpl(settings.rawZplCode, rfidTuning);
      const values = resolveTagValues(tag, assetById);
      zpl = zpl.replace(/\{epc\}|\[epc\]/g, tag.epc);
      zpl = zpl.replace(/\{name\}|\[name\]/g, values["asset.name"]);
      for (const field of mappings) {
        if (field.mapping) {
          zpl = zpl.replace(
            new RegExp(escapeRegExp(`[${field.id}]`), "g"),
            values[field.mapping] ?? ""
          );
        }
      }
      return zpl;
    },
    [assetById, mappings, rfidTuning, settings.rawZplCode]
  );

  const placeholders = useMemo(
    () => extractZplFields(settings.rawZplCode),
    [settings.rawZplCode]
  );

  const handleFieldMapping = (fieldId: string, mapping: string) => {
    setFieldMappings((prev) => {
      const current = prev["default"] ?? [];
      const exists = current.some((f) => f.id === fieldId);
      const next = exists
        ? current.map((f) => (f.id === fieldId ? { ...f, mapping } : f))
        : [...current, { id: fieldId, mapping }];
      return { ...prev, default: next };
    });
  };

  const currentMapping = (fieldId: string): string =>
    mappings.find((f) => f.id === fieldId)?.mapping ?? "";

  const handleApplyZplTemplate = useCallback(
    (template: ZplTemplateType) => {
      setRawZplCode(template.content);
      setFieldMappings({ default: template.field_mappings?.["default"] ?? [] });
      setRfidTuning({
        encodePosition: template.tuning?.encodePosition ?? "",
        rfPower: template.tuning?.rfPower ?? "",
      });
      setJobDelayMs(template.tuning?.jobDelayMs ?? 0);
      if (template.tuning?.printCount) setPrintCount(template.tuning.printCount);
      if (template.tuning?.previewSettings) {
        setPreviewSettings(template.tuning.previewSettings);
      }
      // Templates are shared across devices, so the saved printer may not
      // exist on this one. Apply it unvalidated only while the printer list
      // is still empty (QZ not connected yet).
      const savedPrinter = template.tuning?.printer;
      if (
        savedPrinter &&
        (settings.availablePrinters.length === 0 ||
          settings.availablePrinters.includes(savedPrinter))
      ) {
        setPrinterSelection(savedPrinter);
      }
    },
    [
      setPrintCount,
      setPreviewSettings,
      setPrinterSelection,
      setRawZplCode,
      settings.availablePrinters,
    ]
  );

  const handleZplFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      setRawZplCode(text);
    } catch {
      toast.error("Failed to read ZPL file");
    } finally {
      e.target.value = "";
    }
  };

  const handlePreview = async () => {
    await generatePreview(buildZplForTag(tags[0] ?? SAMPLE_TAG));
  };

  const handlePrint = async () => {
    if (!settings.rawZplCode.trim()) {
      toast.error("Please enter or load a ZPL template first");
      return;
    }
    if (tags.length === 0) {
      toast.info("No tags to print");
      return;
    }
    let connected = settings.qzStatus === "connected";
    if (!connected) connected = await initializeQZ();
    if (!connected) return;

    const jobs: string[] = [];
    for (const tag of tags) {
      for (let copy = 0; copy < settings.printCount; copy += 1) {
        jobs.push(buildZplForTag(tag));
      }
    }

    setProgress({ current: 0, total: jobs.length });
    let printed = 0;
    for (let i = 0; i < jobs.length; i += 1) {
      const success = await printRaw(jobs[i]);
      if (!success) break;
      printed += 1;
      setProgress({ current: printed, total: jobs.length });
      if (jobDelayMs > 0 && i < jobs.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, jobDelayMs));
      }
    }
    setProgress(null);

    if (printed === 0) return;
    await markPrinted({ tag_ids: tags.map((t) => t.id) });
    await saveZplTemplate();
    toast.success(`Printed ${printed} label(s)`);
    onClose();
  };

  const handleMarkPrinted = async () => {
    if (tags.length === 0) {
      toast.info("No tags to mark");
      return;
    }
    await markPrinted({ tag_ids: tags.map((t) => t.id) });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer size={16} />
            Print RFID labels
          </DialogTitle>
          <DialogDescription>
            {tags.length > 0
              ? `${tags.length} tag(s) queued · ZPL templates are saved per organization and reused across devices.`
              : "No tags in the print queue. Queue tags from the register first."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <ZplTemplatePicker
            isEmpty={!settings.rawZplCode}
            isSaving={isSavingTemplate}
            name={templateName}
            organizationId={organizationId}
            onApply={handleApplyZplTemplate}
            onNameChange={setTemplateName}
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>ZPL code</Label>
              <input
                ref={zplFileInputRef}
                accept=".zpl,.txt,text/plain"
                className="hidden"
                type="file"
                onChange={handleZplFileUpload}
              />
              <Button
                size="sm"
                type="button"
                variant="outline"
                onClick={() => zplFileInputRef.current?.click()}
              >
                <Upload className="h-4 w-4" />
                Upload ZPL file
              </Button>
            </div>
            <Textarea
              className="min-h-[140px] font-mono text-xs"
              placeholder={
                "^XA\n^FO50,50\n^ADN,36,20\n^FD{epc}^FS\n^FO50,100\n^ADN,24,12\n^FD{name}^FS\n^FO50,150\n^BCN,60,Y,N,N\n^FD[asset_code]^FS\n^XZ"
              }
              value={settings.rawZplCode}
              onChange={(e) => {
                setRawZplCode(e.target.value);
              }}
            />
          </div>

          {placeholders.length > 0 && (
            <div className="space-y-2">
              <Label>Field mapping</Label>
              {placeholders.map((fieldId) => (
                <div
                  key={fieldId}
                  className="grid items-center gap-2 sm:grid-cols-2"
                >
                  <code className="text-xs">[{fieldId}]</code>
                  <Select
                    value={currentMapping(fieldId)}
                    onValueChange={(v) => {
                      handleFieldMapping(fieldId, v);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Map to asset field…" />
                    </SelectTrigger>
                    <SelectContent>
                      {FIELD_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          )}

          <PreviewSettingsGrid
            previewSettings={settings.previewSettings}
            onPreviewSettingsChange={setPreviewSettings}
          />

          <div className="flex items-center gap-3">
            <Button
              disabled={settings.isLoadingPreview}
              type="button"
              variant="outline"
              onClick={handlePreview}
            >
              {settings.isLoadingPreview ? "Generating…" : "Generate preview"}
            </Button>
            {settings.previewImage && (
              <Image
                unoptimized
                alt="Label preview"
                className="max-h-24 rounded border border-border"
                height={96}
                src={settings.previewImage}
                width={160}
              />
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Printer</Label>
              <div className="flex gap-2">
                <Select
                  disabled={settings.availablePrinters.length === 0}
                  value={settings.selectedPrinter}
                  onValueChange={setPrinterSelection}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue
                      placeholder={
                        settings.availablePrinters.length === 0
                          ? "Connect QZ Tray first"
                          : "Select printer"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.availablePrinters.map((printer) => (
                      <SelectItem key={printer} value={printer}>
                        {printer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (settings.qzStatus === "connected") {
                      void print.disconnectQZ();
                    } else {
                      void initializeQZ();
                    }
                  }}
                >
                  {settings.qzStatus === "connected" ? "Disconnect" : "Connect"}
                </Button>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Copies per tag</Label>
              <Input
                max={10}
                min={1}
                type="number"
                value={settings.printCount}
                onChange={(e) => {
                  setPrintCount(Number(e.target.value) || 1);
                }}
              />
            </div>
          </div>

          <PrintTuningGrid
            jobDelayMs={jobDelayMs}
            rfidTuning={rfidTuning}
            onJobDelayMsChange={setJobDelayMs}
            onRfidTuningChange={setRfidTuning}
          />

          {progress && (
            <div className="text-xs text-muted-foreground">
              Printing… {progress.current}/{progress.total}
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            className="ks-btn ks-btn-ghost"
            disabled={isMarkingPrinted}
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="ks-btn ks-btn-ghost"
            disabled={isMarkingPrinted || tags.length === 0}
            type="button"
            onClick={handleMarkPrinted}
          >
            Mark printed
          </button>
          <button
            className="ks-btn ks-btn-primary"
            disabled={
              progress !== null ||
              isMarkingPrinted ||
              tags.length === 0 ||
              !settings.rawZplCode.trim()
            }
            type="button"
            onClick={handlePrint}
          >
            {progress ? "Printing…" : "Print labels"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
