import { BrainCircuit, CloudRain, Sun, PartyPopper, TrendingUp } from "lucide-react";
import { GetPredictionsDayType } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";

interface Props {
  dayType: GetPredictionsDayType;
  setDayType: (dt: GetPredictionsDayType) => void;
}

const insights: Record<GetPredictionsDayType, {
  icon: React.ElementType;
  iconColor: string;
  badge: string;
  badgeColor: string;
  headline: string;
  body: string;
  products: string[];
}> = {
  [GetPredictionsDayType.normal]: {
    icon: Sun,
    iconColor: "text-amber-500",
    badge: "Normal Conditions",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
    headline: "Inventory is stable — weekend rush coming.",
    body: "Stock levels are healthy overall. Consider restocking Tea (16%) and Bread (20%) before peak hours. Predicted demand is within normal range across all products.",
    products: ["Tea", "Bread"],
  },
  [GetPredictionsDayType.rainy]: {
    icon: CloudRain,
    iconColor: "text-blue-500",
    badge: "Rainy Day Alert",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    headline: "Tea demand up 50% · Milk demand up 40% due to rainy conditions.",
    body: "Rain forecast detected. Customers tend to buy more hot beverages and dairy. Tea stock (currently 8 units) is critically low — immediate restock recommended before demand peaks.",
    products: ["Tea", "Milk"],
  },
  [GetPredictionsDayType.festival]: {
    icon: PartyPopper,
    iconColor: "text-pink-500",
    badge: "Festival Mode",
    badgeColor: "bg-pink-50 text-pink-700 border-pink-200",
    headline: "Bread up 60% · Biscuits up 70% for festival demand.",
    body: "Festival conditions active. Biscuits and Bread are top gifting items. Current stock may deplete by evening. Apply for an Instant Paytm Inventory Loan to restock without cash flow strain.",
    products: ["Bread", "Biscuits"],
  },
};

export function AiInsightBanner({ dayType, setDayType }: Props) {
  const insight = insights[dayType];
  const Icon = insight.icon;

  const conditionTabs = [
    { id: GetPredictionsDayType.normal,  label: "Normal",  icon: Sun },
    { id: GetPredictionsDayType.rainy,   label: "Rainy",   icon: CloudRain },
    { id: GetPredictionsDayType.festival,label: "Festival", icon: PartyPopper },
  ];

  return (
    <div className="relative rounded-2xl border border-[#00baf2]/20 overflow-hidden shadow-[0_2px_20px_rgba(0,87,184,0.08)]"
      style={{ background: "linear-gradient(135deg, #f0f6ff 0%, #e8f4ff 50%, #f5fbff 100%)" }}
    >
      {/* Subtle top accent line */}
      <div className="h-0.5 w-full" style={{ background: "linear-gradient(90deg, #002970, #00baf2, transparent)" }} />

      <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        {/* AI icon + content */}
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md"
            style={{ background: "linear-gradient(135deg, #002970, #00baf2)" }}
          >
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-bold tracking-widest uppercase text-[#002970]">AI Insight</span>
              <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full border", insight.badgeColor)}>
                <Icon className={cn("w-3 h-3 inline mr-1", insight.iconColor)} />
                {insight.badge}
              </span>
            </div>

            <p className="text-sm font-semibold text-[#002970] leading-snug">
              <TrendingUp className="w-3.5 h-3.5 inline mr-1 text-[#0057b8]" />
              {insight.headline}
            </p>
            <p className="text-xs text-[#4a6080] mt-0.5 leading-relaxed line-clamp-2">
              {insight.body}
            </p>
          </div>
        </div>

        {/* Condition selector tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/60 border border-[#c0d8f0]/60 backdrop-blur-sm flex-shrink-0">
          {conditionTabs.map(({ id, label, icon: TabIcon }) => {
            const active = dayType === id;
            return (
              <button
                key={id}
                onClick={() => setDayType(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200",
                  active
                    ? "text-white shadow-md"
                    : "text-[#4a6080] hover:text-[#002970] hover:bg-white/70"
                )}
                style={active ? { background: "linear-gradient(135deg, #002970, #0066cc)" } : undefined}
              >
                <TabIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
