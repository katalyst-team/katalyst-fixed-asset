"use client";

import { AlertTriangle, BarChart3, PackageCheck, RotateCcw, Save, Target, TrendingUp } from "lucide-react";
import { useTranslation } from "next-i18next";
import React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

import { OverviewSettingsProvider, useOverviewSettings } from "./useOverviewSettings";

const ThresholdInput = ({
  defaultValue,
  description,
  icon: Icon,
  label,
  max,
  min,
  suffix,
  value,
  onChange,
}: {
  defaultValue?: number;
  description: string;
  icon: React.ElementType;
  label: string;
  max?: number;
  min?: number;
  onChange: (value: number) => void;
  suffix?: string;
  value: number | undefined;
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val)) {
      onChange(val);
    }
  };

  return (
    <div className="ks-setting-item">
      <div className="ks-setting-item-info">
        <div className="ks-setting-item-label">
          <Icon className="text-muted-foreground" size={16} />
          <span>{label}</span>
        </div>
        <div className="ks-setting-item-desc">{description}</div>
      </div>
      <div className="ks-setting-item-control">
        <Input
          max={max}
          min={min}
          style={{ maxWidth: 140, textAlign: "right" }}
          type="number"
          value={value ?? defaultValue ?? 0}
          onChange={handleChange}
        />
        {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
      </div>
    </div>
  );
};

const OverviewSettingsContent = () => {
  const { t } = useTranslation(["overview-settings", "common"]);
  const {
    handleReset,
    handleSave,
    hasChanges,
    isLoading,
    isSaving,
    localSettings,
    updateLocalSetting,
  } = useOverviewSettings();

  const onSave = () => {
    handleSave();
  };

  const onReset = () => {
    handleReset();
    toast.info(t("overview-settings:reset.toast", "Settings reset to saved values"));
  };

  if (isLoading) {
    return (
      <div className="ks-page-head">
        <div className="ks-page-title">{t("overview-settings:loading", "Loading settings...")}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="ks-page-head">
        <div>
          <h1 className="ks-page-title">
            {t("overview-settings:title", "Pengaturan Overview")}
          </h1>
          <p className="ks-page-desc">
            {t(
              "overview-settings:description",
              "Konfigurasi threshold dan parameter untuk data overview dashboard",
            )}
          </p>
        </div>
        <div className="ks-page-actions">
          <Button disabled={!hasChanges} variant="outline" onClick={onReset}>
            <RotateCcw size={14} />
            {t("overview-settings:actions.reset", "Reset")}
          </Button>
          <Button disabled={!hasChanges || isSaving} onClick={onSave}>
            <Save size={14} />
            {isSaving
              ? t("overview-settings:actions.saving", "Menyimpan...")
              : t("overview-settings:actions.save", "Simpan")}
          </Button>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle size={18} />
              {t("overview-settings:stockThreshold.title", "Threshold Stok")}
            </CardTitle>
            <CardDescription>
              {t(
                "overview-settings:stockThreshold.description",
                "Atur batas peringatan untuk kondisi stok di dashboard overview",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="ks-settings-list">
              <ThresholdInput
                defaultValue={10}
                description={t(
                  "overview-settings:stockThreshold.criticalStock.desc",
                  "Persentase stok di bawah safety stock untuk dikategorikan sebagai stok kritis",
                )}
                icon={AlertTriangle}
                label={t(
                  "overview-settings:stockThreshold.criticalStock.label",
                  "Threshold Stok Kritis (%)",
                )}
                max={100}
                min={0}
                suffix="%"
                value={localSettings.critical_stock_threshold}
                onChange={(v) => updateLocalSetting("critical_stock_threshold", v)}
              />
              <ThresholdInput
                defaultValue={20}
                description={t(
                  "overview-settings:stockThreshold.lowStock.desc",
                  "Persentase stok di bawah reorder point untuk dikategorikan sebagai stok rendah",
                )}
                icon={TrendingUp}
                label={t(
                  "overview-settings:stockThreshold.lowStock.label",
                  "Threshold Stok Rendah (%)",
                )}
                max={100}
                min={0}
                suffix="%"
                value={localSettings.low_stock_threshold}
                onChange={(v) => updateLocalSetting("low_stock_threshold", v)}
              />
              <ThresholdInput
                defaultValue={80}
                description={t(
                  "overview-settings:stockThreshold.overstock.desc",
                  "Persentase stok di atas kapasitas normal untuk dikategorikan sebagai stok berlebih",
                )}
                icon={PackageCheck}
                label={t(
                  "overview-settings:stockThreshold.overstock.label",
                  "Threshold Stok Berlebih (%)",
                )}
                max={200}
                min={0}
                suffix="%"
                value={localSettings.overstock_threshold}
                onChange={(v) => updateLocalSetting("overstock_threshold", v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <BarChart3 size={18} />
              {t("overview-settings:analytics.title", "Parameter Analitik")}
            </CardTitle>
            <CardDescription>
              {t(
                "overview-settings:analytics.description",
                "Atur parameter untuk perhitungan analitik dan metrik dashboard",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="ks-settings-list">
              <ThresholdInput
                defaultValue={90}
                description={t(
                  "overview-settings:analytics.agingStock.desc",
                  "Jumlah hari stok dianggap aging (stagnan) tanpa pergerakan",
                )}
                icon={BarChart3}
                label={t(
                  "overview-settings:analytics.agingStock.label",
                  "Batas Hari Stok Aging",
                )}
                min={1}
                suffix={t("overview-settings:suffix.days", "hari")}
                value={localSettings.aging_stock_days}
                onChange={(v) => updateLocalSetting("aging_stock_days", v)}
              />
              <ThresholdInput
                defaultValue={95}
                description={t(
                  "overview-settings:analytics.accuracyTarget.desc",
                  "Target persentase akurasi inventaris yang diharapkan",
                )}
                icon={Target}
                label={t(
                  "overview-settings:analytics.accuracyTarget.label",
                  "Target Akurasi Inventaris (%)",
                )}
                max={100}
                min={0}
                suffix="%"
                value={localSettings.inventory_accuracy_target}
                onChange={(v) => updateLocalSetting("inventory_accuracy_target", v)}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target size={18} />
              {t("overview-settings:features.title", "Fitur")}
            </CardTitle>
            <CardDescription>
              {t(
                "overview-settings:features.description",
                "Aktifkan atau nonaktifkan fitur tertentu di dashboard overview",
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="ks-settings-list">
              <div className="ks-setting-item">
                <div className="ks-setting-item-info">
                  <div className="ks-setting-item-label">
                    {t(
                      "overview-settings:features.ritNumber.label",
                      "Nomor RIT",
                    )}
                  </div>
                  <div className="ks-setting-item-desc">
                    {t(
                      "overview-settings:features.ritNumber.desc",
                      "Aktifkan fitur nomor RIT pada transaksi",
                    )}
                  </div>
                </div>
                <Switch
                  checked={localSettings.rit_number_enabled ?? false}
                  onCheckedChange={(checked) =>
                    updateLocalSetting("rit_number_enabled", checked)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {hasChanges && (
        <div className="ks-settings-footer">
          <span className="text-sm text-muted-foreground">
            {t(
              "overview-settings:unsavedChanges",
              "Ada perubahan yang belum disimpan",
            )}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <Button size="sm" variant="outline" onClick={onReset}>
              <RotateCcw size={14} />
              {t("overview-settings:actions.reset", "Reset")}
            </Button>
            <Button disabled={isSaving} size="sm" onClick={onSave}>
              <Save size={14} />
              {isSaving
                ? t("overview-settings:actions.saving", "Menyimpan...")
                : t("overview-settings:actions.save", "Simpan")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const OverviewSettingsPage = () => {
  return (
    <OverviewSettingsProvider>
      <OverviewSettingsContent />
    </OverviewSettingsProvider>
  );
};

export default OverviewSettingsPage;
