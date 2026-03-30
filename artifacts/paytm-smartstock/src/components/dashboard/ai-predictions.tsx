import { useState } from "react";
import { useGetPredictions, GetPredictionsDayType } from "@workspace/api-client-react";
import { CloudRain, Sun, PartyPopper, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function AiPredictions() {
  const [dayType, setDayType] = useState<GetPredictionsDayType>(GetPredictionsDayType.normal);
  const { data: predictions, isLoading } = useGetPredictions({ dayType });

  const types = [
    { id: GetPredictionsDayType.normal, label: "Normal Day", icon: Sun, color: "text-orange-500" },
    { id: GetPredictionsDayType.rainy, label: "Rainy Day", icon: CloudRain, color: "text-blue-500" },
    { id: GetPredictionsDayType.festival, label: "Festival Day", icon: PartyPopper, color: "text-pink-500" },
  ];

  return (
    <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            <h2 className="font-display font-bold text-lg">AI Demand Forecast</h2>
          </div>
          <p className="text-sm text-muted-foreground mt-1">Predictive stock requirements based on conditions</p>
        </div>

        <div className="flex p-1 bg-muted rounded-xl">
          {types.map((type) => (
            <button
              key={type.id}
              onClick={() => setDayType(type.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all duration-200",
                dayType === type.id 
                  ? "bg-white shadow-sm text-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/50"
              )}
            >
              <type.icon className={cn("w-4 h-4", dayType === type.id && type.color)} />
              <span className="hidden xl:inline">{type.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {predictions?.map((pred) => (
              <div key={pred.productId} className="flex items-center justify-between p-4 rounded-xl border border-border/50 hover:border-indigo-500/30 hover:bg-indigo-50/30 transition-all">
                <div>
                  <h4 className="font-semibold text-foreground">{pred.productName}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                      Burn: {pred.burnRate}/hr
                    </span>
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md font-medium">
                      {pred.confidence} confidence
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground mb-1">Expected Demand</p>
                  <p className="font-display font-bold text-xl text-primary flex items-center gap-1 justify-end">
                    {pred.predictedDemand}
                    {pred.weatherMultiplier > 1 && (
                      <span className="text-xs text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded-md ml-1">
                        +{Math.round((pred.weatherMultiplier - 1) * 100)}%
                      </span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
