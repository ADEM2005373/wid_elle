import { useState } from "react";
import {
  useListCollections, useCreateCollection, useUpdateCollection, useDeleteCollection,
  getListCollectionsQueryKey,
} from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, Plus } from "lucide-react";
import type { Collection } from "@/lib/api-client";
import { motion } from "framer-motion";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().min(1, "Description is required"),
  image: z.string().default(""),
});

type CollectionForm = z.infer<typeof schema>;

export default function AdminCollectionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Collection | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: collections = [], isLoading } = useListCollections();
  const createCollection = useCreateCollection();
  const updateCollection = useUpdateCollection();
  const deleteCollection = useDeleteCollection();

  const form = useForm<CollectionForm>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "", description: "", image: "" },
  });

  function openCreate() {
    setEditing(null);
    form.reset({ name: "", slug: "", description: "", image: "" });
    setDialogOpen(true);
  }

  function openEdit(collection: Collection) {
    setEditing(collection);
    form.reset({
      name: collection.name,
      slug: collection.slug,
      description: collection.description,
      image: collection.image ?? "",
    });
    setDialogOpen(true);
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => form.setValue("image", reader.result as string);
    reader.readAsDataURL(file);
  }

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: getListCollectionsQueryKey() });
  }

  function onSubmit(data: CollectionForm) {
    const payload = { ...data, image: data.image || null };
    if (editing) {
      updateCollection.mutate(
        { id: editing.id, data: payload },
        {
          onSuccess: () => { toast({ title: "Collection updated" }); setDialogOpen(false); invalidate(); },
          onError: (err: unknown) => toast({ title: "Error", description: (err as Error).message, variant: "destructive" }),
        }
      );
    } else {
      createCollection.mutate(
        { data: payload },
        {
          onSuccess: () => { toast({ title: "Collection created" }); setDialogOpen(false); invalidate(); },
          onError: (err: unknown) => toast({ title: "Error", description: (err as Error).message, variant: "destructive" }),
        }
      );
    }
  }

  function handleDelete(id: string) {
    deleteCollection.mutate(
      { id },
      {
        onSuccess: () => { toast({ title: "Collection deleted" }); setDeleteId(null); invalidate(); },
        onError: (err: unknown) => toast({ title: "Error", description: (err as Error).message, variant: "destructive" }),
      }
    );
  }

  return (
    <div className="p-8 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Manage</p>
            <h1 className="font-serif italic text-4xl text-primary">Collections</h1>
          </div>
          <Button onClick={openCreate} className="uppercase tracking-[0.15em] text-xs gap-2" data-testid="button-add-collection">
            <Plus size={14} /> Add Collection
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-20 bg-secondary/50 animate-pulse" />)}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground font-serif italic text-xl">No collections yet</div>
        ) : (
          <div className="space-y-3">
            {collections.map((c) => (
              <div key={c.id} className="border border-border flex items-center gap-4 p-4" data-testid={`collection-row-${c.id}`}>
                {c.image && c.image.startsWith("data:") && (
                  <div className="w-12 h-12 overflow-hidden flex-shrink-0">
                    <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-base">{c.name}</p>
                  <p className="text-xs text-muted-foreground">/{c.slug} — {c.description}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => openEdit(c)} data-testid={`button-edit-collection-${c.id}`}>
                    <Pencil size={12} /> Edit
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30" onClick={() => setDeleteId(c.id)} data-testid={`button-delete-collection-${c.id}`}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-2xl">{editing ? "Edit Collection" : "New Collection"}</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Name</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-collection-name"
                      onChange={(e) => {
                        field.onChange(e);
                        if (!editing) {
                          form.setValue("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="slug" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Slug</FormLabel>
                  <FormControl><Input {...field} data-testid="input-collection-slug" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Description</FormLabel>
                  <FormControl><Textarea rows={2} {...field} data-testid="input-collection-description" /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div>
                <p className="text-xs uppercase tracking-widest mb-2">Cover Image (optional)</p>
                <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm" data-testid="input-collection-image" />
                {form.watch("image") && (
                  <div className="mt-2 w-24 h-24 overflow-hidden border border-border">
                    <img src={form.watch("image")} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 uppercase tracking-[0.15em] text-xs" disabled={createCollection.isPending || updateCollection.isPending} data-testid="button-save-collection">
                  {editing ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif italic text-xl">Confirm Delete</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">This cannot be undone.</p>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="destructive" className="flex-1" onClick={() => deleteId && handleDelete(deleteId)} disabled={deleteCollection.isPending} data-testid="button-confirm-delete-collection">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
