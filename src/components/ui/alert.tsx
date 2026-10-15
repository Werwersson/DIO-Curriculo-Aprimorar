import * as React from "react";
import { cn } from "../../lib/utils";
import { AlertTriangle, Info, CheckCircle } from "lucide-react";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "warning" | "success";
}

const alertIcons = {
  default: Info,
  warning: AlertTriangle,
  success: CheckCircle,
};

const alertStyles = {
  default:
    "border-[#0F4C5C]/20 bg-gradient-to-r from-[#0F4C5C]/5 via-[#2EC4B6]/5 to-white text-[#0F4C5C] shadow-xs",
  warning:
    "border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50/40 to-white text-amber-950 shadow-xs",
  success:
    "border-emerald-300 bg-gradient-to-r from-emerald-50 via-teal-50/40 to-white text-emerald-950 shadow-xs",
};

const iconStyles = {
  default: "text-[#0F4C5C] bg-[#0F4C5C]/10",
  warning: "text-amber-700 bg-amber-100",
  success: "text-emerald-700 bg-emerald-100",
};

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const Icon = alertIcons[variant];
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "relative flex items-start gap-3.5 rounded-2xl border p-4.5 text-sm transition-all duration-200",
          alertStyles[variant],
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "p-2 rounded-xl shrink-0 flex items-center justify-center",
            iconStyles[variant]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 leading-relaxed">{children}</div>
      </div>
    );
  }
);
Alert.displayName = "Alert";

export { Alert };
