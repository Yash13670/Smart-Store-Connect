import { Bell, Search, User } from "lucide-react";
import { useGetWallet } from "@workspace/api-client-react";
import { formatCurrency } from "@/lib/utils";

export function Header() {
  const { data: wallet, isLoading } = useGetWallet();

  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-border/50 flex items-center justify-between px-8 sticky top-0 z-10 w-full pl-8 md:pl-72">
      <div className="flex-1 flex items-center">
        <div className="relative w-full max-w-md hidden md:block">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search inventory, sales, predictions..." 
            className="w-full pl-10 pr-4 py-2.5 bg-muted/50 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all outline-none"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4 border-r border-border pr-6">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Wallet Balance</p>
            {isLoading ? (
              <div className="h-5 w-20 bg-muted animate-pulse rounded" />
            ) : (
              <p className="font-display font-bold text-primary">
                {formatCurrency(wallet?.balance || 0)}
              </p>
            )}
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <WalletIcon />
          </div>
        </div>

        <button className="relative p-2 text-muted-foreground hover:text-foreground transition-colors hover:bg-muted/50 rounded-full">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>

        <button className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:shadow-md transition-all">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

function WalletIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M16 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
