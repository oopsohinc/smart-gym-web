import { Search, X } from "lucide-react";

/**
 * Shared SearchFilterBar component — Neumorphic style
 *
 * Props:
 *   search       — current search string value
 *   onSearch     — (value: string) => void
 *   placeholder  — search input placeholder
 *   filters      — array of filter config objects:
 *     { key, label, value, onChange, options: [{ label, value }], type: 'select'|'date' }
 *   onClear      — callback to clear all filters
 *   className    — optional extra classes on wrapper
 */

/** Neumorphic input base style */
const neuInputStyle = {
  background: "#e0e5ec",
  boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff",
};

export default function SearchFilterBar({
  search = "",
  onSearch,
  placeholder = "Tìm kiếm...",
  filters = [],
  onClear,
  className = "",
}) {
  const hasActiveFilters =
    search.trim() !== "" || filters.some((f) => f.value !== "" && f.value !== undefined);

  return (
    <div className={`flex flex-wrap gap-3 items-end ${className}`}>
      {/* Search input */}
      <div className="relative flex-1 min-w-[180px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#4a5568] pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#2d3436] outline-none placeholder:text-[#a0aec0] transition-all"
          style={neuInputStyle}
        />
      </div>

      {/* Dynamic filters */}
      {filters.map((filter) =>
        filter.type === "date" ? (
          <div key={filter.key} className="flex flex-col gap-0.5">
            {filter.label && (
              <span className="text-xs text-[#4a5568] font-medium px-1">{filter.label}</span>
            )}
            <input
              type="date"
              value={filter.value || ""}
              onChange={(e) => filter.onChange(e.target.value)}
              className="rounded-xl px-3 py-2.5 text-sm text-[#2d3436] outline-none cursor-pointer transition-all"
              style={neuInputStyle}
            />
          </div>
        ) : (
          <div key={filter.key} className="flex flex-col gap-0.5">
            {filter.label && (
              <span className="text-xs text-[#4a5568] font-medium px-1">{filter.label}</span>
            )}
            <select
              value={filter.value || ""}
              onChange={(e) => filter.onChange(e.target.value)}
              className="rounded-xl px-3 py-2.5 text-sm text-[#2d3436] outline-none cursor-pointer transition-all min-w-[130px]"
              style={neuInputStyle}
            >
              <option value="">{filter.placeholder || `-- ${filter.label || "Tất cả"} --`}</option>
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )
      )}

      {/* Clear all button — chỉ hiện khi có filter đang active */}
      {hasActiveFilters && onClear && (
        <button
          onClick={onClear}
          title="Xóa tất cả bộ lọc"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#ef4444] hover:bg-[#fee2e2] transition-colors"
          style={{ boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }}
        >
          <X className="h-4 w-4" />
          <span className="hidden sm:inline">Xóa lọc</span>
        </button>
      )}
    </div>
  );
}
