import { Link } from "@tanstack/react-router";
import { Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label="TwoMoon Academy home"
      className={cn("flex items-center gap-2 font-display text-xl font-extrabold", className)}
    >
      <span className="relative grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <Moon className="h-4 w-4 -translate-x-0.5 fill-current" />
        <Moon className="absolute h-3.5 w-3.5 translate-x-1.5 translate-y-1 fill-current opacity-70" />
      </span>
      <span>
        TwoMoon <span className="text-primary">Academy</span>
      </span>
    </Link>
  );
}
