import { useState, useMemo } from "react";
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import { useGetPredictions, GetPredictionsDayType } from "@workspace/api-client-react";
import { Sparkles, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  dayType: GetPredictionsDayType;
}

const PRODUCTS = [
  { id: "milk",     label: "Milk",     baseDaily: 10, color: "#0ea5e9" },
  { id: "bread",    label: "Bread",    baseDaily: 8,  color: "#6366f1" },
  { id: "biscuits", label: "Biscuits", baseDaily: 12, color: "#10b981" },
  { id: "tea",      label: "Tea",      baseDaily: 6,  color: "#f59e0b" },
];

// Deterministic offsets per product for 5 historical days (no Math.random)
const OFFSETS: Record<string, number[]> = {
  milk:     [0.88, 1.12, 0.95, 1.08, 0.92],
  bread:    [1.05, 0.90, 1.14, 0.87, 1.10],
  biscuits: [0.92, 1.18, 1.02, 0.94, 1.08],
  tea:      [1.10, 0.85, 1.05, 1.20, 0.90],
};

const DAY_LABELS = ["5d ago", "4d ago", "3d ago", "2d ago", "Yesterday", "Today", "Tomorrow"];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const hist = payload.find((p: any) => p.dataKey === "historical");
  const pred = payload.find((p: any) => p.dataKey === "predicted");
  return (
    <div className="bg-white rounded-xl border border-[#c0d8f0] shadow-xl px-4 py-3 text-sm">
      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-2">{label}</p>
      {hist?.value != null && (
        <p className="text-[#002970] font-bold">{hist.value} <span className="font-normal text-muted-foreground">units sold</span></p>
      )}
      {pred?.value != null && (
        <p className="text-[#7c3aed] font-bold">{pred.value} <span className="font-normal text-muted-foreground">units predicted</span></p>
      )}
    </div>
  );
};

export function AiDemandChart({ dayType }: Props) {
  const [activeProduct, setActiveProduct] = useState(PRODUCTS[0]);
  const { data: predictions } = useGetPredictions({ dayType });

  const chartData = useMemo(() => {
    const pred = predictions?.find(p => p.productId === activeProduct.id);
    const base = activeProduct.baseDaily;
    const offsets = OFFSETS[activeProduct.id];

    const predicted = pred?.predictedDemand ?? Math.round(base * (pred?.weatherMultiplier ?? 1));
    const todayVal = Math.round(base * offsets[4] * 0.5); // partial day

    return DAY_LABELS.map((day, i) => {
      if (i < 5) {
        return { day, historical: Math.round(base * offsets[i]), predicted: null };
      }
      if (i === 5) {
        // Today: both lines connect here
        return { day, historical: todayVal, predicted: todayVal };
      }
      // Tomorrow: only prediction
      return { day, historical: null, predicted };
    });
  }, [predictions, activeProduct, dayType]);

  const predValue = chartData[6]?.predicted ?? 0;
  const avgHistorical = Math.round(
    chartData.slice(0, 5).reduce((s, d) => s + (d.historical ?? 0), 0) / 5
  );
  const trendPct = avgHistorical > 0
    ? Math.round(((predValue - avgHistorical) / avgHistorical) * 100)
    : 0;

  return (
    <div className="ai-forecast-card">
      {/* Header */}
      <div
        className="px-6 py-5 border-b border-[#00baf2]/15"
        style={{ background: "linear-gradient(135deg, rgba(0,25,80,0.03) 0%, rgba(0,186,242,0.05) 100%)" }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shadow-md"
                style={{ background: "linear-gradient(135deg, #002970, #00baf2)" }}
              >
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <h2 className="font-display font-bold text-lg text-foreground">AI Demand Forecast</h2>
              <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full text-white shadow-sm"
                style={{ background: "linear-gradient(135deg, #002970, #00baf2)" }}>
                Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground">Historical trend + AI-predicted demand for tomorrow</p>
          </div>

          {/* Product tabs */}
          <div className="flex p-1 rounded-xl border border-[#d0dcff]/60 gap-0.5"
            style={{ background: "rgba(240,244,255,0.8)" }}>
            {PRODUCTS.map(p => {
              const active = p.id === activeProduct.id;
              return (
                <button
                  key={p.id}
                  onClick={() => setActiveProduct(p)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                    active ? "text-white shadow-md" : "text-muted-foreground hover:text-foreground hover:bg-white/70"
                  )}
                  style={active ? { background: `linear-gradient(135deg, #002970, ${p.color})` } : undefined}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stat row */}
        <div className="mt-4 flex items-center gap-6">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">5-Day Avg</p>
            <p className="font-display font-bold text-xl text-foreground">{avgHistorical} <span className="text-xs font-normal text-muted-foreground">units/day</span></p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">Tomorrow</p>
            <p className="font-display font-bold text-xl text-[#7c3aed]">{predValue} <span className="text-xs font-normal text-muted-foreground">predicted</span></p>
          </div>
          <div className="w-px h-8 bg-border" />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">Trend</p>
            <p className={cn(
              "font-display font-bold text-xl flex items-center gap-1",
              trendPct >= 0 ? "text-emerald-600" : "text-rose-600"
            )}>
              <TrendingUp className="w-4 h-4" />
              {trendPct >= 0 ? "+" : ""}{trendPct}%
            </p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6 pb-4" style={{ background: "linear-gradient(180deg, rgba(240,248,255,0.4) 0%, #fff 60%)" }}>
        <ResponsiveContainer width="100%" height={240}>
          <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: -8, bottom: 0 }}>
            <defs>
              <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0057b8" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0057b8" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.18} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="4 4" stroke="#e8edf5" vertical={false} />

            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "#8898aa", fontWeight: 500 }}
              axisLine={false}
              tickLine={false}
              dy={8}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "#8898aa" }}
              axisLine={false}
              tickLine={false}
              width={32}
            />

            <Tooltip content={<CustomTooltip />} />

            <ReferenceLine
              x="Today"
              stroke="#00baf2"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: "today", position: "top", fontSize: 10, fill: "#00baf2" }}
            />

            {/* Historical area */}
            <Area
              type="monotone"
              dataKey="historical"
              stroke="#0057b8"
              strokeWidth={2.5}
              fill="url(#blueGrad)"
              dot={{ fill: "#0057b8", r: 3.5, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: "#002970", strokeWidth: 0 }}
              connectNulls={false}
              name="historical"
            />

            {/* Prediction line (dotted purple) */}
            <Line
              type="monotone"
              dataKey="predicted"
              stroke="#7c3aed"
              strokeWidth={2.5}
              strokeDasharray="7 4"
              dot={{ fill: "#7c3aed", r: 4.5, strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6, fill: "#7c3aed" }}
              connectNulls={true}
              name="predicted"
            />
          </ComposedChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 bg-[#0057b8] rounded-full" />
            <span className="text-[11px] text-muted-foreground font-medium">Historical sales</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-0.5 rounded-full" style={{
              background: "repeating-linear-gradient(90deg, #7c3aed 0px, #7c3aed 6px, transparent 6px, transparent 10px)"
            }} />
            <span className="text-[11px] text-muted-foreground font-medium">AI prediction</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-px h-3 bg-[#00baf2]" />
            <span className="text-[11px] text-muted-foreground font-medium">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
