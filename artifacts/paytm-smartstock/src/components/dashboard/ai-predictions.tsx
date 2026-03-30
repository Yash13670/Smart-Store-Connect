import { useGetPredictions, GetPredictionsDayType } from "@workspace/api-client-react";
import { CloudRain, Sun, PartyPopper, Sparkles, BrainCircuit, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  dayType: GetPredictionsDayType;
}

const dayMeta: Record<GetPredictionsDayType, { icon: React.ElementType; color: string; label: string }> = {
  [GetPredictionsDayType.normal]:  { icon: Sun,         color: "text-orange-500", label: "Normal Day" },
  [GetPredictionsDayType.rainy]:   { icon: CloudRain,   color: "text-blue-400",   label: "Rainy Day" },
  [GetPredictionsDayType.festival]:{ icon: PartyPopper, color: "text-pink-500",   label: "Festival Day" },
};

export function AiPredictions({ dayType }: Props) {
  const { data: predictions, isLoading } = useGetPredictions({ dayType });

  const activeMeta = dayMeta[dayType] ?? dayMeta[GetPredictionsDayType.normal];
  const ActiveIcon = activeMeta.icon;
  const hasBoost = predictions?.some(p => p.weatherMultiplier > 1);

  return (
    <div className="ai-forecast-card">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-[#001a4d]/[0.04] via-[#0057b8]/[0.04] to-[#00baf2]/[0.06] px-7 py-5 border-b border-[#00baf2]/15">
        <div className="flex items-center justify-between gap-4">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#002970] to-[#00baf2] flex items-center justify-center shadow-md shadow-blue-500/20">
                <BrainCircuit className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
              </div>
              <h2 className="font-display font-bold text-xl text-foreground">Per-Product Demand Breakdown</h2>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-[#002970] to-[#00baf2] text-white shadow-sm">
                Live
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Expected units to sell tomorrow · Condition: <span className="font-semibold text-[#002970]">{activeMeta.label}</span>
            </p>
          </div>

          {/* Active condition badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#d0dcff] shadow-sm">
            <ActiveIcon className={cn("w-4 h-4", activeMeta.color)} />
            <span className="text-xs font-semibold text-foreground">{activeMeta.label}</span>
          </div>
        </div>

        {/* Boost notice */}
        {hasBoost && !isLoading && (
          <div className="mt-4 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#002970]/10 to-[#00baf2]/10 border border-[#00baf2]/20">
            <ActiveIcon className={cn("w-4 h-4 flex-shrink-0", activeMeta.color)} />
            <p className="text-xs font-medium text-[#003fa3]">
              {dayType === GetPredictionsDayType.rainy
                ? "Rainy conditions detected — Milk & Tea demand predicted to surge. Consider stocking up."
                : "Festival mode active — Bread & Biscuit demand multipliers applied. Plan accordingly."}
            </p>
          </div>
        )}
      </div>

      {/* Prediction cards */}
      <div className="p-7">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 bg-muted/40 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictions?.map((pred) => {
              const multiplierPct = Math.round((pred.weatherMultiplier - 1) * 100);
              const isBoosted = pred.weatherMultiplier > 1;

              return (
                <div
                  key={pred.productId}
                  className={cn(
                    "flex items-center justify-between p-5 rounded-xl border transition-all duration-200",
                    isBoosted
                      ? "border-[#00baf2]/30 bg-gradient-to-br from-[#f0f8ff] to-[#e8f4ff] hover:border-[#00baf2]/50 hover:shadow-md hover:shadow-blue-100"
                      : "border-border/50 bg-white hover:border-[#00baf2]/25 hover:bg-[#f8fbff]"
                  )}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-display font-bold text-foreground">{pred.productName}</h4>
                      {isBoosted && <TrendingUp className="w-3.5 h-3.5 text-[#0066cc]" />}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                        Burn: {pred.burnRate}/sale
                      </span>
                      <span className={cn(
                        "text-xs px-2 py-0.5 rounded-md font-medium",
                        pred.confidence === "High"   ? "text-emerald-700 bg-emerald-50" :
                        pred.confidence === "Medium" ? "text-amber-700 bg-amber-50" :
                                                       "text-blue-700 bg-blue-50"
                      )}>
                        {pred.confidence} confidence
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] text-muted-foreground mb-1 uppercase tracking-wide font-medium">Expected</p>
                    <p className={cn(
                      "font-display font-bold text-3xl leading-none",
                      isBoosted ? "text-[#002970]" : "text-primary"
                    )}>
                      {pred.predictedDemand}
                    </p>
                    {isBoosted ? (
                      <span className="inline-flex items-center gap-0.5 text-[11px] text-white bg-gradient-to-r from-[#003fa3] to-[#00baf2] px-2 py-0.5 rounded-full mt-1 font-semibold shadow-sm">
                        +{multiplierPct}% ↑
                      </span>
                    ) : (
                      <span className="text-[11px] text-muted-foreground">units</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom strip */}
        {!isLoading && predictions && predictions.length > 0 && (
          <div className="mt-5 flex items-center gap-3 px-5 py-3.5 rounded-xl bg-gradient-to-r from-[#f0f4ff] to-[#e8f7ff] border border-[#c7dcff]/60">
            <Sparkles className="w-4 h-4 text-[#0057b8] flex-shrink-0" />
            <p className="text-xs text-[#003fa3] font-medium">
              AI forecast updates every 10s · Based on last{" "}
              <span className="font-bold">5 transactions</span> per product · Higher accuracy with more sales data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
