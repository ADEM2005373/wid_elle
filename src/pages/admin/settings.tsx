import { useGetSettings, useUpdateSettings, getGetSettingsQueryKey } from "@/lib/api-client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { useEffect } from "react";

const schema = z.object({
  storeEmail: z.string().email("Valid email required"),
  currency: z.string().min(1, "Currency is required"),
  adminPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((d) => !d.adminPassword || d.adminPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SettingsForm = z.infer<typeof schema>;

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();

  const form = useForm<SettingsForm>({
    resolver: zodResolver(schema),
    defaultValues: { storeEmail: "", currency: "TND", adminPassword: "", confirmPassword: "" },
  });

  useEffect(() => {
    if (settings) {
      form.reset({ storeEmail: settings.storeEmail, currency: settings.currency, adminPassword: "", confirmPassword: "" });
    }
  }, [settings, form]);

  function onSubmit(data: SettingsForm) {
    updateSettings.mutate(
      {
        data: {
          storeEmail: data.storeEmail,
          currency: data.currency,
          adminPassword: data.adminPassword || null,
        },
      },
      {
        onSuccess: () => {
          toast({ title: "Settings saved" });
          form.setValue("adminPassword", "");
          form.setValue("confirmPassword", "");
          queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        },
        onError: (err: unknown) => toast({ title: "Error", description: (err as Error).message, variant: "destructive" }),
      }
    );
  }

  return (
    <div className="p-8 max-w-lg">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">Configure</p>
          <h1 className="font-serif italic text-4xl text-primary">Settings</h1>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <div key={i} className="h-12 bg-secondary/50 animate-pulse" />)}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="border border-border p-6 space-y-5">
                <p className="text-xs uppercase tracking-[0.2em]">Store Settings</p>
                <FormField control={form.control} name="storeEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest">Store Email</FormLabel>
                    <FormControl><Input type="email" {...field} data-testid="input-store-email" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="currency" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest">Currency</FormLabel>
                    <FormControl><Input {...field} data-testid="input-currency" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="border border-border p-6 space-y-5">
                <p className="text-xs uppercase tracking-[0.2em]">Change Password</p>
                <p className="text-xs text-muted-foreground">Leave blank to keep current password</p>
                <FormField control={form.control} name="adminPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest">New Password</FormLabel>
                    <FormControl><Input type="password" {...field} data-testid="input-new-password" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs uppercase tracking-widest">Confirm Password</FormLabel>
                    <FormControl><Input type="password" {...field} data-testid="input-confirm-password" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <Button type="submit" className="w-full uppercase tracking-[0.2em] text-xs h-12" disabled={updateSettings.isPending} data-testid="button-save-settings">
                {updateSettings.isPending ? "Saving..." : "Save Settings"}
              </Button>
            </form>
          </Form>
        )}
      </motion.div>
    </div>
  );
}
