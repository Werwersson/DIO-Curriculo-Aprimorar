import * as React from "react";
import { cn } from "../../lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number;
  max?: number;
  indicatorClassName?: string;
}

const Progress = React.forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value = 0, max = 100, indicatorClassName, ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    return (
      <div
        ref={ref}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        className={cn(
          "relative h-3.5 w-full overflow-hidden rounded-full bg-slate-200/90 p-0.5 shadow-inner",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-700 ease-out",
            percentage < 40
              ? "bg-gradient-to-r from-rose-500 to-amber-500 shadow-xs"
              : percentage < 70
              ? "bg-gradient-to-r from-amber-500 to-[#2EC4B6] shadow-xs"
              : "bg-gradient-to-r from-[#2EC4B6] to-emerald-500 shadow-xs",
            indicatorClassName
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    );
  }
);
Progress.displayName = "Progress";

export { Progress };
