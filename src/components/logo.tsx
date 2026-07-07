import { Link } from "@tanstack/react-router";
import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2 font-display text-xl font-extrabold", className)}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <GraduationCap className="h-5 w-5" />
      </span>
      <span>
        Fluent<span className="text-primary">ID</span>
      </span>
    </Link>
  );
}
