import { useState } from "react";
import {
  useListOrders, useUpdateOrder, useDeleteOrder,
  getListOrdersQueryKey, getGetOrderStatsQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Eye, Trash2, Download, Printer } from "lucide-react";
import type { Order } from "@/lib/api-client";
import { motion } from "framer-motion";

const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: ordersData, isLoading } = useListOrders();
  const orders: Order[] = Array.isArray(ordersData)
    ? ordersData
    : Array.isArray((ordersData as any)?.orders)
    ? (ordersData as any).orders
    : [];

  if (!Array.isArray(ordersData)) console.error("Admin orders is not an array", ordersData);
  console.log("Admin orders:", orders);
  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetOrderStatsQueryKey() });
  }

  const filtered = filterStatus === "all" ? orders : (Array.isArray(orders) ? orders.filter((o) => o.status === filterStatus) : []);

  function handleStatusChange(orderId: string, status: string) {
    updateOrder.mutate(
      { id: orderId, data: { status } },
      {
        onSuccess: () => { toast({ title: "Status updated" }); invalidate(); if (selectedOrder?.id === orderId) setSelectedOrder((o) => o ? { ...o, status } : o); },
        onError: (err: unknown) => toast({ title: "Error", description: (err as Error).message, variant: "destructive" }),
      }
    );
  }

  function handleDelete(id: string) {
    deleteOrder.mutate(
      { id },
      {
        onSuccess: () => { toast({ title: "Order deleted" }); setDeleteId(null); if (selectedOrder?.id === id) setSelectedOrder(null); invalidate(); },
        onError: (err: unknown) => toast({ title: "Error", description: (err as Error).message, variant: "destructive" }),
      }
    );
  }

  function exportCSV() {
    const rows = [
      ["ID", "Customer", "Phone", "Address", "Total", "Status", "Date"],
      ...filtered.map((o) => [
        o.id, o.customerName, o.phone, `"${o.address}"`, (typeof o.total === "number" ? o.total : 0).toFixed(2), o.status,
        new Date(o.createdAt).toLocaleDateString(),
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wid-elle-orders-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div className="p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Manage</p>
            <h1 className="font-serif italic text-4xl text-primary">Orders</h1>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={exportCSV} className="gap-2 text-xs" data-testid="button-export-csv">
              <Download size={14} /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2 text-xs" data-testid="button-print">
              <Printer size={14} /> Print
            </Button>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {["all", ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`text-xs px-3 py-1.5 uppercase tracking-widest border transition-colors ${
                filterStatus === s ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary"
              }`}
              data-testid={`filter-${s}`}
            >
              {s}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => <div key={i} className="h-14 bg-secondary/50 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground font-serif italic text-xl">No orders found</div>
        ) : (
          <div className="border border-border">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-3 bg-secondary/30 text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
              <span>Customer</span><span>Total</span><span>Status</span><span>Date</span><span>Actions</span>
            </div>
            <div className="divide-y divide-border">
              {filtered.map((order) => (
                <div key={order.id} className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 px-5 py-4 items-center" data-testid={`order-row-${order.id}`}>
                  <div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">{order.phone}</p>
                  </div>
                  <p className="font-serif text-sm">{(typeof order.total === "number" ? order.total : 0).toFixed(2)} TND</p>
                  <Select value={order.status} onValueChange={(v) => handleStatusChange(order.id, v)}>
                    <SelectTrigger className={`text-xs w-28 border ${statusColors[order.status] ?? ""}`} data-testid={`select-status-${order.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString()}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)} className="text-xs" data-testid={`button-view-${order.id}`}>
                      <Eye size={12} />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDeleteId(order.id)} className="text-xs text-destructive border-destructive/30" data-testid={`button-delete-order-${order.id}`}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Order detail dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(o) => !o && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl">Order Detail</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Customer</p><p>{selectedOrder.customerName}</p></div>
                <div><p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Phone</p><p>{selectedOrder.phone}</p></div>
                <div className="col-span-2"><p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Address</p><p>{selectedOrder.address}</p></div>
                {selectedOrder.notes && <div className="col-span-2"><p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Notes</p><p>{selectedOrder.notes}</p></div>}
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Items</p>
                <div className="space-y-2">
                  {(Array.isArray(selectedOrder.items) ? selectedOrder.items : []).map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{item.quantity}× {item.productName}</span>
                      <span className="font-serif">{(item.price * item.quantity).toFixed(2)} TND</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
                  <span className="text-xs uppercase tracking-widest">Total</span>
                  <span className="font-serif text-xl">{(typeof selectedOrder.total === "number" ? selectedOrder.total : 0).toFixed(2)} TND</span>
                </div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Status</p>
                <Select value={selectedOrder.status} onValueChange={(v) => handleStatusChange(selectedOrder.id, v)}>
                  <SelectTrigger className={`border ${statusColors[selectedOrder.status] ?? ""}`}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl">Delete Order</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)} disabled={deleteOrder.isPending} data-testid="button-confirm-delete-order">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
