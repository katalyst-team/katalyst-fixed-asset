import { protoIcon } from "./helpers";

interface FaShellHeadProps {
  desc?: string;
  actions?: React.ReactNode;
  title: string;
}

export function FaShellHead({ title, desc, actions }: FaShellHeadProps) {
  return (
    <div className="ks-page-head">
      <div>
        <h1 className="ks-page-title">{title}</h1>
        {desc && <p className="ks-page-desc">{desc}</p>}
      </div>
      {actions && <div className="ks-page-actions">{actions}</div>}
    </div>
  );
}

interface FaStatProps {
  label: string;
  sub?: string;
  tone?: "brand" | "info" | "success" | "warn" | "danger";
  value: React.ReactNode;
}

export function FaStat({ label, sub, tone = "brand", value }: FaStatProps) {
  const toneMap: Record<string, string> = {
    brand: "ks-kpi-mini-square brand",
    danger: "ks-kpi-mini-square danger",
    info: "ks-kpi-mini-square brand",
    success: "ks-kpi-mini-square success",
    warn: "ks-kpi-mini-square warn",
  };
  return (
    <div className="ks-kpi-cardspark">
      <div className="ks-kpi-cardspark-top">
        <span className={toneMap[tone]} />
        <span className="ks-kpi-cardspark-label">{label}</span>
      </div>
      <div className="ks-kpi-cardspark-value">{value}</div>
      {sub && (
        <span className="ks-badge outline" style={{ marginTop: 4 }}>
          {sub}
        </span>
      )}
    </div>
  );
}

export function FaKpiStrip({ children }: { children: React.ReactNode }) {
  return <div className="ks-kpi-strip">{children}</div>;
}

interface FaMeterProps {
  pct: number;
  tone?: string;
}

export function FaMeter({ pct, tone = "brand" }: FaMeterProps) {
  const bg =
    tone === "success"
      ? "hsl(var(--success))"
      : tone === "warn"
        ? "hsl(var(--warn))"
        : tone === "danger"
          ? "hsl(var(--destructive))"
          : "hsl(var(--brand))";
  return (
    <div
      style={{
        background: "hsl(var(--surface-2))",
        borderRadius: 4,
        height: 5,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          background: bg,
          borderRadius: 4,
          height: "100%",
          transition: "width .3s",
          width: `${Math.max(0, Math.min(100, pct))}%`,
        }}
      />
    </div>
  );
}

interface FaProtoIconProps {
  name: string;
  size?: number;
}

export function FaProtoIcon({ name, size = 14 }: FaProtoIconProps) {
  const Icon = protoIcon(name);
  return <Icon size={size} />;
}
