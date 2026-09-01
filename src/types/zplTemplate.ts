export interface ZplTemplateTuning {
  encodePosition?: string;
  jobDelayMs?: number;
  previewSettings?: Partial<{
    dpmm: string;
    height: string;
    index: string;
    unit: "mm" | "inch";
    width: string;
  }>;
  printCount?: number;
  printer?: string;
  rfPower?: string;
}

export interface ZplTemplateFieldMapping {
  id: string;
  mapping: string;
}

export interface ZplTemplateType {
  content: string;
  field_mappings: Record<string, ZplTemplateFieldMapping[]> | null;
  id: string;
  last_used_at: string;
  name: string;
  tuning: ZplTemplateTuning | null;
}

export interface UpsertZplTemplatePayload {
  content: string;
  field_mappings: Record<string, ZplTemplateFieldMapping[]>;
  name: string;
  tuning: ZplTemplateTuning;
}
