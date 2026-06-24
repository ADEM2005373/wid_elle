import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { Navbar } from "@/components/navbar";
import { CartDrawer } from "@/components/cart-drawer";
import { useState } from "react";
import { useCart } from "@/hooks/use-cart";

import HomePage from "@/pages/home";
import ProductPage from "@/pages/product";
import AdminLoginPage from "@/pages/admin/login";
import AdminDashboardPage from "@/pages/admin/dashboard";
import AdminProductsPage from "@/pages/admin/products";
import AdminCollectionsPage from "@/pages/admin/collections";
import AdminOrdersPage from "@/pages/admin/orders";
import AdminSettingsPage from "@/pages/admin/settings";
import AdminDebugPage from "@/pages/admin/debug";
import AdminLayout from "@/pages/admin/layout";

const queryClient = new QueryClient();

function isAuthenticated() {
  return !!sessionStorage.getItem("wid-elle-token");
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  if (!isAuthenticated()) {
    return <Redirect to="/admin" />;
  }
  return <Component />;
}

function StoreLayout() {
  const cart = useCart();
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar cartCount={cart.itemCount} onCartClick={() => setCartOpen(true)} />
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/product/:id" component={ProductPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} cart={cart} />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/admin" component={AdminLoginPage} />
      <Route path="/admin/dashboard">
        <AdminLayout><ProtectedRoute component={AdminDashboardPage} /></AdminLayout>
      </Route>
      <Route path="/admin/products">
        <AdminLayout><ProtectedRoute component={AdminProductsPage} /></AdminLayout>
      </Route>
      <Route path="/admin/collections">
        <AdminLayout><ProtectedRoute component={AdminCollectionsPage} /></AdminLayout>
      </Route>
      <Route path="/admin/orders">
        <AdminLayout><ProtectedRoute component={AdminOrdersPage} /></AdminLayout>
      </Route>
      <Route path="/admin/settings">
        <AdminLayout><ProtectedRoute component={AdminSettingsPage} /></AdminLayout>
      </Route>
      <Route path="/admin/debug">
        <AdminLayout><ProtectedRoute component={AdminDebugPage} /></AdminLayout>
      </Route>
      <Route component={StoreLayout} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
