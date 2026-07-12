import { cn } from "@/lib/utils";

interface Props {
  value: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
  /** Tailwind text-color class for the arc, defaults by score. */
  colorClass?: string;
}

/** Animated circular score ring (0–100). */
export function ScoreRing({
  value,
  size = 120,
  strokeWidth = 10,
  label,
  className,
  colorClass,
}: Props) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  const color =
    colorClass ??
    (clamped >= 75
      ? "text-success"
      : clamped >= 50
        ? "text-gold"
        : "text-coral");

  return (
    <div
      className={cn("relative inline-grid place-items-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label ? label + ": " : ""}${clamped} out of 100`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          className="fill-none stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={cn("fill-none transition-[stroke-dashoffset] duration-700 ease-out", color)}
          style={{
            stroke: "currentColor",
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <p className="font-display text-2xl font-extrabold leading-none">{clamped}</p>
          {label && <p className="mt-1 text-[11px] font-bold text-muted-foreground">{label}</p>}
        </div>
      </div>
    </div>
  );
}
