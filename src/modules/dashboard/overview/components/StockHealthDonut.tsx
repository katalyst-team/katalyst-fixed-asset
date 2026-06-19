interface StockHealthDonutProps {
  critical: number;
  inStock: number;
  lowStock: number;
}

export function StockHealthDonut({
  critical,
  inStock,
  lowStock,
}: StockHealthDonutProps) {
  const data = [
    { color: "hsl(var(--success))", label: "In stock", value: inStock },
    { color: "hsl(var(--warn))", label: "Low stock", value: lowStock },
    { color: "hsl(var(--destructive))", label: "Critical", value: critical },
  ];
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const R = 50;
  const STROKE = 14;
  const circ = 2 * Math.PI * R;
  let cum = 0;
  const segs = data.map((d) => {
    const start = cum / total;
    cum += d.value;
    const len = d.value / total;
    return {
      ...d,
      dasharray: `${len * circ} ${circ}`,
      dashoffset: `-${start * circ}`,
    };
  });

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap: 18,
        padding: "8px 4px",
      }}
    >
      <svg height="140" viewBox="0 0 140 140" width="140">
        <g transform="translate(70 70) rotate(-90)">
          {segs.map((s, i) => (
            <circle
              key={i}
              cx="0"
              cy="0"
              fill="none"
              r={R}
              stroke={s.color}
              strokeDasharray={s.dasharray}
              strokeDashoffset={s.dashoffset}
              strokeLinecap="butt"
              strokeWidth={STROKE}
            />
          ))}
        </g>
        <text
          fill="hsl(var(--text))"
          fontFamily="ui-monospace, Menlo, monospace"
          fontSize="22"
          fontWeight="700"
          textAnchor="middle"
          x="70"
          y="68"
        >
          {total.toLocaleString()}
        </text>
        <text
          fill="hsl(var(--text-3))"
          fontSize="11"
          textAnchor="middle"
          x="70"
          y="86"
        >
          Total items
        </text>
      </svg>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "column",
          gap: 8,
        }}
      >
        {data.map((d) => (
          <div
            key={d.label}
            style={{
              alignItems: "center",
              display: "flex",
              fontSize: 12.5,
              gap: 8,
            }}
          >
            <span
              style={{
                background: d.color,
                borderRadius: 2,
                height: 8,
                width: 8,
              }}
            />
            <span style={{ color: "hsl(var(--text-2))", flex: 1 }}>
              {d.label}
            </span>
            <span className="mono" style={{ fontWeight: 600 }}>
              {d.value.toLocaleString()}
            </span>
            <span
              className="mono"
              style={{
                color: "hsl(var(--text-3))",
                fontSize: 11,
                textAlign: "right",
                width: 40,
              }}
            >
              {((d.value / total) * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default StockHealthDonut;
