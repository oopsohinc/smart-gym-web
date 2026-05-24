import { useToast } from "@/hooks/use-toast";

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <div key={toast.id} className="w-80 rounded-xl border border-white/10 bg-card p-4 shadow-lg">
          <div className="flex items-start justify-between gap-3">
            <div>
              {toast.title && <p className="font-semibold">{toast.title}</p>}
              {toast.description && <p className="text-sm text-muted-foreground mt-1">{toast.description}</p>}
            </div>
            <button aria-label="Đóng thông báo" onClick={() => dismiss(toast.id)} className="text-sm text-muted-foreground">
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
