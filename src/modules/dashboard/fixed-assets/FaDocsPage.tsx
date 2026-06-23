"use client";

import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle, BookOpen, Boxes, ChevronRight, Cog, Database, FileText, HelpCircle, Laptop,
  Lock, MapPin, Package, Printer, Radio, Shield, Truck, Wrench, Zap,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import { useUser } from "@/context/user-context";
import { useGetFADocsQuery } from "@/hooks/api/fixed-assets";
import { FaShellHead } from "@/modules/dashboard/fixed-assets";
import { FaQueryState } from "@/modules/dashboard/fixed-assets/FaQueryState";
import type { FaDocListItem } from "@/types/fixed-assets";

const ICON_MAP: Record<string, LucideIcon> = {
  alertTriangle: AlertTriangle,
  bookOpen: BookOpen,
  boxes: Boxes,
  cog: Cog,
  database: Database,
  fileText: FileText,
  laptop: Laptop,
  lock: Lock,
  mapPin: MapPin,
  package: Package,
  printer: Printer,
  radio: Radio,
  shield: Shield,
  truck: Truck,
  wrench: Wrench,
  zap: Zap,
};

function DocCardItem({ doc }: { doc: FaDocListItem }) {
  const Icon = ICON_MAP[doc.icon] ?? FileText;
  return (
    <a
      className="ks-card"
      href={doc.url}
      rel="noopener noreferrer"
      style={{ alignItems: "flex-start", cursor: "pointer", display: "flex", flexDirection: "column", gap: 10, textAlign: "left" }}
      target="_blank"
      onClick={() => toast(`Opening "${doc.title}"…`)}
    >
      <div className="ks-card-body" style={{ display: "flex", gap: 12, padding: 16, width: "100%" }}>
        <span className="ks-kpi-mini-square brand" style={{ alignItems: "center", borderRadius: 8, display: "flex", flexShrink: 0, height: 38, justifyContent: "center", width: 38 }}>
          <Icon size={18} />
        </span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ alignItems: "center", display: "flex", fontSize: 13.5, fontWeight: 600, gap: 6, justifyContent: "space-between" }}>
            {doc.title}
            <ChevronRight size={14} style={{ color: "hsl(var(--text-3))", flexShrink: 0 }} />
          </div>
          <p style={{ color: "hsl(var(--text-2))", fontSize: 12.5, lineHeight: 1.45, margin: "4px 0 0" }}>{doc.category}</p>
        </div>
      </div>
    </a>
  );
}

export function FaDocsPage() {
  const { tokenPayload } = useUser();
  const organizationId = tokenPayload?.organization_id ?? "";

  const { data: resp, isError, isLoading } = useGetFADocsQuery({ organizationId });

  const groups = useMemo(() => {
    const docs = resp?.data?.docs ?? [];
    const map = new Map<string, FaDocListItem[]>();
    for (const d of docs) {
      const arr = map.get(d.category) ?? [];
      arr.push(d);
      map.set(d.category, arr);
    }
    return Array.from(map, ([title, cards]) => ({ cards, title }));
  }, [resp]);

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
      <FaQueryState
        emptyDescription="No documentation available."
        emptyTitle="No documents"
        isEmpty={groups.length === 0}
        isError={isError}
        isLoading={isLoading}
      >
        {groups.map((g) => (
          <div key={g.title} style={{ marginBottom: 24 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, letterSpacing: "-0.01em", margin: "0 0 12px" }}>{g.title}</h2>
            <div style={{ display: "grid", gap: 14, gridTemplateColumns: "repeat(3, 1fr)" }}>
              {g.cards.map((c) => (
                <DocCardItem key={c.id} doc={c} />
              ))}
            </div>
          </div>
        ))}
      </FaQueryState>
    </div>
  );
}
