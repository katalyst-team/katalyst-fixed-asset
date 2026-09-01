import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cog,
  DollarSign,
  Download,
  FileText,
  Filter,
  FlaskConical,
  Laptop,
  Package,
  Plus,
  Radio,
  RefreshCw,
  Search,
  Shield,
  Tag,
  Truck,
  Upload,
  Wrench,
  Zap,
} from "lucide-react";

import { CAT_TONE } from "@/modules/dashboard/fixed-assets/constants";

export const formatIDR = (n: number): string =>
  "Rp " + Math.round(n).toLocaleString("id-ID");

export const formatIDRShort = (n: number): string => {
  if (n >= 1e9) return "Rp " + (n / 1e9).toFixed(1) + " M";
  if (n >= 1e6) return "Rp " + (n / 1e6).toFixed(1) + " jt";
  if (n >= 1e3) return "Rp " + (n / 1e3).toFixed(0) + " rb";
  return formatIDR(n);
};

export const formatAge = (days: number): string => {
  if (days < 30) return days + "d";
  if (days < 365) return Math.floor(days / 30) + "mo";
  return (days / 365).toFixed(1) + "y";
};

export const avatarColor = (i: number): string =>
  ["#3b82f6", "#06b6d4", "#8b5cf6", "#f59e0b", "#ec4899", "#10b981", "#ef4444"][
    Math.abs(i) % 7
  ];

export const initials = (n: string): string =>
  (n || "")
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");

export const catToLucide: Record<string, LucideIcon> = {
  furn: Package,
  it: Laptop,
  lab: FlaskConical,
  mach: Cog,
  med: AlertTriangle,
  tool: Wrench,
  veh: Truck,
};

export const catToneClass = (cat: string): string => {
  const tone = CAT_TONE[cat];
  return tone ?? "outline";
};

export const healthBarTone = (h: number): string =>
  h >= 80 ? "success" : h >= 60 ? "brand" : h >= 40 ? "warn" : "danger";

export const healthTone = (s: string): string =>
  s === "critical" || s === "alert"
    ? "danger"
    : s === "watch"
      ? "warn"
      : "success";

const PROTO_ICON_MAP: Record<string, LucideIcon> = {
  alert: AlertTriangle,
  arrin: Download,
  arrout: Upload,
  audit: FileText,
  box: Package,
  cal: Clock,
  check: CheckCircle2,
  cog: Cog,
  cross: AlertTriangle,
  dollar: DollarSign,
  filter: Filter,
  flask: FlaskConical,
  help: FileText,
  pin: Radio,
  plus: Plus,
  qr: Tag,
  radar: Radio,
  refresh: RefreshCw,
  search: Search,
  shield: Shield,
  sparkles: Zap,
  tag: Tag,
  truck: Truck,
  wrench: Wrench,
  zap: Zap,
};

export const protoIcon = (name: string): LucideIcon =>
  PROTO_ICON_MAP[name] ?? Package;

const ACT_ICON: Record<string, string> = {
  audit_scan_batch: "audit",
  checkout: "arrout",
  create: "plus",
  deploy: "check",
  depreciation: "dollar",
  disposal_complete: "cross",
  disposal_create: "cross",
  transfer: "truck",
  update: "refresh",
  work_order_create: "wrench",
};

const ACT_TONE: Record<string, string> = {
  audit_scan_batch: "info",
  checkout: "brand",
  create: "success",
  deploy: "success",
  depreciation: "info",
  disposal_complete: "danger",
  disposal_create: "warn",
  transfer: "brand",
  update: "info",
  work_order_create: "warn",
};

export const activityIcon = (actionType: string): string =>
  ACT_ICON[actionType] ?? "box";

export const activityTone = (actionType: string): string =>
  ACT_TONE[actionType] ?? "outline";

export const formatActivityTime = (iso: string): string => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
  });
};

const HEATMAP_DAYS = 7;
const HEATMAP_SLOTS_PER_DAY = 6;
const HEATMAP_START_HOUR = 6;

export const parseEventDate = (raw: string): Date | null => {
  const parsed = new Date(raw.includes("T") ? raw : raw.replace(" ", "T"));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const buildActivityHeatmap = (events: string[]): number[][] => {
  const grid = Array.from({ length: HEATMAP_DAYS }, () =>
    Array.from({ length: HEATMAP_SLOTS_PER_DAY }, () => 0),
  );
  const weekAgo = Date.now() - HEATMAP_DAYS * 24 * 60 * 60 * 1000;
  for (const raw of events) {
    const d = parseEventDate(raw);
    if (!d || d.getTime() < weekAgo) continue;
    const slot = Math.floor((d.getHours() - HEATMAP_START_HOUR) / 3);
    if (slot < 0 || slot >= HEATMAP_SLOTS_PER_DAY) continue;
    const day = (d.getDay() + 6) % HEATMAP_DAYS;
    grid[day][slot] += 1;
  }
  return grid;
};

export const heatOpacity = (count: number, max: number): number => {
  if (count === 0 || max === 0) return 0.04;
  return 0.15 + 0.7 * (count / max);
};
