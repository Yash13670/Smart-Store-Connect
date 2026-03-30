import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, TrendingUp, Wallet, Settings, Bell } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { name: "Dashboard",   href: "/",           icon: LayoutDashboard },
    { name: "Inventory",   href: "/inventory",  icon: Package },
    { name: "Predictions", href: "/predictions",icon: TrendingUp },
    { name: "Wallet",      href: "/wallet",     icon: Wallet },
    { name: "Alerts",      href: "/alerts",     icon: Bell },
    { name: "Settings",    href: "/settings",   icon: Settings },
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
          const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "sidebar-active text-white font-semibold"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground font-medium"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive ? "text-white" : "group-hover:scale-110"
              )} />
              {item.name}
              {item.name === "Alerts" && (
                <span className="ml-auto w-2 h-2 bg-amber-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* AI Insights panel — links to Predictions page */}
      <Link href="/predictions" className="block p-4 m-4 rounded-2xl cursor-pointer hover:opacity-90 transition-opacity" style={{ background: "linear-gradient(135deg, #002970 0%, #0057b8 55%, #00baf2 100%)", boxShadow: "0 8px 24px rgba(0,87,184,0.35)" }}>
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp className="w-5 h-5 text-white/90" />
          <span className="font-display font-bold text-sm text-white">AI Pro Active</span>
          <span className="ml-auto w-2 h-2 bg-[#00baf2] rounded-full animate-pulse shadow-sm shadow-[#00baf2]/50" />
        </div>
        <p className="text-xs text-white/75 mb-3 leading-relaxed">
          Demand forecasts update with weather &amp; festival conditions.
        </p>
        <div className="w-full py-2 bg-white/15 hover:bg-white/25 border border-white/20 rounded-lg text-xs font-bold text-white backdrop-blur-md transition-colors text-center tracking-wide">
          View AI Insights →
        </div>
      </Link>
    </aside>
  );
}
