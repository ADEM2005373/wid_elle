import { useState } from "react";
import {
  useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListCollections, getListProductsQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Product, Collection } from "@/lib/api-client";
import { motion } from "framer-motion";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.coerce.number().min(0, "Price must be positive"),
  collection: z.string().min(1, "Collection is required"),
  badge: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  image: z.string().default(""),
});

type ProductForm = z.infer<typeof schema>;

function ProductImage({ image, name }: { image?: string | null; name: string }) {
  if (image && image.startsWith("data:")) {
    return <img src={image} alt={name} className="w-full h-full object-cover" />;
  }
  return (
    <div className="w-full h-full bg-gradient-to-br from-[#F2D7D5] to-[#C9848A] flex items-center justify-center">
      <span className="text-xs font-serif italic text-white/60">{name[0]}</span>
    </div>
  );
}

export default function AdminProductsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: productsData, isLoading } = useListProducts();
  const { data: collectionsData } = useListCollections();

  const products: Product[] = Array.isArray(productsData)
    ? productsData
    : Array.isArray((productsData as any)?.products)
    ? (productsData as any).products
    : [];

  const collections: Collection[] = Array.isArray(collectionsData)
    ? collectionsData
    : Array.isArray((collectionsData as any)?.collections)
    ? (collectionsData as any).collections
    : [];

  if (!Array.isArray(productsData)) console.error("Admin products is not an array", productsData);
  if (!Array.isArray(collectionsData)) console.error("Admin collections is not an array", collectionsData);
  console.log("Admin products:", products);
  console.log("Admin collections:", collections);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const form = useForm<ProductForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", price: 0, collection: "", badge: "", description: "", image: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", price: 0, collection: "", badge: "", description: "", image: "" });
    setDialogOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    form.reset({
      name: product.name,
      price: product.price,
      collection: product.collection,
      badge: product.badge ?? "",
      description: product.description,
      image: product.image ?? "",
    });
    setDialogOpen(true);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      form.setValue("image", reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
  }

  function onSubmit(data: ProductForm) {
    const payload = { ...data, badge: data.badge || null, image: data.image || "" };
    if (editing) {
      updateProduct.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => { toast({ title: "Product updated" }); setDialogOpen(false); invalidate(); },
          onError: (err: unknown) => toast({ title: "Error", description: (err as Error).message, variant: "destructive" }),
        }
      );
    } else {
      createProduct.mutate(
        { data: payload },
        {
          onSuccess: () => { toast({ title: "Product created" }); setDialogOpen(false); invalidate(); },
          onError: (err: unknown) => toast({ title: "Error", description: (err as Error).message, variant: "destructive" }),
        }
      );
    }
  }

  function handleDelete(id: string) {
    deleteProduct.mutate(
      { id },
      {
        onSuccess: () => { toast({ title: "Product deleted" }); setDeleteId(null); invalidate(); },
        onError: (err: unknown) => toast({ title: "Error", description: (err as Error).message, variant: "destructive" }),
      }
    );
  }

  return (
    <div className="p-8 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Manage</p>
            <h1 className="font-serif italic text-4xl text-primary">Products</h1>
          </div>
          <Button onClick={openCreate} className="uppercase tracking-[0.15em] text-xs gap-2" data-testid="button-add-product">
            <Plus size={14} /> Add Product
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-secondary/50 animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground font-serif italic text-xl">No products yet</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((p) => (
              <div key={p.id} className="border border-border group" data-testid={`product-card-${p.id}`}>
                <div className="h-48 overflow-hidden">
                  <ProductImage image={p.image} name={p.name} />
                </div>
                <div className="p-4">
                  <p className="font-serif text-sm mb-1 truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground mb-3">{p.price.toFixed(2)} TND · {p.collection}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 text-xs gap-1" onClick={() => openEdit(p)} data-testid={`button-edit-${p.id}`}>
                      <Pencil size={12} /> Edit
                    </Button>
                    <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => setDeleteId(p.id)} data-testid={`button-delete-${p.id}`}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Product form dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl">{editing ? "Edit Product" : "New Product"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Name</FormLabel>
                  <FormControl><Input {...field} data-testid="input-product-name" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="price" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest">Price (TND)</FormLabel>
                    <FormControl><Input type="number" step="0.01" {...field} data-testid="input-product-price" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="collection" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest">Collection</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-collection">
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {collections.map((c) => (
                          <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <FormField control={form.control} name="badge" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Badge (optional)</FormLabel>
                  <FormControl><Input placeholder="New, Bestseller..." {...field} data-testid="input-product-badge" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Description</FormLabel>
                  <FormControl><Textarea rows={3} {...field} data-testid="input-product-description" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div>
                <p className="text-xs uppercase tracking-widest mb-2">Product Image</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" data-testid="input-product-image" />
                {form.watch("image") && (
                  <div className="mt-2 w-24 h-24 overflow-hidden border border-border">
                    <img src={form.watch("image")} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 uppercase tracking-[0.15em] text-xs" disabled={createProduct.isPending || updateProduct.isPending} data-testid="button-save-product">
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl">Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)} disabled={deleteProduct.isPending} data-testid="button-confirm-delete">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
