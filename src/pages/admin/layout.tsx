import { Link, useLocation } from "wouter";
import { LayoutDashboard, Package, FolderOpen, ShoppingBag, Settings, Bug, LogOut } from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/collections", label: "Collections", icon: FolderOpen },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/admin/debug", label: "Debug", icon: Bug },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();

  function handleLogout() {
    sessionStorage.removeItem("wid-elle-token");
    navigate("/admin");
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-60 border-r border-border flex flex-col bg-sidebar">
        <div className="h-20 border-b border-sidebar-border flex items-center px-6">
          <Link href="/" className="font-serif italic text-2xl text-sidebar-primary">WID-ELLE</Link>
        </div>
        <nav className="flex-1 py-6 px-3">
          <p className="text-[10px] uppercase tracking-[0.2em] text-sidebar-foreground/40 px-3 mb-3">Admin Panel</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location === item.href || location.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 text-sm rounded-sm mb-0.5 transition-colors ${
                  active
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                }`}
                data-testid={`nav-${item.label.toLowerCase()}`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-sidebar-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-sm transition-colors"
            data-testid="button-logout"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
