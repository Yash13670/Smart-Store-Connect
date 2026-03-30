import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useGetInventory, useUpdateInventory } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Package, Edit3, Save, X, TrendingDown, AlertTriangle, CheckCircle2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS_CONFIG = {
  safe:     { label: "Healthy",    color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200", icon: CheckCircle2, dot: "bg-emerald-500" },
  low:      { label: "Low Stock",  color: "text-amber-600",   bg: "bg-amber-50 border-amber-200",   icon: AlertTriangle, dot: "bg-amber-500" },
  critical: { label: "Critical",   color: "text-rose-600",    bg: "bg-rose-50 border-rose-200",    icon: TrendingDown,  dot: "bg-rose-500" },
};

function EditableStockRow({ item }: { item: any }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(item.currentStock);
  const { mutate: updateStock, isPending } = useUpdateInventory();
  const queryClient = useQueryClient();

  const cfg = STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.safe;
  const StatusIcon = cfg.icon;
  const pct = Math.min(100, Math.round((item.currentStock / item.maxStock) * 100));

  const handleSave = () => {
    updateStock(
      { productId: item.id, data: { stock: value } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
          setEditing(false);
        },
      }
    );
  };

  const handleRestock = () => {
    updateStock(
      { productId: item.id, data: { stock: item.maxStock } },
      { onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/inventory"] }) }
    );
  };

  return (
    <tr className="border-b border-border/40 hover:bg-muted/30 transition-colors group">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className={cn("w-2 h-2 rounded-full", cfg.dot)} />
          <span className="font-semibold text-foreground">{item.name}</span>
        </div>
      </td>
      <td className="px-6 py-4">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={value}
              min={0}
              max={item.maxStock}
              onChange={(e) => setValue(Number(e.target.value))}
              className="w-20 px-2 py-1 border border-primary rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/30"
              autoFocus
            />
          </div>
        ) : (
          <span className="font-display font-bold text-lg">{item.currentStock}</span>
        )}
      </td>
      <td className="px-6 py-4 text-muted-foreground">{item.reorderThreshold}</td>
      <td className="px-6 py-4 text-muted-foreground">{item.maxStock}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-28 h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={cn("h-full rounded-full transition-all", item.status === "safe" ? "bg-emerald-500" : item.status === "low" ? "bg-amber-500" : "bg-rose-500")}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">{pct}%</span>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className={cn("inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border", cfg.bg, cfg.color)}>
          <StatusIcon className="w-3 h-3" />
          {cfg.label}
        </span>
      </td>
      <td className="px-6 py-4 text-muted-foreground text-sm">₹{item.price}/{item.unit}</td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={isPending} className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors">
                <Save className="w-4 h-4" />
              </button>
              <button onClick={() => { setEditing(false); setValue(item.currentStock); }} className="p-1.5 bg-rose-100 text-rose-700 rounded-lg hover:bg-rose-200 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)} className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors" title="Edit stock">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={handleRestock} className="p-1.5 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors" title="Restock to max">
                <RotateCcw className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function InventoryPage() {
  const { data: inventory, isLoading } = useGetInventory();

  const total = inventory?.reduce((s, i) => s + i.currentStock, 0) ?? 0;
  const lowCount = inventory?.filter(i => i.status !== "safe").length ?? 0;
  const totalValue = inventory?.reduce((s, i) => s + i.currentStock * i.price, 0) ?? 0;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          <div className="mb-6">
            <h1 className="text-2xl font-display font-bold">Inventory Management</h1>
            <p className="text-muted-foreground mt-1">View and manually update your stock levels</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {[
              { label: "Total Units", value: total, icon: Package, color: "text-primary", bg: "bg-primary/10" },
              { label: "Low / Critical", value: lowCount, icon: AlertTriangle, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "Stock Value", value: `₹${totalValue.toFixed(0)}`, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50" },
            ].map(stat => (
              <div key={stat.label} className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="text-2xl font-display font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-border/50">
              <h2 className="font-display font-bold text-lg flex items-center gap-2">
                <Package className="w-5 h-5 text-primary" />
                All Products
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Click the edit icon to update stock. Click ↺ to restock to maximum.</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-muted/30">
                    {["Product", "Current Stock", "Reorder At", "Max Stock", "Level", "Status", "Price", "Actions"].map(h => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? [1,2,3,4].map(i => (
                        <tr key={i} className="border-b border-border/40">
                          {[1,2,3,4,5,6,7,8].map(j => (
                            <td key={j} className="px-6 py-4"><div className="h-4 bg-muted/50 rounded animate-pulse" /></td>
                          ))}
                        </tr>
                      ))
                    : inventory?.map(item => <EditableStockRow key={item.id} item={item} />)
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
