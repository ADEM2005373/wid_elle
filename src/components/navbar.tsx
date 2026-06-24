import { Link, useLocation } from "wouter";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  cartCount?: number;
  onCartClick?: () => void;
}

export function Navbar({ cartCount = 0, onCartClick }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [location] = useLocation();

  const isAdmin = location.startsWith("/admin");
  if (isAdmin) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <nav className="hidden md:flex items-center gap-10">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            Home
          </Link>
          <Link
            href="/?section=collections"
            className="text-xs uppercase tracking-[0.2em] font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            Collections
          </Link>
          <Link
            href="/?section=products"
            className="text-xs uppercase tracking-[0.2em] font-medium text-foreground/70 hover:text-primary transition-colors"
          >
            Boutique
          </Link>
        </nav>

        <Link
          href="/"
          className="text-3xl font-serif italic text-primary tracking-wide absolute left-1/2 -translate-x-1/2"
        >
          WID-ELLE
        </Link>

        <div className="flex items-center gap-6">
          <button
            onClick={onCartClick}
            className="relative flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-medium text-foreground/70 hover:text-primary transition-colors"
            data-testid="button-cart"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 flex items-center justify-center text-[10px] bg-primary text-primary-foreground rounded-full">
                {cartCount}
              </span>
            )}
          </button>
          <button
            className="md:hidden text-primary"
            onClick={() => setMenuOpen(!menuOpen)}
            data-testid="button-menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background px-6 py-6 flex flex-col gap-5">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-xs uppercase tracking-[0.2em] font-medium">
            Home
          </Link>
          <Link href="/?section=collections" onClick={() => setMenuOpen(false)} className="text-xs uppercase tracking-[0.2em] font-medium">
            Collections
          </Link>
          <Link href="/?section=products" onClick={() => setMenuOpen(false)} className="text-xs uppercase tracking-[0.2em] font-medium">
            Boutique
          </Link>
        </div>
      )}
    </header>
  );
}
