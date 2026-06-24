import { useState, useEffect, useRef } from "react";
import { useListProducts, useListCollections } from "@/lib/api-client";
import { useCart } from "@/hooks/use-cart";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";

function ProductImage({ image, name }: { image?: string | null; name: string }) {
  if (image && image.startsWith("data:")) {
    return <img src={image} alt={name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />;
  }
  const colors = [
    "from-[#F2D7D5] to-[#C9848A]",
    "from-[#C9848A] to-[#7B4A5A]",
    "from-[#C4A882] to-[#C9848A]",
    "from-[#7B4A5A] to-[#C9848A]",
  ];
  const colorClass = colors[name.charCodeAt(0) % colors.length];
  return (
    <div className={`w-full h-full bg-gradient-to-br ${colorClass} flex items-end justify-start p-4 transition-transform duration-700 group-hover:scale-105`}>
      <span className="font-serif italic text-white/80 text-lg leading-tight">{name}</span>
    </div>
  );
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}

function Marquee() {
  const text = "HANDCRAFTED IN TUNISIA · LUXURY HANDBAGS · WID-ELLE · ARTISAN CRAFT · ";
  return (
    <div className="overflow-hidden py-4 border-y border-border bg-secondary/30">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        {[...Array(4)].map((_, i) => (
          <span key={i} className="text-xs uppercase tracking-[0.3em] text-muted-foreground px-4">
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

export default function HomePage() {
  const { toast } = useToast();
  const cart = useCart();
  const [activeCollection, setActiveCollection] = useState<string | undefined>(undefined);

  const { data: collections = [], isLoading: collectionsLoading } = useListCollections();
  const { data: products = [], isLoading: productsLoading } = useListProducts(
    activeCollection ? { collection: activeCollection } : undefined
  );

  const collectionsRef = useRef<HTMLElement>(null);
  const productsRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get("section");
    if (section === "collections") {
      setTimeout(() => collectionsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } else if (section === "products") {
      setTimeout(() => productsRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
  }, []);

  function handleAddToCart(product: { id: string; name: string; price: number; image?: string | null }) {
    cart.addItem({ productId: product.id, productName: product.name, price: product.price, image: product.image });
    toast({ title: "Added to selection", description: product.name });
  }

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative min-h-[92vh] flex items-center justify-center overflow-hidden bg-gradient-to-b from-background to-secondary/20">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-[#F2D7D5]/30 blur-3xl" />
          <div className="absolute bottom-1/3 left-1/5 w-64 h-64 rounded-full bg-[#C4A882]/20 blur-3xl" />
        </div>
        <div className="relative text-center px-6 max-w-4xl mx-auto">
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.5em" }}
            animate={{ opacity: 1, letterSpacing: "0.3em" }}
            transition={{ duration: 1.2 }}
            className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-6"
          >
            Tunisian Artisan Luxury
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="font-serif italic text-7xl sm:text-8xl md:text-9xl text-primary leading-none mb-8"
          >
            WID-ELLE
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="text-lg font-serif italic text-foreground/60 mb-10 max-w-md mx-auto"
          >
            Where artisan craft meets Parisian luxury — feminine handbags of extraordinary refinement
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center gap-6 justify-center"
          >
            <Button
              onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="uppercase tracking-[0.2em] text-xs h-12 px-10"
              data-testid="button-explore"
            >
              Explore the Collection
            </Button>
            <button
              onClick={() => collectionsRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
            >
              Collections <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2, delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <div className="w-px h-12 bg-gradient-to-b from-transparent to-primary/30" />
        </motion.div>
      </section>

      <Marquee />

      {/* Collections */}
      <section ref={collectionsRef} className="py-24 px-6 max-w-7xl mx-auto" id="collections">
        <FadeIn>
          <div className="text-center mb-16">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Curated</p>
            <h2 className="font-serif italic text-5xl text-primary">Collections</h2>
          </div>
        </FadeIn>
        {collectionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-serif italic text-xl">
            Collections coming soon
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((col, i) => (
              <FadeIn key={col.id} delay={i * 0.1}>
                <button
                  onClick={() => {
                    setActiveCollection(activeCollection === col.slug ? undefined : col.slug);
                    productsRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className={`group relative w-full h-72 overflow-hidden text-left transition-all ${activeCollection === col.slug ? "ring-1 ring-primary" : ""}`}
                  data-testid={`card-collection-${col.id}`}
                >
                  {col.image && col.image.startsWith("data:") ? (
                    <img src={col.image} alt={col.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-secondary to-[#C9848A]/30 transition-transform duration-700 group-hover:scale-105" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-6 text-white">
                    <p className="text-xs uppercase tracking-[0.2em] mb-1">{activeCollection === col.slug ? "Selected" : "Collection"}</p>
                    <h3 className="font-serif italic text-2xl">{col.name}</h3>
                  </div>
                </button>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* Products */}
      <section ref={productsRef} className="py-24 px-6 max-w-7xl mx-auto" id="products">
        <FadeIn>
          <div className="flex items-end justify-between mb-16">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Our</p>
              <h2 className="font-serif italic text-5xl text-primary">
                {activeCollection
                  ? (collections.find((c) => c.slug === activeCollection)?.name ?? "Products")
                  : "Boutique"}
              </h2>
            </div>
            {activeCollection && (
              <button
                onClick={() => setActiveCollection(undefined)}
                className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                data-testid="button-clear-filter"
              >
                View All
              </button>
            )}
          </div>
        </FadeIn>
        {productsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-3">
                <div className="h-80 bg-secondary/50 animate-pulse" />
                <div className="h-4 w-2/3 bg-secondary/50 animate-pulse" />
                <div className="h-4 w-1/3 bg-secondary/50 animate-pulse" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground font-serif italic text-xl">
            Products coming soon
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, i) => (
              <FadeIn key={product.id} delay={i * 0.05}>
                <div className="group" data-testid={`card-product-${product.id}`}>
                  <Link href={`/product/${product.id}`} className="block">
                    <div className="relative h-80 overflow-hidden mb-4">
                      <ProductImage image={product.image} name={product.name} />
                      {product.badge && (
                        <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-2 py-0.5 text-[10px] uppercase tracking-widest">
                          {product.badge}
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/product/${product.id}`}>
                        <h3 className="font-serif text-base hover:text-muted-foreground transition-colors">{product.name}</h3>
                      </Link>
                      <span className="font-serif text-sm text-muted-foreground whitespace-nowrap">{product.price.toFixed(2)} TND</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full uppercase tracking-[0.15em] text-[10px] h-9 mt-2"
                      onClick={() => handleAddToCart(product)}
                      data-testid={`button-add-cart-${product.id}`}
                    >
                      Add to Selection
                    </Button>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        )}
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-6">
          <FadeIn>
            <div className="text-center mb-16">
              <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Words from our clients</p>
              <h2 className="font-serif italic text-5xl text-primary">Testimonials</h2>
            </div>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { name: "Yasmine B.", city: "Tunis", text: "An extraordinary piece — the leather is buttery soft and the craftsmanship is unlike anything I've seen at this price point. I receive compliments everywhere I go.", rating: 5 },
              { name: "Fatima R.", city: "Sfax", text: "WID-ELLE captures the essence of Tunisian artisanship while feeling entirely modern and refined. My Maison bag has become my signature accessory.", rating: 5 },
              { name: "Nour M.", city: "Sousse", text: "I ordered the Baya collection piece and was blown away by the packaging alone. The bag itself is a work of art. This brand deserves its place among the greats.", rating: 5 },
            ].map((t, i) => (
              <FadeIn key={i} delay={i * 0.15}>
                <div className="text-center">
                  <div className="flex justify-center gap-0.5 mb-6">
                    {[...Array(t.rating)].map((_, j) => (
                      <span key={j} className="text-accent text-sm">★</span>
                    ))}
                  </div>
                  <p className="font-serif italic text-lg leading-relaxed text-foreground/80 mb-6">"{t.text}"</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{t.name} — {t.city}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 px-6">
        <FadeIn>
          <div className="max-w-xl mx-auto text-center">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">Stay in the world of</p>
            <h2 className="font-serif italic text-4xl text-primary mb-6">WID-ELLE</h2>
            <p className="text-sm text-muted-foreground mb-8">Be first to discover new collections, exclusive pieces, and the stories behind our craft.</p>
            <div className="flex gap-3 max-w-sm mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-1 border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                data-testid="input-newsletter"
              />
              <Button className="uppercase tracking-[0.15em] text-xs px-6" data-testid="button-newsletter">
                Subscribe
              </Button>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <h3 className="font-serif italic text-3xl text-primary mb-4">WID-ELLE</h3>
              <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
                Luxury feminine handbags handcrafted in Tunisia. Where artisan tradition meets modern refinement.
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] mb-5">Navigate</p>
              <div className="space-y-3">
                <div><button onClick={() => collectionsRef.current?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-muted-foreground hover:text-primary transition-colors">Collections</button></div>
                <div><button onClick={() => productsRef.current?.scrollIntoView({ behavior: "smooth" })} className="text-sm text-muted-foreground hover:text-primary transition-colors">Boutique</button></div>
              </div>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] mb-5">Contact</p>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Tunisia</p>
                <p className="text-sm text-muted-foreground">contact@wid-elle.tn</p>
              </div>
            </div>
          </div>
          <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-muted-foreground uppercase tracking-widest">
              &copy; {new Date().getFullYear()} WID-ELLE. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">Crafted with love in Tunisia</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
