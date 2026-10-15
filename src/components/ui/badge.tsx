import * as React from "react";
import { cn } from "../../lib/utils";
import { cva, type VariantProps } from "class-variance-authority";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition-all duration-200 select-none",
  {
    variants: {
      variant: {
        default:
          "border-[#0F4C5C]/20 bg-[#0F4C5C]/10 text-[#0F4C5C] hover:bg-[#0F4C5C]/15",
        secondary:
          "border-[#2EC4B6]/30 bg-[#2EC4B6]/15 text-[#0F756C] hover:bg-[#2EC4B6]/25",
        found:
          "border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 shadow-xs",
        missing:
          "border-amber-200 bg-amber-50 text-amber-900 hover:bg-amber-100/80 shadow-xs",
        outline:
          "border-slate-300/80 bg-white text-slate-700 hover:bg-slate-50 shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
