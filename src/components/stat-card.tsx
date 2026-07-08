import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  icon: ReactNode;
  label: string;
  value: ReactNode;
  className?: string;
}

/**
 * Compact metric card reused across the dashboard and profile surfaces.
 */
export function StatCard({ icon, label, value, className }: StatCardProps) {
  return (
    <Card className={cn("p-4", className)}>
      <div className="flex items-center gap-2">
        <span aria-hidden="true">{icon}</span>
        <span className="text-xs font-bold text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 font-display text-2xl font-extrabold">{value}</p>
    </Card>
  );
}
