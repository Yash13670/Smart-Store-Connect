import { Link } from "wouter";
import { Bell, User, Wifi } from "lucide-react";
import { useGetWallet, useGetInventory } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";

export function Header() {
  const { data: wallet, isLoading } = useGetWallet();
  const { data: inventory } = useGetInventory();

  const alertCount = inventory?.filter(i => i.status !== "safe").length ?? 0;

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-6 sticky top-0 z-10 w-full md:pl-72">
      {/* Real-time indicator */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Wifi className="w-4 h-4 text-emerald-500" />
        <span className="hidden sm:inline text-emerald-600 font-medium">Live</span>
        <span className="hidden sm:inline">· Refreshing every 10s</span>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Wallet Balance */}
        <Link href="/wallet" className="flex items-center gap-2.5 border-r border-border pr-4 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide mb-0.5">Wallet Balance</p>
            {isLoading ? (
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
            ) : (
              <p className="font-display font-bold text-[#002970] text-lg leading-none group-hover:text-[#0057b8] transition-colors">
                {formatCurrency(wallet?.balance || 0)}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full paytm-btn flex items-center justify-center flex-shrink-0">
            <WalletIcon className="text-white" />
          </div>
        </Link>

        {/* Alerts Bell */}
        <Link href="/alerts" className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 rounded-full">
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-amber-500 rounded-full border-2 border-white text-white text-[9px] font-bold flex items-center justify-center">
              {alertCount}
            </span>
          )}
        </Link>

        {/* User Avatar */}
        <Link href="/settings" className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:shadow-md transition-all cursor-pointer">
          <User className="w-5 h-5" />
        </Link>
      </div>
    </header>
  );
}

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z"/>
      <path d="M16 12H18"/>
    </svg>
  );
}
