import { InventoryItem } from "@workspace/api-client-react";
import { cn, formatCurrency } from "@/lib/utils";
import { AlertCircle, ArrowUpRight, PackageCheck } from "lucide-react";

interface Props {
  item: InventoryItem;
}

export function InventoryCard({ item }: Props) {
  const percentage = Math.min(100, Math.max(0, (item.currentStock / item.maxStock) * 100));
  
  const statusConfig = {
    safe: { color: "text-emerald-600", bg: "bg-emerald-500", lightBg: "bg-emerald-50", icon: PackageCheck, label: "Healthy" },
    low: { color: "text-amber-600", bg: "bg-amber-500", lightBg: "bg-amber-50", icon: AlertCircle, label: "Low Stock" },
    critical: { color: "text-rose-600", bg: "bg-rose-500", lightBg: "bg-rose-50", icon: AlertCircle, label: "Critical" },
  };

  const config = statusConfig[item.status];
  const StatusIcon = config.icon;

  return (
    <div className="bg-white rounded-2xl p-5 border border-border/50 shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-display font-semibold text-foreground text-lg">{item.name}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{formatCurrency(item.price)} / {item.unit}</p>
        </div>
        <div className={cn("px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5", config.lightBg, config.color)}>
          <StatusIcon className="w-3.5 h-3.5" />
          {config.label}
        </div>
      </div>

      <div className="mt-6">
        <div className="flex justify-between items-end mb-2">
          <div>
            <span className="text-3xl font-display font-bold text-foreground">{item.currentStock}</span>
            <span className="text-sm text-muted-foreground ml-1">/ {item.maxStock}</span>
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            Reorder at {item.reorderThreshold}
          </div>
        </div>
        
        <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden">
          <div 
            className={cn("h-full rounded-full transition-all duration-1000 ease-out", config.bg)}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
