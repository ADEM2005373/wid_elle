import { useGetOrderStats, useListOrders, useListProducts, useListCollections } from "@/lib/api-client";
import { motion } from "framer-motion";
import { TrendingUp, ShoppingBag, Package, FolderOpen } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useGetOrderStats();
  const { data: ordersData, isLoading: ordersLoading } = useListOrders();
  const { data: productsData } = useListProducts();
  const { data: collectionsData } = useListCollections();

  const orders = Array.isArray(ordersData)
    ? ordersData
    : Array.isArray((ordersData as any)?.orders)
    ? (ordersData as any).orders
    : [];

  const products = Array.isArray(productsData)
    ? productsData
    : Array.isArray((productsData as any)?.products)
    ? (productsData as any).products
    : [];

  const collections = Array.isArray(collectionsData)
    ? collectionsData
    : Array.isArray((collectionsData as any)?.collections)
    ? (collectionsData as any).collections
    : [];

  if (!Array.isArray(ordersData)) console.error("Admin orders is not an array", ordersData);
  if (!Array.isArray(productsData)) console.error("Admin products is not an array", productsData);
  if (!Array.isArray(collectionsData)) console.error("Admin collections is not an array", collectionsData);
  console.log("Admin orders:", orders);
  console.log("Admin products:", products);
  console.log("Admin collections:", collections);

  const recentOrders = Array.isArray(orders) ? orders.slice(0, 5) : [];

  const statCards = [
    { label: "Total Revenue", value: stats ? `${stats.revenue.toFixed(2)} TND` : "—", icon: TrendingUp, color: "text-accent" },
    { label: "Total Orders", value: stats?.total ?? "—", icon: ShoppingBag, color: "text-primary" },
    { label: "Products", value: products.length, icon: Package, color: "text-primary" },
    { label: "Collections", value: collections.length, icon: FolderOpen, color: "text-primary" },
  ];

  return (
    <div className="p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Welcome back</p>
        <h1 className="font-serif italic text-4xl text-primary mb-8">Dashboard</h1>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {statCards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="border border-border p-6"
                data-testid={`stat-${card.label.toLowerCase().replace(/\s/g, "-")}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">{card.label}</p>
                  <Icon size={16} className={card.color} />
                </div>
                {statsLoading && card.label.includes("Revenue") || statsLoading && card.label.includes("Orders") ? (
                  <div className="h-8 w-20 bg-secondary/50 animate-pulse" />
                ) : (
                  <p className="font-serif text-3xl text-primary">{card.value}</p>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Order status breakdown */}
        {stats && (
          <div className="border border-border p-6 mb-8">
            <h2 className="text-xs uppercase tracking-[0.2em] mb-6">Order Status Breakdown</h2>
            <div className="flex flex-wrap gap-4">
              {[
                { label: "Pending", value: stats.pending, color: "text-yellow-700 bg-yellow-50" },
                { label: "Confirmed", value: stats.confirmed, color: "text-blue-700 bg-blue-50" },
                { label: "Shipped", value: stats.shipped, color: "text-purple-700 bg-purple-50" },
                { label: "Delivered", value: stats.delivered, color: "text-green-700 bg-green-50" },
                { label: "Cancelled", value: stats.cancelled, color: "text-red-700 bg-red-50" },
              ].map((s) => (
                <div key={s.label} className={`px-4 py-2 text-sm ${s.color}`}>
                  <span className="font-medium">{s.value}</span> {s.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent orders */}
        <div className="border border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-xs uppercase tracking-[0.2em]">Recent Orders</h2>
          </div>
          {ordersLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 bg-secondary/50 animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground font-serif italic">No orders yet</div>
          ) : (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between px-6 py-4" data-testid={`order-row-${order.id}`}>
                  <div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-serif text-sm">{order.total.toFixed(2)} TND</p>
                    <span className={`text-xs px-2 py-0.5 ${statusColors[order.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
