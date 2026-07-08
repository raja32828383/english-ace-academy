import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Full-height centered loading indicator for route/page level loading states.
 */
export function PageLoader({ label = "Loading…", className }: { label?: string; className?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex min-h-[50vh] flex-col items-center justify-center gap-3", className)}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <span className="text-sm font-semibold text-muted-foreground">{label}</span>
    </div>
  );
}
