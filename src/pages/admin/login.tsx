import { useAdminLogin } from "@/lib/api-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useEffect } from "react";

const schema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof schema>;

export default function AdminLoginPage() {
  const [, navigate] = useLocation();
  const login = useAdminLogin();

  useEffect(() => {
    if (sessionStorage.getItem("wid-elle-token")) {
      navigate("/admin/dashboard");
    }
  }, [navigate]);

  const form = useForm<LoginForm>({
    resolver: zodResolver(schema),
    defaultValues: { username: "", password: "" },
  });

  function onSubmit(data: LoginForm) {
    login.mutate(
      { data: { username: data.username, password: data.password } },
      {
        onSuccess: (res) => {
          sessionStorage.setItem("wid-elle-token", res.token);
          navigate("/admin/dashboard");
        },
        onError: () => {
          form.setError("password", { message: "Invalid credentials" });
        },
      }
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Atelier Access</p>
          <h1 className="font-serif italic text-4xl text-primary">WID-ELLE</h1>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Username</FormLabel>
                  <FormControl>
                    <Input {...field} data-testid="input-username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase tracking-widest">Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} data-testid="input-password" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full uppercase tracking-[0.2em] text-xs h-12"
              disabled={login.isPending}
              data-testid="button-login"
            >
              {login.isPending ? "Signing in..." : "Enter Atelier"}
            </Button>
          </form>
        </Form>
      </motion.div>
    </div>
  );
}
