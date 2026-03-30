import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, TrendingUp, Wallet, Settings, Bell } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Inventory", href: "/inventory", icon: Package },
    { name: "Predictions", href: "/predictions", icon: TrendingUp },
    { name: "Wallet", href: "/wallet", icon: Wallet },
    { name: "Alerts", href: "/alerts", icon: Bell },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <aside className="w-64 bg-white border-r border-border/50 hidden md:flex flex-col h-screen fixed top-0 left-0 z-20">
      <div className="h-20 flex items-center px-6 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl paytm-gradient p-2 flex items-center justify-center shadow-lg shadow-primary/20">
            <img 
              src={`${import.meta.env.BASE_URL}images/logo.png`} 
              alt="Paytm Smart-Stock" 
              className="w-full h-full object-contain brightness-0 invert" 
            />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight text-primary">Smart-Stock</h1>
            <p className="text-xs text-[#00baf2] font-medium tracking-wide">AI BY PAYTM</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary/5 text-primary font-semibold" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive ? "text-[#00baf2]" : "group-hover:scale-110"
              )} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 m-4 rounded-2xl ai-gradient text-white shadow-xl shadow-indigo-500/20">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-white/90" />
          <span className="font-display font-bold text-sm">AI Pro Active</span>
        </div>
        <p className="text-xs text-white/80 mb-3 leading-relaxed">
          Your inventory is automatically optimized for local events.
        </p>
        <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold backdrop-blur-md transition-colors">
          View Insights
        </button>
      </div>
    </aside>
  );
}
