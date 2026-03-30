import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useGetPredictions, useGetTransactions, GetPredictionsDayType } from "@workspace/api-client-react";
import { Sun, CloudRain, PartyPopper, Sparkles, TrendingUp, Zap, BarChart2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const DAY_TYPES = [
  { id: GetPredictionsDayType.normal,  label: "Normal Day",  icon: Sun,         color: "text-orange-500",  bg: "bg-orange-50",  border: "border-orange-200" },
  { id: GetPredictionsDayType.rainy,   label: "Rainy Day",   icon: CloudRain,   color: "text-blue-500",    bg: "bg-blue-50",    border: "border-blue-200" },
  { id: GetPredictionsDayType.festival,label: "Festival Day",icon: PartyPopper, color: "text-pink-500",    bg: "bg-pink-50",    border: "border-pink-200" },
];

const CONFIDENCE_COLOR: Record<string, string> = {
  High: "text-emerald-600 bg-emerald-50 border-emerald-200",
  Medium: "text-amber-600 bg-amber-50 border-amber-200",
  Low: "text-rose-600 bg-rose-50 border-rose-200",
};

export default function PredictionsPage() {
  const [dayType, setDayType] = useState<GetPredictionsDayType>(GetPredictionsDayType.normal);
  const { data: predictions, isLoading } = useGetPredictions({ dayType });
  const { data: transactions } = useGetTransactions();

  const selectedType = DAY_TYPES.find(d => d.id === dayType)!;
  const Icon = selectedType.icon;

  // Build chart data for predicted vs. burn rate comparison
  const chartData = predictions?.map(p => ({
    name: p.productName,
    "Burn Rate": p.burnRate,
    "Predicted Demand": p.predictedDemand,
  })) ?? [];

  // Build per-product transaction volume
  const productVolume: Record<string, number> = {};
  transactions?.forEach(t => {
    productVolume[t.productName] = (productVolume[t.productName] || 0) + t.quantity;
  });

  const weatherEffect = {
    [GetPredictionsDayType.normal]:  { milk: "×1.0", bread: "×1.0", biscuits: "×1.0", tea: "×1.0", note: "Standard demand — normal multipliers applied." },
    [GetPredictionsDayType.rainy]:   { milk: "×1.4", bread: "×1.1", biscuits: "×1.1", tea: "×1.5", note: "Rain increases Milk & Tea consumption significantly." },
    [GetPredictionsDayType.festival]:{ milk: "×1.2", bread: "×1.6", biscuits: "×1.7", tea: "×1.2", note: "Festivals drive Bread & Biscuit demand sharply upward." },
  };
  const effect = weatherEffect[dayType];

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">

          <div className="mb-2">
            <h1 className="text-2xl font-display font-bold">AI Demand Predictions</h1>
            <p className="text-muted-foreground mt-1">Forecast based on sales history + weather/festival multipliers</p>
          </div>

          {/* Day Type Selector */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5">
            <p className="text-sm font-semibold text-muted-foreground mb-3">Select Day Condition</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {DAY_TYPES.map(type => {
                const T = type.icon;
                const active = dayType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setDayType(type.id)}
                    className={cn(
                      "flex items-center gap-3 px-5 py-4 rounded-xl border-2 transition-all font-semibold text-sm",
                      active ? `${type.bg} ${type.border} ${type.color}` : "border-border/50 text-muted-foreground hover:border-border hover:bg-muted/30"
                    )}
                  >
                    <T className={cn("w-5 h-5", active && type.color)} />
                    {type.label}
                  </button>
                );
              })}
            </div>

            {/* Weather insight note */}
            <div className={cn("mt-4 flex items-start gap-2 p-3 rounded-xl border text-sm", selectedType.bg, selectedType.border)}>
              <Info className={cn("w-4 h-4 mt-0.5 flex-shrink-0", selectedType.color)} />
              <span className={selectedType.color}>{effect.note}</span>
            </div>
          </div>

          {/* Prediction Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isLoading
              ? [1,2,3,4].map(i => <div key={i} className="h-40 bg-white/60 animate-pulse rounded-2xl border border-border/50" />)
              : predictions?.map(pred => {
                  const multiplierPct = Math.round((pred.weatherMultiplier - 1) * 100);
                  return (
                    <div key={pred.productId} className="bg-white rounded-2xl border border-border/50 shadow-sm p-6 hover:border-indigo-200 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-display font-bold text-lg">{pred.productName}</h3>
                          <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full border mt-1 inline-block", CONFIDENCE_COLOR[pred.confidence])}>
                            {pred.confidence} Confidence
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Predicted Demand</p>
                          <p className="text-3xl font-display font-bold text-primary">{pred.predictedDemand}</p>
                          <p className="text-xs text-muted-foreground">units tomorrow</p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Avg Burn Rate</span>
                          <span className="font-semibold">{pred.burnRate} units/sale</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1.5"><Icon className={cn("w-3.5 h-3.5", selectedType.color)} /> Weather Multiplier</span>
                          <span className={cn("font-semibold", multiplierPct > 0 ? selectedType.color : "text-muted-foreground")}>
                            ×{pred.weatherMultiplier.toFixed(1)} {multiplierPct > 0 && `(+${multiplierPct}%)`}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5" /> Total Sold (session)</span>
                          <span className="font-semibold">{productVolume[pred.productName] ?? 0} units</span>
                        </div>
                      </div>
                    </div>
                  );
                })
            }
          </div>

          {/* Bar Chart */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-indigo-500" />
              Burn Rate vs. Predicted Demand
            </h2>
            <p className="text-sm text-muted-foreground mb-6">How weather/festival conditions amplify your historical burn rate</p>
            <div className="h-[260px]">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }} barCategoryGap="30%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }} />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '16px' }} />
                    <Bar dataKey="Burn Rate" fill="#e5e7eb" radius={[4,4,0,0]} />
                    <Bar dataKey="Predicted Demand" fill="#00baf2" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
                  <div className="text-center">
                    <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p>Log some sales first to generate predictions</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Multiplier Table */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <h2 className="font-display font-bold text-lg mb-4">Demand Multiplier Reference</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="text-left px-4 py-2 text-muted-foreground font-medium">Product</th>
                    <th className="text-center px-4 py-2"><span className="flex items-center justify-center gap-1"><Sun className="w-4 h-4 text-orange-500" /> Normal</span></th>
                    <th className="text-center px-4 py-2"><span className="flex items-center justify-center gap-1"><CloudRain className="w-4 h-4 text-blue-500" /> Rainy</span></th>
                    <th className="text-center px-4 py-2"><span className="flex items-center justify-center gap-1"><PartyPopper className="w-4 h-4 text-pink-500" /> Festival</span></th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "Milk",     normal: "×1.0", rainy: "×1.4", festival: "×1.2" },
                    { name: "Bread",    normal: "×1.0", rainy: "×1.1", festival: "×1.6" },
                    { name: "Biscuits", normal: "×1.0", rainy: "×1.1", festival: "×1.7" },
                    { name: "Tea",      normal: "×1.0", rainy: "×1.5", festival: "×1.2" },
                  ].map(row => (
                    <tr key={row.name} className="border-b border-border/30 hover:bg-muted/20">
                      <td className="px-4 py-3 font-semibold">{row.name}</td>
                      <td className="px-4 py-3 text-center text-muted-foreground">{row.normal}</td>
                      <td className="px-4 py-3 text-center text-blue-600 font-medium">{row.rainy}</td>
                      <td className="px-4 py-3 text-center text-pink-600 font-medium">{row.festival}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
