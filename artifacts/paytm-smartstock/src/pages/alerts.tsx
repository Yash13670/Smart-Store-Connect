import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useGetInventory, useGetTransactions } from "@workspace/api-client-react";
import { Bell, AlertTriangle, TrendingDown, CheckCircle2, Clock, Package } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Alert {
  id: string;
  type: "low" | "critical" | "sale" | "restock";
  title: string;
  message: string;
  time: Date;
  product?: string;
}

export default function AlertsPage() {
  const { data: inventory } = useGetInventory();
  const { data: transactions } = useGetTransactions();

  // Build alerts from live inventory state
  const inventoryAlerts: Alert[] = (inventory ?? [])
    .filter(i => i.status !== "safe")
    .map(i => ({
      id: `inv-${i.id}`,
      type: i.status as "low" | "critical",
      title: i.status === "critical" ? `Critical: ${i.name}` : `Low Stock: ${i.name}`,
      message: `Only ${i.currentStock} units remaining. Reorder threshold is ${i.reorderThreshold}.`,
      time: new Date(),
      product: i.name,
    }));

  // Build alerts from recent transactions
  const transactionAlerts: Alert[] = (transactions ?? []).slice(0, 10).map(t => ({
    id: `txn-${t.id}`,
    type: "sale",
    title: `Sale Recorded`,
    message: `${t.quantity} unit${t.quantity > 1 ? "s" : ""} of ${t.productName} sold for ₹${t.total.toFixed(0)}.`,
    time: new Date(t.timestamp),
    product: t.productName,
  }));

  const allAlerts = [...inventoryAlerts, ...transactionAlerts].sort(
    (a, b) => b.time.getTime() - a.time.getTime()
  );

  const ALERT_CONFIG = {
    critical: { icon: TrendingDown, color: "text-rose-600",   bg: "bg-rose-50",   border: "border-rose-200",   label: "Critical" },
    low:      { icon: AlertTriangle, color: "text-amber-600",  bg: "bg-amber-50",  border: "border-amber-200",  label: "Low Stock" },
    sale:     { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50",border: "border-emerald-200",label: "Sale" },
    restock:  { icon: Package,      color: "text-primary",     bg: "bg-primary/10",border: "border-primary/20", label: "Restock" },
  };

  const criticalCount = inventoryAlerts.filter(a => a.type === "critical").length;
  const lowCount = inventoryAlerts.filter(a => a.type === "low").length;
  const safeCount = (inventory?.length ?? 0) - inventoryAlerts.length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">

          <div className="mb-2">
            <h1 className="text-2xl font-display font-bold">Smart Alerts</h1>
            <p className="text-muted-foreground mt-1">Real-time stock alerts and transaction events from your shop</p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Critical Alerts",   value: criticalCount, icon: TrendingDown,  color: "text-rose-600",    bg: "bg-rose-50" },
              { label: "Low Stock Alerts",  value: lowCount,      icon: AlertTriangle, color: "text-amber-600",   bg: "bg-amber-50" },
              { label: "Products Healthy",  value: safeCount,     icon: CheckCircle2,  color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map(s => (
              <div key={s.label} className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", s.bg)}>
                  <s.icon className={cn("w-6 h-6", s.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{s.label}</p>
                  <p className="text-2xl font-display font-bold">{s.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Live Inventory Status */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-primary" />
              Live Stock Status
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(inventory ?? []).map(item => {
                const cfg = item.status === "critical" ? ALERT_CONFIG.critical : item.status === "low" ? ALERT_CONFIG.low : { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", label: "Healthy" };
                const Icon = cfg.icon;
                const pct = Math.min(100, Math.round((item.currentStock / item.maxStock) * 100));
                return (
                  <div key={item.id} className={cn("flex items-center gap-4 p-4 rounded-xl border", cfg.bg, cfg.border)}>
                    <Icon className={cn("w-5 h-5 flex-shrink-0", cfg.color)} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm">{item.name}</span>
                        <span className={cn("text-xs font-bold", cfg.color)}>{cfg.label}</span>
                      </div>
                      <div className="w-full h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", item.status === "critical" ? "bg-rose-500" : item.status === "low" ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs mt-1 text-muted-foreground">{item.currentStock}/{item.maxStock} units ({pct}%)</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Alert Feed */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-5">
              <Bell className="w-5 h-5 text-muted-foreground" />
              Alert Feed
              <span className="ml-auto text-xs text-muted-foreground font-normal flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Auto-refreshes every 10s
              </span>
            </h2>

            {allAlerts.length === 0 ? (
              <div className="py-16 flex flex-col items-center justify-center text-muted-foreground gap-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                <p className="font-semibold">All Clear!</p>
                <p className="text-sm">No alerts right now. Your inventory is healthy.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {allAlerts.map(alert => {
                  const cfg = ALERT_CONFIG[alert.type];
                  const Icon = cfg.icon;
                  return (
                    <div key={alert.id} className={cn("flex items-start gap-4 p-4 rounded-xl border transition-all hover:shadow-sm", cfg.bg, cfg.border)}>
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/60")}>
                        <Icon className={cn("w-5 h-5", cfg.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className={cn("font-semibold text-sm", cfg.color)}>{alert.title}</p>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">{format(alert.time, "hh:mm a")}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
