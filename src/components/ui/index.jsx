import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2, AlertTriangle } from "lucide-react";
export { default as Pagination } from "./Pagination";
export { default as SearchFilterBar } from "./SearchFilterBar";


export function Button({
  className,
  variant = "primary",
  size = "md",
  isLoading,
  children,
  disabled,
  ...props
}) {
  const variants = {
    primary:
      "bg-[#ff4757] text-white hover:brightness-110 active:translate-y-[1px] neon-shadow hover:neon-shadow-hover"
      + " shadow-[4px_4px_8px_rgba(166,50,60,0.35),-4px_-4px_8px_rgba(255,100,110,0.25)]",
    secondary:
      "bg-[#e0e5ec] text-[#2d3436] hover:text-[#ff4757]"
      + " shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff]"
      + " active:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]",
    outline:
      "border-2 border-[#babecc] bg-[#e0e5ec] text-[#4a5568] hover:border-[#ff4757] hover:text-[#ff4757]"
      + " shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]",
    ghost: "bg-transparent text-[#4a5568] hover:bg-[#d1d9e6] hover:text-[#2d3436]",
    destructive:
      "bg-[#ef4444] text-white hover:brightness-110"
      + " shadow-[4px_4px_8px_rgba(180,50,50,0.3),-4px_-4px_8px_rgba(255,120,120,0.2)]",
    success:
      "bg-[#10b981] text-white hover:brightness-110"
      + " shadow-[4px_4px_8px_rgba(16,100,80,0.25)]",
  };

  const sizes = {
    sm:   "h-9 px-4 text-sm",
    md:   "h-11 px-6 font-medium",
    lg:   "h-14 px-8 text-lg font-semibold",
    icon: "h-11 w-11 flex items-center justify-center p-0",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none",
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
}

export const Input = forwardRef(function Input({ className, error, ...props }, ref) {
  return (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-xl px-4 py-2 text-sm text-[#2d3436] placeholder:text-[#a0aec0]"
          + " bg-[#e0e5ec] outline-none transition-all"
          + " shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]"
          + " focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]"
          + " disabled:cursor-not-allowed disabled:opacity-50",
          error && "shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ef4444]",
          className,
        )}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-[#ef4444]">{error}</p>}
    </div>
  );
});

export const Select = forwardRef(function Select(
  { className, options, value, onChange, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      value={value}
      onChange={onChange}
      className={cn(
        "flex h-12 w-full rounded-xl px-4 py-2 text-sm text-[#2d3436] bg-[#e0e5ec] outline-none transition-all"
        + " shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]"
        + " focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]",
        className,
      )}
      {...props}
    >
      <option value="" disabled className="bg-[#e0e5ec] text-[#4a5568]">
        Chọn một tùy chọn
      </option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value} className="bg-[#e0e5ec] text-[#2d3436]">
          {opt.label}
        </option>
      ))}
    </select>
  );
});

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn("rounded-2xl p-6 bg-[#e0e5ec]", className)}
      style={{ boxShadow: "8px 8px 16px #babecc, -8px -8px 16px #ffffff" }}
      {...props}
    >
      {children}
    </div>
  );
}

export function Badge({ className, variant = "default", children }) {
  const variants = {
    default:     "bg-[#d1d9e6] text-[#4a5568] border border-[#babecc]",
    success:     "bg-[#10b981]/15 text-[#059669] border border-[#10b981]/30",
    warning:     "bg-[#f59e0b]/15 text-[#d97706] border border-[#f59e0b]/30",
    destructive: "bg-[#ef4444]/15 text-[#ef4444] border border-[#ef4444]/30",
  };
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold", variants[variant], className)}>
      {children}
    </span>
  );
}

export function Label({ className, children, required }) {
  return (
    <label className={cn("mb-2 block text-sm font-semibold text-[#2d3436]", className)}>
      {children}
      {required && <span className="text-[#ff4757] ml-1">*</span>}
    </label>
  );
}

/**
 * Modal — General purpose dialog
 * Fix: Đóng khi click backdrop + stopPropagation để tránh đóng nhầm khi click bên trong
 */
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden p-4 backdrop-blur-sm transition-all"
      style={{ background: "rgba(45,52,54,0.25)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="relative rounded-2xl p-6 bg-[#e0e5ec]"
          style={{ boxShadow: "12px 12px 24px #babecc, -12px -12px 24px #ffffff" }}
        >
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-xl font-display font-bold text-[#2d3436]">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-[#4a5568] hover:bg-[#d1d9e6] hover:text-[#2d3436] transition-colors"
              style={{ boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }}
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * ConfirmModal — Dialog xác nhận thay thế cho window.confirm()
 * - Có thể style hoàn toàn
 * - Testable
 * - Accessible
 */
export function ConfirmModal({ isOpen, onClose, onConfirm, title = "Xác nhận", message, confirmLabel = "Xác nhận", confirmVariant = "destructive", isLoading = false }) {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
      style={{ background: "rgba(45,52,54,0.25)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl p-6 bg-[#e0e5ec]"
        style={{ boxShadow: "12px 12px 24px #babecc, -12px -12px 24px #ffffff" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#ef4444]/10">
            <AlertTriangle className="h-5 w-5 text-[#ef4444]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[#2d3436]">{title}</h3>
            {message && <p className="mt-1 text-sm text-[#4a5568]">{message}</p>}
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isLoading}>
            Hủy
          </Button>
          <Button variant={confirmVariant} size="sm" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action }) {
  return (
    <div className="mb-6 flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-display font-bold text-[#2d3436]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#4a5568]">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
