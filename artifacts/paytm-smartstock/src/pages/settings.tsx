import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useGetInventory, useUpdateInventory } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Settings, Store, Bell, RefreshCw, Shield, Save, CheckCircle2, Package } from "lucide-react";
import { cn } from "@/lib/utils";

function ThresholdEditor({ item }: { item: any }) {
  const [threshold, setThreshold] = useState(item.reorderThreshold);
  const [saved, setSaved] = useState(false);
  const { mutate: update, isPending } = useUpdateInventory();
  const queryClient = useQueryClient();

  const handleSave = () => {
    update(
      { productId: item.id, data: { stock: item.currentStock } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/inventory"] });
          setSaved(true);
          setTimeout(() => setSaved(false), 2000);
        },
      }
    );
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl border border-border/40 bg-muted/20 hover:bg-muted/40 transition-colors">
      <Package className="w-5 h-5 text-primary flex-shrink-0" />
      <span className="font-semibold text-sm flex-1">{item.name}</span>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Reorder at:</span>
        <input
          type="number"
          value={threshold}
          min={1}
          max={item.maxStock}
          onChange={e => setThreshold(Number(e.target.value))}
          className="w-16 px-2 py-1 border border-border rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <span className="text-xs text-muted-foreground">units</span>
        <button
          onClick={handleSave}
          disabled={isPending}
          className={cn(
            "flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
            saved ? "bg-emerald-100 text-emerald-700" : "bg-primary/10 text-primary hover:bg-primary/20"
          )}
        >
          {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
          {saved ? "Saved" : "Save"}
        </button>
      </div>
    </div>
  );
}

const TOGGLE = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
  <button
    onClick={onChange}
    className={cn(
      "relative inline-flex w-11 h-6 rounded-full transition-colors focus:outline-none",
      checked ? "bg-primary" : "bg-muted"
    )}
  >
    <span className={cn(
      "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform",
      checked ? "translate-x-5" : "translate-x-0"
    )} />
  </button>
);

export default function SettingsPage() {
  const { data: inventory } = useGetInventory();

  const [notifications, setNotifications] = useState({
    lowStock: true,
    criticalStock: true,
    reorderConfirm: true,
    dailySummary: false,
    salesMilestone: true,
  });

  const [refreshInterval, setRefreshInterval] = useState("10");
  const [shopName, setShopName] = useState("My Smart Shop");
  const [shopOwner, setShopOwner] = useState("Shopkeeper");

  const toggleNotif = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full space-y-6">

          <div className="mb-2">
            <h1 className="text-2xl font-display font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Configure your shop preferences and notification rules</p>
          </div>

          {/* Shop Profile */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <h2 className="font-display font-bold text-base flex items-center gap-2 mb-5">
              <Store className="w-5 h-5 text-primary" /> Shop Profile
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Shop Name", value: shopName, onChange: setShopName, placeholder: "e.g. Sharma Provisions" },
                { label: "Owner Name", value: shopOwner, onChange: setShopOwner, placeholder: "e.g. Ramesh Sharma" },
              ].map(field => (
                <div key={field.label}>
                  <label className="text-sm font-semibold block mb-1.5">{field.label}</label>
                  <input
                    type="text"
                    value={field.value}
                    onChange={e => field.onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all bg-muted/30"
                  />
                </div>
              ))}
            </div>
            <button className="mt-4 flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </div>

          {/* Reorder Thresholds */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <h2 className="font-display font-bold text-base flex items-center gap-2 mb-1">
              <Package className="w-5 h-5 text-primary" /> Reorder Thresholds
            </h2>
            <p className="text-sm text-muted-foreground mb-5">Set the stock level at which low-stock alerts are triggered per product.</p>
            <div className="space-y-3">
              {(inventory ?? []).map(item => (
                <ThresholdEditor key={item.id} item={item} />
              ))}
              {!inventory && [1,2,3,4].map(i => (
                <div key={i} className="h-14 bg-muted/40 animate-pulse rounded-xl" />
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <h2 className="font-display font-bold text-base flex items-center gap-2 mb-5">
              <Bell className="w-5 h-5 text-primary" /> Alert Notifications
            </h2>
            <div className="space-y-4">
              {[
                { key: "lowStock",        label: "Low Stock Alert",      desc: "Triggered when stock falls below threshold" },
                { key: "criticalStock",   label: "Critical Stock Alert", desc: "Triggered when stock is critically low (below 50% threshold)" },
                { key: "reorderConfirm",  label: "Reorder Confirmation", desc: "Show confirmation before placing a reorder" },
                { key: "dailySummary",    label: "Daily Sales Summary",  desc: "Get a summary of today's sales (coming soon)" },
                { key: "salesMilestone",  label: "Sales Milestones",     desc: "Alert when you hit revenue milestones" },
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between py-3 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-semibold">{item.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                  </div>
                  <TOGGLE checked={notifications[item.key as keyof typeof notifications]} onChange={() => toggleNotif(item.key as keyof typeof notifications)} />
                </div>
              ))}
            </div>
          </div>

          {/* Data Refresh */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <h2 className="font-display font-bold text-base flex items-center gap-2 mb-1">
              <RefreshCw className="w-5 h-5 text-primary" /> Real-Time Refresh
            </h2>
            <p className="text-sm text-muted-foreground mb-4">How often the dashboard polls for updated data.</p>
            <div className="flex gap-3 flex-wrap">
              {["5", "10", "30", "60"].map(s => (
                <button
                  key={s}
                  onClick={() => setRefreshInterval(s)}
                  className={cn(
                    "px-4 py-2 rounded-xl border-2 text-sm font-semibold transition-all",
                    refreshInterval === s ? "border-primary bg-primary/5 text-primary" : "border-border/50 text-muted-foreground hover:border-border"
                  )}
                >
                  Every {s}s
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" /> Currently polling every 10 seconds (applied globally)
            </p>
          </div>

          {/* About */}
          <div className="bg-gradient-to-br from-[#002970] to-[#00baf2] rounded-2xl p-6 text-white">
            <h2 className="font-display font-bold text-base flex items-center gap-2 mb-2">
              <Settings className="w-5 h-5" /> About Smart-Stock AI
            </h2>
            <p className="text-sm text-white/80 leading-relaxed">
              Paytm Smart-Stock AI is a virtual supply chain manager for small shopkeepers. It uses real transaction data to predict demand, alert on low stock, and help you reorder — all powered by AI and the Paytm ecosystem.
            </p>
            <div className="mt-4 flex gap-4 text-xs text-white/60">
              <span>Version 1.0</span>
              <span>•</span>
              <span>Paytm Business Suite</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
