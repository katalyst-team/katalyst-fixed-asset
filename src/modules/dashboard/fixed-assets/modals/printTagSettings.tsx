"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FaTagPreviewSettings } from "@/hooks/useFaTagPrint";
import type { RfidTuning } from "@/utils/zpl";

interface PreviewSettingsGridProps {
  previewSettings: FaTagPreviewSettings;
  onPreviewSettingsChange: (patch: Partial<FaTagPreviewSettings>) => void;
}

export function PreviewSettingsGrid({
  onPreviewSettingsChange,
  previewSettings,
}: PreviewSettingsGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-4">
      <div className="space-y-1">
        <Label>Width</Label>
        <Input
          value={previewSettings.width}
          onChange={(e) => {
            onPreviewSettingsChange({ width: e.target.value });
          }}
        />
      </div>
      <div className="space-y-1">
        <Label>Height</Label>
        <Input
          value={previewSettings.height}
          onChange={(e) => {
            onPreviewSettingsChange({ height: e.target.value });
          }}
        />
      </div>
      <div className="space-y-1">
        <Label>Unit</Label>
        <Select
          value={previewSettings.unit}
          onValueChange={(v) => {
            onPreviewSettingsChange({ unit: v as "mm" | "inch" });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="mm">mm</SelectItem>
            <SelectItem value="inch">inch</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1">
        <Label>Density</Label>
        <Select
          value={previewSettings.dpmm}
          onValueChange={(v) => {
            onPreviewSettingsChange({ dpmm: v });
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {["6dpmm", "8dpmm", "12dpmm", "24dpmm"].map((d) => (
              <SelectItem key={d} value={d}>
                {d}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

interface PrintTuningGridProps {
  jobDelayMs: number;
  rfidTuning: RfidTuning;
  onJobDelayMsChange: (value: number) => void;
  onRfidTuningChange: (tuning: RfidTuning) => void;
}

export function PrintTuningGrid({
  jobDelayMs,
  onJobDelayMsChange,
  onRfidTuningChange,
  rfidTuning,
}: PrintTuningGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <div className="space-y-1">
        <Label>RF power</Label>
        <Input
          placeholder="e.g. 15"
          value={rfidTuning.rfPower ?? ""}
          onChange={(e) => {
            onRfidTuningChange({ ...rfidTuning, rfPower: e.target.value });
          }}
        />
      </div>
      <div className="space-y-1">
        <Label>Encode position</Label>
        <Input
          placeholder="e.g. 1,0"
          value={rfidTuning.encodePosition ?? ""}
          onChange={(e) => {
            onRfidTuningChange({
              ...rfidTuning,
              encodePosition: e.target.value,
            });
          }}
        />
      </div>
      <div className="space-y-1">
        <Label>Job delay (ms)</Label>
        <Input
          max={5000}
          min={0}
          type="number"
          value={jobDelayMs}
          onChange={(e) => {
            onJobDelayMsChange(Number(e.target.value) || 0);
          }}
        />
      </div>
    </div>
  );
}
