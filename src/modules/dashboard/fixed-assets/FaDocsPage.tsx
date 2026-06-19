"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle, BookOpen, Boxes, ChevronRight, Cog, Database, FileText, HelpCircle, Laptop,
  Lock, MapPin, Package, Printer, Radio, Shield, Truck, Wrench, Zap,
} from "lucide-react";
import { toast } from "sonner";

import { FaShellHead } from "@/modules/dashboard/fixed-assets";

interface DocCard {
  desc: string;
  icon: LucideIcon;
  title: string;
}
interface DocGroup {
  cards: DocCard[];
  title: string;
}

const GROUPS: DocGroup[] = [
  {
    cards: [
      { desc: "Get up and running in 15 minutes", icon: Zap, title: "Quick Start" },
      { desc: "Register and tag your first asset", icon: Package, title: "First Asset" },
      { desc: "Connect readers and configure gates", icon: Radio, title: "RFID Setup" },
    ],
    title: "Getting Started",
  },
  {
    cards: [
      { desc: "Record asset arrivals and entries", icon: MapPin, title: "Scan-In" },
      { desc: "Check-out and custody transfer", icon: Truck, title: "Scan-Out" },
      { desc: "Move assets between sites", icon: Boxes, title: "Transfer" },
      { desc: "Stock count and reconciliation", icon: FileText, title: "Audit" },
    ],
    title: "Daily Operations",
  },
  {
    cards: [
      { desc: "Create, assign, and close WOs", icon: Wrench, title: "Work Orders" },
      { desc: "Preventive maintenance scheduling", icon: Cog, title: "PM Rules" },
      { desc: "Pre-use checks and inspections", icon: Shield, title: "Inspections" },
    ],
    title: "Maintenance",
  },
  {
    cards: [
      { desc: "Indonesian fixed asset standard", icon: BookOpen, title: "PSAK 16" },
      { desc: "Methods, rates, and journals", icon: Database, title: "Depreciation" },
      { desc: "Dispose, sell, or retire assets", icon: AlertTriangle, title: "Disposals" },
      { desc: "ERP posting and roll-forward", icon: FileText, title: "GL Integration" },
    ],
    title: "Finance",
  },
  {
    cards: [
      { desc: "REST + webhook reference", icon: Laptop, title: "API Reference" },
      { desc: "GS1 EPCIS 2.0 event spec", icon: Radio, title: "EPCIS" },
      { desc: "ERP, printer, and SSO setup", icon: Printer, title: "Integrations" },
      { desc: "Roles, MFA, and audit trail", icon: Lock, title: "Security" },
    ],
    title: "Advanced",
  },
  {
    cards: [
      { desc: "Audit-ready documentation bundle", icon: FileText, title: "BPKP" },
      { desc: "Calibration traceability standard", icon: Shield, title: "ISO 17025" },
      { desc: "Tax fixed-asset schedule", icon: BookOpen, title: "Form 1771" },
    ],
    title: "Compliance",
  },
];

function DocCardItem({ card }: { card: DocCard }) {
  const Icon = card.icon;
  return (
    <button
      className="ks-card"
      style={{ alignItems: "flex-start", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}
      type="button"
      onClick={() => toast(`Opening "${card.title}"…`)}
    >
      <div className="ks-card-body" style={{ display: "flex", gap: 12, padding: 16, width: "100%" }}>
        <span className="ks-kpi-mini-square brand" style={{ alignItems: "center", borderRadius: 8, display: "flex", flexShrink: 0, height: 38, justifyContent: "center", width: 38 }}>
          <Icon size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ alignItems: "center", display: "flex", fontSize: 13.5, fontWeight: 600, gap: 6, justifyContent: "space-between" }}>
            {card.title}
            <ChevronRight size={14} style={{ color: "hsl(var(--text-3))", flexShrink: 0 }} />
          </div>
          <p style={{ color: "hsl(var(--text-2))", fontSize: 12.5, lineHeight: 1.45, margin: "4px 0 0" }}>{card.desc}</p>
        </div>
      </div>
    </button>
  );
}

export function FaDocsPage() {
  return (
    <div>
      <FaShellHead
        desc="Guides, references, and compliance documentation."
        title="Documentation · How it works"
      />
      <div className="ks-card" style={{ marginBottom: 20 }}>
        <div className="ks-card-body" style={{ alignItems: "center", display: "flex", gap: 16 }}>
          <span className="ks-kpi-mini-square brand" style={{ alignItems: "center", borderRadius: 12, display: "flex", flexShrink: 0, height: 52, justifyContent: "center", width: 52 }}>
            <HelpCircle size={24} />
          </span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>Fixed Assets Module</div>
            <p style={{ color: "hsl(var(--text-2))", fontSize: 13, lineHeight: 1.5, margin: "4px 0 0", maxWidth: 640 }}>
              End-to-end asset lifecycle management — from tagging and custody to PSAK 16 depreciation,
              maintenance, and disposal. RFID-native with GS1 EPCIS export, audit-ready for BPKP &amp; ISO 17025.
            </p>
          </div>
        </div>
      </div>
      {GROUPS.map((g) => (
        <div key={g.title} style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 12px" }}>{g.title}</h2>
          <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(3, 1fr)" }}>
            {g.cards.map((c) => (
              <DocCardItem key={c.title} card={c} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
