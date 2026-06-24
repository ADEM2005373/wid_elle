import { useGetDebugStatus } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { getGetDebugStatusQueryKey } from "@/lib/api-client";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, RefreshCw } from "lucide-react";

function StatusRow({ label, value, ok }: { label: string; value: string | number | boolean | null | undefined; ok?: boolean }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border last:border-0">
      <span className="text-xs uppercase tracking-widest text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-serif">{String(value ?? "—")}</span>
        {ok !== undefined && (
          ok
            ? <CheckCircle size={14} className="text-green-600" />
            : <XCircle size={14} className="text-destructive" />
        )}
      </div>
    </div>
  );
}

export default function AdminDebugPage() {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useGetDebugStatus();

  function refresh() {
    queryClient.invalidateQueries({ queryKey: getGetDebugStatusQueryKey() });
  }

  return (
    <div className="p-8 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-1">System</p>
            <h1 className="font-serif italic text-4xl text-primary">Debug</h1>
          </div>
          <Button variant="outline" onClick={refresh} className="gap-2 text-xs uppercase tracking-widest" data-testid="button-refresh-debug">
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1,2,3,4,5,6,7].map(i => <div key={i} className="h-12 bg-secondary/50 animate-pulse" />)}
          </div>
        ) : error ? (
          <div className="border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
            Failed to load debug status: {(error as Error).message}
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* GitHub Config */}
            <div className="border border-border p-6">
              <p className="text-xs uppercase tracking-[0.2em] mb-4">GitHub Configuration</p>
              <StatusRow label="GitHub Token" value={data.githubToken ? "Configured" : "Missing"} ok={data.githubToken} />
              <StatusRow label="Repository Owner" value={data.githubOwner || "Not set"} ok={!!data.githubOwner} />
              <StatusRow label="Repository Name" value={data.githubRepo || "Not set"} ok={!!data.githubRepo} />
              <StatusRow label="Branch" value={data.githubBranch || "Not set"} ok={!!data.githubBranch} />
              <StatusRow label="Repository Access" value={data.repoAccessible ? "Accessible" : "Inaccessible"} ok={data.repoAccessible} />
            </div>

            {/* Data counts */}
            <div className="border border-border p-6">
              <p className="text-xs uppercase tracking-[0.2em] mb-4">Data Files</p>
              <StatusRow label="Products" value={data.productsCount} ok={data.repoAccessible} />
              <StatusRow label="Collections" value={data.collectionsCount} ok={data.repoAccessible} />
              <StatusRow label="Orders" value={data.ordersCount} ok={data.repoAccessible} />
              <StatusRow label="Last Sync" value={data.lastSync ? new Date(data.lastSync).toLocaleString() : "Never"} />
            </div>

            {/* Error */}
            {data.error && (
              <div className="border border-destructive/30 bg-destructive/10 p-5">
                <p className="text-xs uppercase tracking-widest text-destructive mb-2">Error Detected</p>
                <p className="text-sm font-serif italic">{data.error}</p>
              </div>
            )}

            {/* All good */}
            {!data.error && data.repoAccessible && (
              <div className="border border-green-200 bg-green-50 p-5 flex items-center gap-3">
                <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                <div>
                  <p className="text-xs uppercase tracking-widest text-green-800 mb-1">System Healthy</p>
                  <p className="text-sm text-green-700">GitHub connection is working. All data files are accessible.</p>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}
