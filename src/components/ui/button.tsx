import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
      default:
        "bg-[#0F4C5C] hover:bg-[#092F39] text-white shadow-md shadow-[#0F4C5C]/25 hover:shadow-lg hover:shadow-[#0F4C5C]/30 active:scale-[0.98] border border-[#0F4C5C]",
      secondary:
        "bg-[#2EC4B6] hover:bg-[#1E9E92] text-white shadow-md shadow-[#2EC4B6]/25 hover:shadow-lg active:scale-[0.98] border border-[#2EC4B6]",
      outline:
        "border-2 border-slate-300 bg-white hover:bg-slate-100 hover:border-[#0F4C5C] text-slate-800 shadow-xs hover:shadow-sm active:scale-[0.98]",
      ghost:
        "text-slate-700 hover:bg-slate-100 hover:text-slate-900 active:scale-[0.98]",
      destructive:
        "bg-rose-600 hover:bg-rose-700 text-white shadow-sm active:scale-[0.98]",
    };

    const sizes: Record<string, string> = {
      default: "h-11 px-5 py-2.5 text-sm",
      sm: "h-9 px-3.5 text-xs",
      lg: "h-13 px-8 text-base font-semibold",
      icon: "h-10 w-10",
    };

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2.5 rounded-xl font-semibold tracking-wide transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0F4C5C]/40 focus-visible:ring-offset-2 disabled:bg-slate-200 disabled:text-slate-400 disabled:border-slate-200 disabled:shadow-none disabled:cursor-not-allowed disabled:pointer-events-none cursor-pointer select-none",
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
