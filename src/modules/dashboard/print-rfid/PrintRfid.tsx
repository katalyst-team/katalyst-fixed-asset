/* eslint-disable max-lines */
"use client";

import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "next-i18next";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
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
import useCreateRfidDataMutation from "@/hooks/api/rfid/useCreateRfidDataMutation";
import useGetStoreDataQuery from "@/hooks/api/store/useGetStoreDataQuery";
import { useBypassHardware } from "@/hooks/useBypassHardware";
import usePrintV5 from "@/hooks/usePrintV5";
import { useQZSigning } from "@/hooks/useQZSigning";
import { RfidCategory, RfidStatus, RfidType } from "@/types/rfid";
import {
    generateRfidNames,
    getPatternPreview,
    parseRfidPattern,
    validatePatternCapacity,
} from "@/utils/rfidNameGenerator";

type NamingMode = "system" | "custom";

// Utility: Convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return [...new Uint8Array(buffer)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Generate deterministic hash (SHA-256) of string
async function hashToHex(input: string, length: number): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return bufferToHex(hash).slice(0, length);
}

// Generate standalone EPC without requiring ledger item
async function generateStandaloneEPC(index: number): Promise<string> {
  const companyPrefix = "3"; // 1 hex digit
  const timestamp = Date.now().toString(16).slice(-6).padStart(6, "0"); // 6 hex digit

  // Use timestamp + index + random value for uniqueness
  const uniqueId = `${Date.now()}-${index}-${Math.random()}`;
  const hash = await hashToHex(uniqueId, 17); // 17 hex digits

  const epc = `${companyPrefix}${timestamp}${hash}`; // 24 hex digits total

  return epc.toUpperCase();
}

const PrintRfid = () => {
  const { t } = useTranslation("print-rfid");
  const router = useRouter();
  const { tokenPayload } = useUser();
  const zplFileInputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Form state
  const [quantity, setQuantity] = useState<number>(1);
  const [rfidType, setRfidType] = useState<RfidType>(RfidType.DISPOSABLE);
  const [rfidCategory, setRfidCategory] = useState<RfidCategory>(
    RfidCategory.SINGLE
  );
  const [namingMode, setNamingMode] = useState<NamingMode>("system");
  const [customPattern, setCustomPattern] = useState<string>("");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("all");
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize QZ Signing hook
  const signing = useQZSigning();

  // Bypass hardware mode
  const { isBypassEnabled } = useBypassHardware();

  // Initialize printing hook
  const {
    settings,
    logs,
    clearLogs,
    handleRawZplPreview,
    initializeQZ,
    disconnectQZ,
    loadPrinters,
    setPrinterSelection,
    setPrintCount,
    setRawZplCode,
    setPreviewSettings,
    clearPreviewImage,
    handleUnitChange,
    updateRawZplFields,
    handleZplFileUpload,
  } = usePrintV5();

  // RFID creation mutation
  const { mutateAsync: createRfidDataAsync } = useCreateRfidDataMutation({
    organizationId: tokenPayload?.organization_id ?? "",
  });

  // Store list for store_id selection
  const { data: storeData } = useGetStoreDataQuery({
    organizationId: tokenPayload?.organization_id ?? "",
  });
  const stores = storeData?.data?.stores ?? [];

  // Initialize signing when component mounts
  useEffect(() => {
    signing.initializeSigning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signing.initializeSigning]);

  // Cleanup preview image on unmount
  useEffect(() => {
    return () => {
      clearPreviewImage();
    };
  }, [clearPreviewImage]);

  // Auto-scroll terminal to bottom when new logs appear
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs]);

  // Validate custom pattern
  const patternValidation = useMemo(() => {
    if (namingMode !== "custom" || !customPattern) {
      return { isValid: true, message: "" };
    }

    const isValidPattern = parseRfidPattern(customPattern) !== null;

    if (!isValidPattern) {
      return {
        isValid: false,
        message: t("form.customPattern.invalidFormat"),
      };
    }

    const hasCapacity = validatePatternCapacity(customPattern, quantity);

    if (!hasCapacity) {
      return {
        isValid: false,
        message: t("form.customPattern.insufficientCapacity"),
      };
    }

    return { isValid: true, message: "" };
  }, [namingMode, customPattern, quantity, t]);

  // Pattern preview
  const patternPreview = useMemo(() => {
    if (namingMode !== "custom" || !customPattern || !patternValidation.isValid)
      return null;

    return getPatternPreview(customPattern, quantity);
  }, [namingMode, customPattern, quantity, patternValidation.isValid]);

  // Get connection status color and text
  const getConnectionStatus = useCallback(() => {
    // Check for signing errors first
    if (signing.signingError) {
      return {
        color: "text-red-600",
        text: `Signing Error: ${signing.signingError}`,
      };
    }

    switch (settings.qzStatus) {
      case "connected":
        const signingStatus = signing.isSigningInitialized
          ? signing.certificateLoaded
            ? " (Silent Print Ready)"
            : " (Signing Active)"
          : "";
        return { color: "text-green-600", text: `Connected${signingStatus}` };
      case "connecting":
        return { color: "text-yellow-600", text: "Connecting..." };
      case "error":
        return { color: "text-red-600", text: "Connection Error" };
      default:
        const initStatus = signing.isSigningInitialized
          ? " (Signing Ready)"
          : "";
        return { color: "text-muted-foreground", text: `Disconnected${initStatus}` };
    }
  }, [
    settings.qzStatus,
    signing.isSigningInitialized,
    signing.certificateLoaded,
    signing.signingError,
  ]);

  const connectionStatus = getConnectionStatus();

  // Generate RFID names based on mode
  const generateRfidNamesForCreation = useCallback((): string[] => {
    if (namingMode === "system") {
      // System mode: names will be same as EPCs (generated later)
      return [];
    } else {
      // Custom mode: generate names from pattern
      const names = generateRfidNames(customPattern, quantity);
      return names || [];
    }
  }, [namingMode, customPattern, quantity]);

  // Reset form to initial state
  const resetForm = useCallback(() => {
    setQuantity(1);
    setRfidType(RfidType.DISPOSABLE);
    setRfidCategory(RfidCategory.SINGLE);
    setNamingMode("system");
    setCustomPattern("");
    setSelectedStoreId("all");
    setRawZplCode("");
    clearPreviewImage();
    clearLogs();
  }, [setRawZplCode, clearPreviewImage, clearLogs]);

  // Main print and create workflow
  const handlePrintAndCreate = useCallback(async () => {
    try {
      setIsProcessing(true);

      // Validate printer connection (skip if bypass mode)
      if (!isBypassEnabled) {
        if (settings.qzStatus !== "connected") {
          toast.error(t("errors.printerNotConnected"));
          return;
        }

        if (!settings.selectedPrinter) {
          toast.error(t("errors.noPrinterSelected"));
          return;
        }

        if (!settings.rawZplCode.trim()) {
          toast.error(t("errors.noZplCode"));
          return;
        }
      }

      // Validate custom pattern if in custom mode
      if (namingMode === "custom" && !patternValidation.isValid) {
        toast.error(patternValidation.message);
        return;
      }

      // Generate EPCs
      const epcs: string[] = [];
      for (let i = 0; i < quantity; i++) {
        const epc = await generateStandaloneEPC(i);
        epcs.push(epc);
      }

      // Generate names
      let names: string[];
      if (namingMode === "system") {
        // System mode: names = EPCs
        names = epcs;
      } else {
        // Custom mode: use pattern
        const generatedNames = generateRfidNamesForCreation();
        if (!generatedNames || generatedNames.length !== quantity) {
          toast.error(t("errors.nameGenerationFailed"));
          return;
        }
        names = generatedNames;
      }

      // Print labels via QZ Tray (skip if bypass mode)
      if (!isBypassEnabled) {
        toast.info(t("progress.printing", { count: quantity }));

        for (let i = 0; i < quantity; i++) {
          const epc = epcs[i];
          const name = names[i];

          // Replace placeholders in ZPL
          let processedZpl = settings.rawZplCode;
          processedZpl = processedZpl.replace(/\{epc\}/g, epc);
          processedZpl = processedZpl.replace(/\[epc\]/g, epc);
          processedZpl = processedZpl.replace(/\{name\}/g, name);
          processedZpl = processedZpl.replace(/\[name\]/g, name);

          // Print using QZ Tray
          if (window.qz && settings.selectedPrinter) {
            const config = window.qz.configs.create(settings.selectedPrinter);

            for (let copy = 0; copy < settings.printCount; copy++) {
              await window.qz.print(config, [processedZpl]);
            }
          }
        }

        toast.success(t("progress.printingComplete"));
      } else {
        toast.info(t("progress.bypassMode", "Bypass mode: Skipping print, creating RFIDs only"));
      }

      // Create RFIDs in database
      toast.info(t("progress.creatingRfids", { count: quantity }));

      const rfidsToCreate = epcs.map((epc, index) => ({
        category: rfidCategory,
        epc,
        name: names[index],
        status: RfidStatus.ACTIVE,
        type: rfidType,
        ...(selectedStoreId !== "all" && { store_id: selectedStoreId }),
      }));

      // Use .catch() to prevent the AxiosError from reaching Next.js dev
      // overlay. The mutation's onError already handles the toast via toastError.
      let rfidCreateFailed = false;
      await createRfidDataAsync({ rfids: rfidsToCreate }).catch(() => {
        rfidCreateFailed = true;
      });

      if (rfidCreateFailed) return;

      toast.success(t("success.created", { count: quantity }), {
        action: {
          label: t("success.viewRfids"),
          onClick: () => router.push("/dashboard/epc"),
        },
        duration: 5000,
      });

      // Reset form
      resetForm();
    } catch (error) {
      // Non-API errors (e.g. QZ Tray failures, runtime errors)
      toast.error(
        error instanceof Error ? error.message : t("errors.unknownError")
      );
    } finally {
      setIsProcessing(false);
    }
  }, [
    settings,
    quantity,
    rfidType,
    rfidCategory,
    namingMode,
    selectedStoreId,
    patternValidation,
    generateRfidNamesForCreation,
    createRfidDataAsync,
    resetForm,
    router,
    t,
    isBypassEnabled,
  ]);

  // Check if form is ready to submit
  const canSubmit = useMemo(() => {
    if (isProcessing) return false;
    
    // Bypass mode: only require quantity validation
    if (isBypassEnabled) {
      if (quantity < 1) return false;
      if (namingMode === "custom" && !patternValidation.isValid) return false;
      return true;
    }
    
    // Normal mode: require printer connection
    if (settings.qzStatus !== "connected") return false;
    if (!settings.selectedPrinter) return false;
    if (!settings.rawZplCode.trim()) return false;
    if (quantity < 1) return false;
    if (namingMode === "custom" && !patternValidation.isValid) return false;

    return true;
  }, [
    isProcessing,
    isBypassEnabled,
    settings.qzStatus,
    settings.selectedPrinter,
    settings.rawZplCode,
    quantity,
    namingMode,
    patternValidation.isValid,
  ]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">{t("description")}</p>
      </div>

      {/* Bypass Mode Indicator */}
      {isBypassEnabled && (
        <div className="bg-muted border border-border rounded-md p-4">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-lg">⚠️</span>
            <div>
              <p className="font-medium text-foreground">
                {t("bypassMode.title", "Bypass Hardware Mode Enabled")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t("bypassMode.description", "Printing will be skipped. RFIDs will be created in the database only.")}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* QZ Tray Connection Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{t("qzTray.title")}</CardTitle>
              <CardDescription>
                <span className={`${connectionStatus.color} font-medium`}>
                  {connectionStatus.text}
                </span>
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                disabled={
                  settings.qzStatus === "connecting" ||
                  settings.qzStatus === "connected"
                }
                size="sm"
                variant="outline"
                onClick={initializeQZ}
              >
                {t("qzTray.connect")}
              </Button>
              <Button
                disabled={
                  settings.qzStatus === "disconnected" ||
                  settings.qzStatus === "connecting"
                }
                size="sm"
                variant="outline"
                onClick={disconnectQZ}
              >
                {t("qzTray.disconnect")}
              </Button>
              <Button
                disabled={settings.qzStatus !== "connected"}
                size="sm"
                variant="outline"
                onClick={loadPrinters}
              >
                {t("qzTray.refreshPrinters")}
              </Button>
              <Button
                disabled={signing.isSigningInitialized}
                size="sm"
                variant="outline"
                onClick={() => signing.initializeSigning()}
              >
                {t("qzTray.initSigning")}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => signing.testConnection()}
              >
                {t("qzTray.test")}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Signing Status */}
          {(signing.isSigningInitialized || signing.signingError) && (
            <div className="text-sm space-y-1 p-3 bg-muted rounded-md">
              <div className="flex items-center gap-2">
                <span className="font-medium">{t("qzTray.messageSigning")}:</span>
                <span
                  className={
                    signing.isSigningInitialized
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {signing.isSigningInitialized
                    ? t("qzTray.active")
                    : t("qzTray.failed")}
                </span>
              </div>
              {signing.certificateLoaded && (
                <div className="text-green-600 text-xs">
                  ✓ {t("qzTray.certificateLoaded")}
                </div>
              )}
              {signing.signingError && (
                <div className="text-red-600 text-xs bg-red-50 p-2 rounded">
                  {signing.signingError}
                </div>
              )}
            </div>
          )}

          {/* Printer Selection */}
          {settings.qzStatus === "connected" && (
            <>
              <div className="space-y-2">
                <Label isRequired>{t("qzTray.selectPrinter")}</Label>
                <Select
                  value={settings.selectedPrinter}
                  onValueChange={setPrinterSelection}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("qzTray.choosePrinter")} />
                  </SelectTrigger>
                  <SelectContent>
                    {settings.availablePrinters.map((printer) => (
                      <SelectItem key={printer} value={printer}>
                        {printer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Print Count */}
              {settings.selectedPrinter && (
                <div className="space-y-2">
                  <Label>{t("qzTray.printCopies")}</Label>
                  <Input
                    className="w-32"
                    max="10"
                    min="1"
                    type="number"
                    value={settings.printCount}
                    onChange={(e) => setPrintCount(parseInt(e.target.value) || 1)}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* RFID Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("form.title")}</CardTitle>
          <CardDescription>{t("form.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Quantity */}
            <div className="space-y-2">
              <Label isRequired>{t("form.quantity.label")}</Label>
              <Input
                min="1"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>

            {/* RFID Type */}
            <div className="space-y-2">
              <Label isRequired>{t("form.type.label")}</Label>
              <Select
                value={rfidType}
                onValueChange={(value: RfidType) => setRfidType(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RfidType.REUSABLE}>
                    {t("form.type.reusable")}
                  </SelectItem>
                  <SelectItem value={RfidType.DISPOSABLE}>
                    {t("form.type.disposable")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* RFID Category */}
            <div className="space-y-2">
              <Label isRequired>{t("form.category.label")}</Label>
              <Select
                value={rfidCategory}
                onValueChange={(value: RfidCategory) => setRfidCategory(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={RfidCategory.SINGLE}>
                    {t("form.category.single")}
                  </SelectItem>
                  <SelectItem value={RfidCategory.PACKAGE}>
                    {t("form.category.package")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Naming Mode */}
            <div className="space-y-2">
              <Label isRequired>{t("form.namingMode.label")}</Label>
              <Select
                value={namingMode}
                onValueChange={(value: NamingMode) => setNamingMode(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="system">
                    {t("form.namingMode.system")}
                  </SelectItem>
                  <SelectItem value="custom">
                    {t("form.namingMode.custom")}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Store */}
            <div className="space-y-2">
              <Label>{t("form.store.label")}</Label>
              <Select
                value={selectedStoreId}
                onValueChange={setSelectedStoreId}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {t("form.store.allStores")}
                  </SelectItem>
                  {stores.map((store) => (
                    <SelectItem key={store.id} value={store.id}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">
                {t("form.store.hint")}
              </p>
            </div>
          </div>

          {/* Custom Pattern Input */}
          {namingMode === "custom" && (
            <div className="space-y-2">
              <Label isRequired>{t("form.customPattern.label")}</Label>
              <Input
                placeholder={t("form.customPattern.placeholder")}
                value={customPattern}
                onChange={(e) => setCustomPattern(e.target.value)}
              />
              <p className="text-sm text-muted-foreground">
                {t("form.customPattern.hint")}
              </p>

              {/* Pattern Validation */}
              {customPattern && !patternValidation.isValid && (
                <p className="text-sm text-red-600">
                  {patternValidation.message}
                </p>
              )}

              {/* Pattern Preview */}
              {patternPreview && (
                <div className="bg-muted p-3 rounded-md text-sm">
                  <p className="font-medium mb-1">
                    {t("form.customPattern.preview")}:
                  </p>
                  <p>
                    {patternPreview.first} → {patternPreview.last}
                  </p>
                </div>
              )}
            </div>
          )}

          {namingMode === "system" && (
            <div className="bg-muted p-3 rounded-md text-sm text-muted-foreground">
              ℹ️ {t("form.namingMode.systemHint")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ZPL Code Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t("zpl.title")}</CardTitle>
          <CardDescription>{t("zpl.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Preview Settings */}
            <div className="space-y-4">
              <h4 className="font-medium">{t("zpl.preview.title")}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("zpl.preview.density")}</Label>
                  <Select
                    value={settings.previewSettings.dpmm}
                    onValueChange={(value) => setPreviewSettings({ dpmm: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="6dpmm">6 dpmm</SelectItem>
                      <SelectItem value="8dpmm">8 dpmm</SelectItem>
                      <SelectItem value="12dpmm">12 dpmm</SelectItem>
                      <SelectItem value="24dpmm">24 dpmm</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t("zpl.preview.unit")}</Label>
                  <Select
                    value={settings.previewSettings.unit}
                    onValueChange={(value: "mm" | "inch") =>
                      handleUnitChange(value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mm">mm</SelectItem>
                      <SelectItem value="inch">inch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("zpl.preview.width")} ({settings.previewSettings.unit})
                  </Label>
                  <Input
                    min="0.1"
                    step="0.1"
                    type="number"
                    value={settings.previewSettings.width}
                    onChange={(e) => setPreviewSettings({ width: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>
                    {t("zpl.preview.height")} ({settings.previewSettings.unit})
                  </Label>
                  <Input
                    min="0.1"
                    step="0.1"
                    type="number"
                    value={settings.previewSettings.height}
                    onChange={(e) =>
                      setPreviewSettings({ height: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t("zpl.preview.index")}</Label>
                  <Input
                    min="0"
                    type="number"
                    value={settings.previewSettings.index}
                    onChange={(e) => setPreviewSettings({ index: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={
                    settings.isLoadingPreview || !settings.rawZplCode.trim()
                  }
                  variant="outline"
                  onClick={handleRawZplPreview}
                >
                  {settings.isLoadingPreview
                    ? t("zpl.preview.generating")
                    : t("zpl.preview.generate")}
                </Button>
                {settings.previewImage && (
                  <Button variant="outline" onClick={clearPreviewImage}>
                    {t("zpl.preview.clear")}
                  </Button>
                )}
              </div>
            </div>

            {/* Preview Image */}
            <div className="space-y-2">
              <h4 className="font-medium">{t("zpl.preview.previewImage")}</h4>
              <div className="border rounded-md p-4 bg-muted flex justify-center items-center min-h-[300px]">
                {settings.isLoadingPreview ? (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">
                      {t("zpl.preview.generatingImage")}
                    </p>
                  </div>
                ) : settings.previewImage ? (
                  <Image
                    alt="ZPL Label Preview"
                    className="max-h-[300px] w-auto border rounded shadow-sm"
                    height={300}
                    src={settings.previewImage}
                    width={300}
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {t("zpl.preview.noPreview")}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ZPL Code Editor */}
          <div className="space-y-2">
            <Label isRequired>{t("zpl.code.label")}</Label>
            <div className="flex gap-2 mb-2">
              <Input
                ref={zplFileInputRef}
                accept=".zpl"
                className="hidden"
                type="file"
                onChange={handleZplFileUpload}
              />
              <Button
                variant="outline"
                onClick={() => zplFileInputRef.current?.click()}
              >
                {t("zpl.code.uploadFile")}
              </Button>
              <span className="text-sm text-muted-foreground self-center">
                {t("zpl.code.orManual")}
              </span>
            </div>
            <Textarea
              className="min-h-[300px] font-mono text-sm"
              placeholder={t("zpl.code.placeholder")}
              value={settings.rawZplCode}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                setRawZplCode(e.target.value);
                updateRawZplFields(e.target.value);
              }}
            />
            <p className="text-sm text-muted-foreground">{t("zpl.code.hint")}</p>
          </div>
        </CardContent>
      </Card>

      {/* Terminal/Logs Card */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t("terminal.title")}</CardTitle>
            <Button size="sm" variant="outline" onClick={clearLogs}>
              {t("terminal.clear")}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div
            ref={terminalRef}
            className="h-[200px] overflow-auto p-3 bg-black text-green-400 font-mono text-sm rounded-md"
          >
            {logs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
            {logs.length === 0 && (
              <div className="text-muted-foreground">{t("terminal.empty")}</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={resetForm}>
          {t("actions.reset")}
        </Button>
        <Button disabled={!canSubmit} onClick={handlePrintAndCreate}>
          {isProcessing ? t("actions.processing") : t("actions.printAndCreate")}
        </Button>
      </div>
    </div>
  );
};

export default PrintRfid;
