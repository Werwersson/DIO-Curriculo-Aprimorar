import * as React from "react";
import { cn } from "../../lib/utils";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType, action?: { label: string; onClick: () => void }) => void;
}

const ToastContext = React.createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return React.useContext(ToastContext);
}

const toastIcons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
  warning: AlertTriangle,
};

const toastStyles: Record<ToastType, string> = {
  success: "border-green-200 bg-green-50 text-green-900",
  error: "border-red-200 bg-red-50 text-red-900",
  info: "border-primary/20 bg-primary/5 text-primary",
  warning: "border-amber-200 bg-amber-50 text-amber-900",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback(
    (message: string, type: ToastType = "info", action?: { label: string; onClick: () => void }) => {
      const id = crypto.randomUUID();
      setToasts((prev) => [...prev, { id, message, type, action }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm" aria-live="polite">
        {toasts.map((t) => {
          const Icon = toastIcons[t.type];
          return (
            <div
              key={t.id}
              className={cn(
                "flex items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full duration-300",
                toastStyles[t.type]
              )}
            >
              <Icon className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium">{t.message}</p>
                {t.action && (
                  <button
                    onClick={t.action.onClick}
                    className="mt-1 text-xs font-semibold underline hover:no-underline"
                  >
                    {t.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="shrink-0 hover:opacity-70 transition-opacity"
                aria-label="Fechar notificação"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
