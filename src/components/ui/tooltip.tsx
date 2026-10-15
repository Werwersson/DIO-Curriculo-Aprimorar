import * as React from "react";
import { cn } from "../../lib/utils";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  className?: string;
}

function Tooltip({ content, children, className }: TooltipProps) {
  const [visible, setVisible] = React.useState(false);
  const triggerRef = React.useRef<HTMLDivElement>(null);

  return (
    <div
      ref={triggerRef}
      className={cn("relative inline-flex", className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 z-50 rounded-xl bg-slate-900/95 backdrop-blur-md px-3.5 py-2 text-xs text-slate-100 shadow-xl border border-slate-700/60 w-max max-w-[260px] text-center leading-relaxed pointer-events-none animate-fade-in"
          role="tooltip"
        >
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-slate-900" />
        </div>
      )}
    </div>
  );
}

export { Tooltip };
