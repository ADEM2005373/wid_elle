import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Minus, Plus, X } from "lucide-react";
import { useState } from "react";
import { useCart, CartItem } from "@/hooks/use-cart";
import { useCreateOrder } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { getListOrdersQueryKey, getGetOrderStatsQueryKey } from "@/lib/api-client";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
  cart: ReturnType<typeof useCart>;
}

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Name is required"),
  phone: z.string().min(8, "Phone number is required"),
  address: z.string().min(5, "Address is required"),
  notes: z.string().optional(),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

function ProductImage({ image, name }: { image?: string | null; name: string }) {
  if (image && image.startsWith("data:")) {
    return <img src={image} alt={name} className="w-full h-full object-cover" />;
  }
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#F2D7D5] to-[#C9848A] flex items-center justify-center">
      <span className="text-xs font-serif italic text-white/70">{name[0]}</span>
    </div>
  );
}

export function CartDrawer({ open, onClose, cart }: CartDrawerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const createOrder = useCreateOrder();
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { customerName: "", phone: "", address: "", notes: "" },
  });

  const onSubmit = (data: CheckoutForm) => {
    createOrder.mutate(
      {
        data: {
          customerName: data.customerName,
          phone: data.phone,
          address: data.address,
          notes: data.notes ?? null,
          items: cart.items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            quantity: i.quantity,
            price: i.price,
            image: i.image ?? null,
          })),
          total: cart.total,
        },
      },
      {
        onSuccess: () => {
          cart.clearCart();
          setCheckoutOpen(false);
          setSuccessOpen(true);
          form.reset();
          queryClient.invalidateQueries({ queryKey: getListOrdersQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetOrderStatsQueryKey() });
        },
        onError: (err: unknown) => {
          toast({ title: "Order failed", description: (err as Error).message, variant: "destructive" });
        },
      }
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
        <SheetContent className="w-full sm:max-w-md flex flex-col" data-testid="cart-drawer">
          <SheetHeader className="border-b border-border pb-4">
            <SheetTitle className="font-serif italic text-2xl">Your Selection</SheetTitle>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto py-6">
            {cart.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="font-serif italic text-xl text-muted-foreground">Your cart is empty</p>
                <p className="text-sm text-muted-foreground mt-2 uppercase tracking-widest">Discover our collection</p>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex gap-4" data-testid={`cart-item-${item.productId}`}>
                    <div className="w-20 h-20 flex-shrink-0 overflow-hidden">
                      <ProductImage image={item.image} name={item.productName} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif text-sm">{item.productName}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.price.toFixed(2)} TND</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button
                          onClick={() => cart.updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 flex items-center justify-center border border-border hover:bg-secondary transition-colors"
                          data-testid={`button-decrease-${item.productId}`}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="text-sm w-4 text-center">{item.quantity}</span>
                        <button
                          onClick={() => cart.updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 flex items-center justify-center border border-border hover:bg-secondary transition-colors"
                          data-testid={`button-increase-${item.productId}`}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => cart.removeItem(item.productId)}
                      className="text-muted-foreground hover:text-primary transition-colors"
                      data-testid={`button-remove-${item.productId}`}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cart.items.length > 0 && (
            <div className="border-t border-border pt-6 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest">Total</span>
                <span className="font-serif text-xl">{cart.total.toFixed(2)} TND</span>
              </div>
              <Button
                className="w-full uppercase tracking-[0.2em] text-xs h-12"
                onClick={() => { onClose(); setCheckoutOpen(true); }}
                data-testid="button-checkout"
              >
                Proceed to Order
              </Button>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl">Complete Your Order</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest">Full Name</FormLabel>
                    <FormControl><Input placeholder="Your name" {...field} data-testid="input-name" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest">Phone</FormLabel>
                    <FormControl><Input placeholder="+216 XX XXX XXX" {...field} data-testid="input-phone" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest">Delivery Address</FormLabel>
                    <FormControl><Textarea placeholder="Your full address" {...field} data-testid="input-address" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest">Notes (optional)</FormLabel>
                    <FormControl><Textarea placeholder="Special requests..." {...field} data-testid="input-notes" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="border-t border-border pt-4 flex justify-between items-center">
                <span className="text-xs uppercase tracking-widest">Total</span>
                <span className="font-serif text-xl">{cart.total.toFixed(2)} TND</span>
              </div>
              <Button
                type="submit"
                className="w-full uppercase tracking-[0.2em] text-xs h-12"
                disabled={createOrder.isPending}
                data-testid="button-submit-order"
              >
                {createOrder.isPending ? "Placing Order..." : "Place Order"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={successOpen} onOpenChange={setSuccessOpen}>
        <DialogContent className="sm:max-w-sm text-center">
          <div className="py-6">
            <div className="w-16 h-16 mx-auto mb-6 border border-primary flex items-center justify-center">
              <span className="text-2xl font-serif italic text-primary">W</span>
            </div>
            <h2 className="font-serif italic text-2xl mb-2">Order Confirmed</h2>
            <p className="text-sm text-muted-foreground">
              Thank you for your order. We will contact you shortly to confirm delivery.
            </p>
            <Button className="mt-6 uppercase tracking-[0.2em] text-xs" onClick={() => setSuccessOpen(false)}>
              Continue Shopping
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
