import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { InventoryCard } from "@/components/dashboard/inventory-card";
import { AiPredictions } from "@/components/dashboard/ai-predictions";
import { TransactionSimulator } from "@/components/dashboard/transaction-simulator";
import { SalesChart } from "@/components/dashboard/sales-chart";
import { SmartAlertModal } from "@/components/dashboard/smart-alert-modal";
import { useGetInventory, StockAlert } from "@workspace/api-client-react";
import { useSmartAlert } from "@/hooks/use-smart-alert";

export default function Dashboard() {
  const { data: inventory, isLoading: inventoryLoading } = useGetInventory();
  const { activeAlert, triggerAlert, dismissAlert } = useSmartAlert();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-foreground flex font-sans">
      <Sidebar />
      
      <main className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Header />
        
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-8">
          
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            
            {/* Left Column - Main Dashboard */}
            <div className="xl:col-span-8 space-y-8">
              
              {/* Inventory Live Cards */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-display font-bold">Live Inventory</h2>
                    <p className="text-sm text-muted-foreground">Real-time stock levels across your shop</p>
                  </div>
                </div>
                
                {inventoryLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-40 bg-white/50 animate-pulse rounded-2xl border border-border/50" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {inventory?.map(item => (
                      <InventoryCard key={item.id} item={item} />
                    ))}
                  </div>
                )}
              </section>

              {/* AI Prediction Section */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-display font-bold">AI Intelligence</h2>
                    <span className="text-[11px] font-bold tracking-widest uppercase px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#002970] to-[#00baf2] text-white shadow-sm">
                      Pro
                    </span>
                  </div>
                  <div className="flex-1 h-px bg-gradient-to-r from-[#00baf2]/30 to-transparent" />
                </div>
                <AiPredictions />
              </section>

              {/* Chart Section */}
              <section>
                <SalesChart />
              </section>
            </div>

            {/* Right Column - Actions & Simulation */}
            <div className="xl:col-span-4 flex flex-col h-full space-y-8">
              <div className="sticky top-28">
                <TransactionSimulator onAlertTriggered={triggerAlert} />
              </div>
            </div>
            
          </div>
        </div>
      </main>

      <SmartAlertModal alert={activeAlert} onClose={dismissAlert} />
    </div>
  );
}
