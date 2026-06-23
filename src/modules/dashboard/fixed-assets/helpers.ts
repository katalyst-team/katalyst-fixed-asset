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
