import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useGetWallet, useGetTransactions, useApproveLoan } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Wallet, TrendingUp, ArrowDownLeft, Zap, CheckCircle2, IndianRupee, CreditCard, Clock } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const LOAN_AMOUNTS = [500, 1000, 2000, 5000];

export default function WalletPage() {
  const { data: wallet, isLoading: walletLoading } = useGetWallet();
  const { data: transactions, isLoading: txLoading } = useGetTransactions();
  const { mutate: approveLoan, isPending: loanPending } = useApproveLoan();
  const queryClient = useQueryClient();

  const [selectedLoan, setSelectedLoan] = useState<number | null>(null);
  const [loanSuccess, setLoanSuccess] = useState(false);

  const totalRevenue = transactions?.reduce((s, t) => s + t.total, 0) ?? 0;
  const todayRevenue = transactions?.filter(t => {
    const d = new Date(t.timestamp);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  }).reduce((s, t) => s + t.total, 0) ?? 0;

  const handleLoan = () => {
    if (!selectedLoan) return;
    approveLoan(
      { data: { amount: selectedLoan } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/wallet"] });
          setLoanSuccess(true);
          setTimeout(() => { setLoanSuccess(false); setSelectedLoan(null); }, 3000);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex font-sans">
      <Sidebar />
      <main className="flex-1 md:ml-64 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full space-y-6">

          <div className="mb-2">
            <h1 className="text-2xl font-display font-bold">Wallet & Financing</h1>
            <p className="text-muted-foreground mt-1">Track your balance, revenue, and access instant inventory loans</p>
          </div>

          {/* Balance Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-[#002970] via-[#004fb3] to-[#00baf2] rounded-3xl p-8 text-white shadow-2xl shadow-primary/30">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2 text-white/70 text-sm font-medium">
                <Wallet className="w-4 h-4" />
                Paytm Business Wallet
              </div>
              {walletLoading ? (
                <div className="h-12 w-40 bg-white/20 animate-pulse rounded-xl" />
              ) : (
                <p className="text-5xl font-display font-bold tracking-tight">₹{wallet?.balance?.toLocaleString("en-IN")}</p>
              )}
              <p className="text-white/60 mt-2 text-sm">Available Balance • {wallet?.currency ?? "INR"}</p>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Revenue", value: `₹${totalRevenue.toFixed(0)}`, icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Today's Revenue", value: `₹${todayRevenue.toFixed(0)}`, icon: IndianRupee, color: "text-primary", bg: "bg-primary/10" },
              { label: "Transactions", value: transactions?.length ?? 0, icon: ArrowDownLeft, color: "text-violet-600", bg: "bg-violet-50" },
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Instant Loan */}
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-5 h-5 text-indigo-500" />
                <h2 className="font-display font-bold text-lg">Instant Paytm Inventory Loan</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-5">Pre-approved credit, zero interest for 7 days. Fund your restock instantly.</p>

              {loanSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3 text-emerald-600">
                  <CheckCircle2 className="w-12 h-12" />
                  <p className="font-semibold text-lg">Loan Approved!</p>
                  <p className="text-sm text-muted-foreground">Balance updated successfully.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    {LOAN_AMOUNTS.map(amount => (
                      <button
                        key={amount}
                        onClick={() => setSelectedLoan(amount === selectedLoan ? null : amount)}
                        className={cn(
                          "py-3 px-4 rounded-xl border-2 font-semibold text-sm transition-all",
                          selectedLoan === amount
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border/50 text-muted-foreground hover:border-border hover:bg-muted/30"
                        )}
                      >
                        ₹{amount.toLocaleString("en-IN")}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={handleLoan}
                    disabled={!selectedLoan || loanPending}
                    className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-[#002970] to-[#00baf2] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-xl hover:-translate-y-0.5 transition-all"
                  >
                    {loanPending ? "Processing..." : selectedLoan ? `Approve ₹${selectedLoan.toLocaleString("en-IN")} Loan` : "Select an amount"}
                  </button>
                  <p className="text-xs text-muted-foreground text-center mt-3 flex items-center justify-center gap-1">
                    <CreditCard className="w-3.5 h-3.5" /> Auto-repaid from your daily sales
                  </p>
                </>
              )}
            </div>

            {/* Transaction History */}
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
              <h2 className="font-display font-bold text-lg flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-muted-foreground" />
                Recent Transactions
              </h2>
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {txLoading
                  ? [1,2,3].map(i => <div key={i} className="h-14 bg-muted/40 animate-pulse rounded-xl" />)
                  : transactions?.length === 0
                  ? <p className="text-center text-muted-foreground py-8 text-sm">No transactions yet. Simulate a sale!</p>
                  : transactions?.slice(0, 15).map(t => (
                      <div key={t.id} className="flex items-center justify-between p-3 rounded-xl border border-border/40 hover:bg-muted/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <ArrowDownLeft className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{t.productName}</p>
                            <p className="text-xs text-muted-foreground">{t.quantity} units • {format(new Date(t.timestamp), "hh:mm a")}</p>
                          </div>
                        </div>
                        <span className="font-display font-bold text-emerald-600 text-sm">+₹{t.total.toFixed(0)}</span>
                      </div>
                    ))
                }
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
