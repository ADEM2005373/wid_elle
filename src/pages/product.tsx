import { useRoute, Link } from "wouter";
import { useGetProduct, useListProducts } from "@/lib/api-client";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, Minus } from "lucide-react";

function ProductImage({ image, name }: { image?: string | null; name: string }) {
  if (image && image.startsWith("data:")) {
    return <img src={image} alt={name} className="w-full h-full object-cover" />;
  }
  const colors = [
    "from-[#F2D7D5] to-[#C9848A]",
    "from-[#C9848A] to-[#7B4A5A]",
    "from-[#C4A882] to-[#C9848A]",
    "from-[#7B4A5A] to-[#C9848A]",
  ];
  const colorClass = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-full h-full bg-gradient-to-br ${colorClass} flex items-end justify-start p-8`}>
      <span className="font-serif italic text-white/80 text-3xl leading-tight">{name}</span>
    </div>
  );
}

export default function ProductPage() {
  const [, params] = useRoute("/product/:id");
  const { toast } = useToast();
  const cart = useCart();
  const [qty, setQty] = useState(1);

  const { data: product, isLoading, error } = useGetProduct(params?.id ?? "", {
    query: { enabled: !!params?.id, queryKey: [`/api/products/${params?.id ?? ""}`] },
  });
  const { data: related = [] } = useListProducts();

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div className="h-[70vh] bg-secondary/50 animate-pulse" />
          <div className="space-y-6 pt-8">
            <div className="h-8 w-2/3 bg-secondary/50 animate-pulse" />
            <div className="h-6 w-1/3 bg-secondary/50 animate-pulse" />
            <div className="h-32 bg-secondary/50 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-32 text-center">
        <h1 className="font-serif italic text-3xl text-muted-foreground">Product not found</h1>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest hover:text-primary transition-colors">
          <ArrowLeft size={14} /> Return to boutique
        </Link>
      </div>
    );
  }

  function handleAddToCart() {
    cart.addItem({ productId: product!.id, productName: product!.name, price: product!.price, image: product!.image }, qty);
    toast({ title: "Added to selection", description: `${qty}× ${product!.name}` });
  }

  const relatedProducts = related.filter((p) => p.id !== product.id && p.collection === product.collection).slice(0, 4);

  return (
    <div className="min-h-screen">
      {/* Back */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <Link href="/" className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors w-fit">
          <ArrowLeft size={14} /> Boutique
        </Link>
      </div>

      {/* Product */}
      <div className="max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="h-[70vh] overflow-hidden"
          >
            <ProductImage image={product.image} name={product.name} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="flex flex-col justify-center"
          >
            {product.badge && (
              <p className="text-xs uppercase tracking-[0.3em] text-accent mb-3">{product.badge}</p>
            )}
            <h1 className="font-serif italic text-5xl text-primary mb-4">{product.name}</h1>
            <p className="font-serif text-2xl text-muted-foreground mb-8">{product.price.toFixed(2)} TND</p>
            <p className="text-sm text-foreground/70 leading-relaxed mb-10">{product.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-border">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
                  data-testid="button-qty-decrease"
                >
                  <Minus size={14} />
                </button>
                <span className="w-12 text-center text-sm">{qty}</span>
                <button
                  onClick={() => setQty(qty + 1)}
                  className="w-10 h-10 flex items-center justify-center hover:bg-secondary transition-colors"
                  data-testid="button-qty-increase"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            <Button
              className="uppercase tracking-[0.2em] text-xs h-12 w-full max-w-sm"
              onClick={handleAddToCart}
              data-testid="button-add-to-cart"
            >
              Add to Selection
            </Button>

            <div className="mt-10 border-t border-border pt-8 grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Origin</p>
                <p className="text-sm font-serif">Crafted in Tunisia</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Collection</p>
                <p className="text-sm font-serif capitalize">{product.collection}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-24">
            <div className="mb-12">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">You may also like</p>
              <h2 className="font-serif italic text-3xl text-primary">From the same collection</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {relatedProducts.map((p) => (
                <Link href={`/product/${p.id}`} key={p.id} className="group" data-testid={`card-related-${p.id}`}>
                  <div className="h-56 overflow-hidden mb-3">
                    <ProductImage image={p.image} name={p.name} />
                  </div>
                  <p className="font-serif text-sm">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{p.price.toFixed(2)} TND</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
