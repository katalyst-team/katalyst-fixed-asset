import { ChevronRight } from "lucide-react";
import * as React from "react";

interface AlertTileProps {
  body: string;
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  tone: "danger" | "warn" | "info";
}

export function AlertTile({ body, icon: Icon, title, tone }: AlertTileProps) {
  return (
    <div className={`ks-alert-tile ks-alert-${tone}`}>
      <div className="ks-alert-tile-icon">
        <Icon size={16} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="ks-alert-tile-title">{title}</div>
        <div className="ks-alert-tile-body">{body}</div>
      </div>
      <ChevronRight size={14} style={{ color: "hsl(var(--text-3))" }} />
    </div>
  );
}

export default AlertTile;
