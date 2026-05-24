import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Shared Pagination component — Neumorphic style
 *
 * Props:
 *   meta         — { currentPage, totalPages, hasNextPage, hasPrevPage, totalRecords }
 *   currentPage  — page number được control từ ngoài
 *   onPageChange — (newPage: number) => void
 *   className    — optional extra class
 */
function PaginationBtn({ onClick, disabled, active, children }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-sm font-semibold transition-all",
        active
          ? "bg-[#ff4757] text-white shadow-[3px_3px_6px_rgba(166,50,60,0.35),-3px_-3px_6px_rgba(255,100,110,0.25)]"
          : "text-[#4a5568] hover:bg-[#d1d9e6] hover:text-[#2d3436]",
        disabled && "opacity-40 cursor-not-allowed pointer-events-none",
      ]
        .filter(Boolean)
        .join(" ")}
      style={!active ? { boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" } : undefined}
    >
      {children}
    </button>
  );
}

export default function Pagination({ meta, currentPage, onPageChange, className = "" }) {
  if (!meta || meta.totalPages <= 1) return null;

  // Dải trang hiển thị xung quanh trang hiện tại (±2)
  const delta = 2;
  const left  = Math.max(1, currentPage - delta);
  const right = Math.min(meta.totalPages, currentPage + delta);
  const range = [];
  for (let i = left; i <= right; i++) range.push(i);

  // Tự tính fallback nếu API không trả về hasPrevPage / hasNextPage
  const canGoPrev = meta.hasPrevPage ?? (currentPage > 1);
  const canGoNext = meta.hasNextPage ?? (currentPage < meta.totalPages);

  return (
    <div className={`mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between ${className}`}>
      {/* Thông tin tổng */}
      <p className="text-sm text-[#4a5568]">
        Trang{" "}
        <span className="font-semibold text-[#2d3436]">{meta.currentPage}</span>
        {" / "}
        <span className="font-semibold text-[#2d3436]">{meta.totalPages}</span>
        {meta.totalRecords !== undefined && (
          <>
            {" · Tổng "}
            <span className="font-semibold text-[#2d3436]">{meta.totalRecords}</span>
            {" bản ghi"}
          </>
        )}
      </p>

      {/* Nút điều hướng */}
      <div
        className="flex items-center gap-1.5 rounded-2xl p-1.5"
        style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
      >
        <PaginationBtn
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Trước</span>
        </PaginationBtn>

        {left > 1 && (
          <>
            <PaginationBtn onClick={() => onPageChange(1)}>1</PaginationBtn>
            {left > 2 && <span className="px-1 text-[#4a5568] select-none">…</span>}
          </>
        )}

        {range.map((p) => (
          <PaginationBtn
            key={p}
            active={p === currentPage}
            onClick={() => onPageChange(p)}
          >
            {p}
          </PaginationBtn>
        ))}

        {right < meta.totalPages && (
          <>
            {right < meta.totalPages - 1 && <span className="px-1 text-[#4a5568] select-none">…</span>}
            <PaginationBtn onClick={() => onPageChange(meta.totalPages)}>
              {meta.totalPages}
            </PaginationBtn>
          </>
        )}

        <PaginationBtn
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canGoNext}
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="h-4 w-4" />
        </PaginationBtn>
      </div>
    </div>
  );
}
