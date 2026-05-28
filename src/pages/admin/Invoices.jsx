import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Receipt } from "lucide-react";
import { Badge, Card, PageHeader, Pagination, SearchFilterBar } from "@/components/ui";
import { formatCurrency, parseViDate, formatViDateToIso } from "@/lib/utils";
import { useAdminInvoices } from "@/hooks/use-queries";

const LIMIT = 10;

const STATUS_OPTIONS = [
  { label: "Paid", value: "paid" },
  { label: "Pending", value: "pending" },
  { label: "Failed", value: "failed" },
];

const STATUS_VARIANT = {
  paid: "success",
  success: "success",
  pending: "warning",
  failed: "destructive",
  void: "destructive",
  voided: "destructive",
};

const METHOD_LABEL = { cash: "Tiền mặt", vnpay: "VNPay", transfer: "Chuyển khoản" };

export default function AdminInvoices() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [search, status, from, to]);

  const dateError = useMemo(() => {
    if (!from || !to) return null;
    const dFrom = parseViDate(from);
    const dTo = parseViDate(to);
    if (dFrom && dTo && dFrom > dTo) {
      return "Từ ngày không được lớn hơn đến ngày!";
    }
    return null;
  }, [from, to]);

  const { data: raw, isLoading, isError, isFetching } = useAdminInvoices({
    page: currentPage,
    limit: LIMIT,
    q: search,
    status,
    from: dateError ? "" : formatViDateToIso(from),
    to: dateError ? "" : formatViDateToIso(to),
  });

  // API: { data: [...], pagination: { currentPage, totalPages, ... } }
  const invoices = Array.isArray(raw) ? raw : (raw?.data ?? []);
  const pagination = raw?.pagination ?? null;

  const getId = (inv) => inv._id || inv.id;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClear = () => {
    setSearch("");
    setStatus("");
    setFrom("");
    setTo("");
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Hóa đơn"
        description={
          pagination
            ? `Tổng cộng ${pagination.totalRecords ?? pagination.total ?? invoices.length} hóa đơn`
            : `${invoices.length} hóa đơn trên trang này`
        }
      />

      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên, email, SĐT member..."
        filters={[
          {
            key: "status",
            label: "Trạng thái",
            value: status,
            onChange: setStatus,
            options: STATUS_OPTIONS,
            type: "select",
          },
          { key: "from", label: "Từ ngày", value: from, onChange: setFrom, type: "date" },
          { key: "to", label: "Đến ngày", value: to, onChange: setTo, type: "date" },
        ]}
        onClear={handleClear}
      />

      {dateError && (
        <div className="text-sm font-semibold text-[#ef4444] bg-[#fee2e2] px-4 py-2.5 rounded-xl border border-[#fca5a5]">
          ⚠️ {dateError}
        </div>
      )}

      {/* Trạng thái loading / error */}
      {isLoading && <p className="text-[#4a5568]">Đang tải hóa đơn...</p>}
      {isError && <p className="text-[#ef4444]">Không tải được danh sách hóa đơn.</p>}
      {/* Fetching indicator khi chuyển trang (keepPreviousData = không flicker) */}
      {isFetching && !isLoading && (
        <p className="text-xs text-[#4a5568] mb-2">Đang cập nhật...</p>
      )}

      {/* ── Mobile cards ─────────────────────────────────────── */}
      <div className="space-y-4 sm:hidden">
        {invoices.map((inv) => (
          <Card key={getId(inv)} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Receipt className="h-3.5 w-3.5 text-[#ff4757] shrink-0" />
                  <p className="font-mono text-xs text-[#4a5568] truncate">
                    {inv.invoiceNo || getId(inv)}
                  </p>
                </div>
                <p className="font-semibold text-[#2d3436] truncate">
                  {inv.memberId?.fullName || inv.memberName || "-"}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[inv.status] || "default"}>
                {inv.status || "-"}
              </Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[#4a5568]">Ngày</p>
                <p>{inv.createdAt ? format(new Date(inv.createdAt), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div>
                <p className="text-[#4a5568]">Số tiền</p>
                <p className="font-bold text-[#ff4757]">{formatCurrency(inv.amount ?? inv.total)}</p>
              </div>
              <div>
                <p className="text-[#4a5568]">Gói tập</p>
                <p className="truncate">{inv.packageId?.name || inv.packageName || "-"}</p>
              </div>
              <div>
                <p className="text-[#4a5568]">Phương thức</p>
                <p>{METHOD_LABEL[inv.paymentMethod] || inv.paymentMethod || "-"}</p>
              </div>
            </div>
          </Card>
        ))}
        {!isLoading && !isError && invoices.length === 0 && (
          <p className="text-center text-[#4a5568] py-8">Chưa có hóa đơn nào.</p>
        )}
      </div>

      {/* ── Desktop table ─────────────────────────────────────── */}
      <Card className="hidden p-0 overflow-x-auto sm:block">
        {!isLoading && !isError && (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead
              className="text-xs uppercase tracking-wider text-[#4a5568]"
              style={{ background: "rgba(209,217,230,0.6)", borderBottom: "1px solid #babecc" }}
            >
              <tr>
                <th className="p-4">Mã HĐ</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4">Member</th>
                <th className="p-4">Gói tập</th>
                <th className="p-4">Phương thức</th>
                <th className="p-4">Số tiền</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={getId(inv)}
                  className="border-b border-[#d1d9e6] hover:bg-[#d1d9e6]/40 transition-colors"
                >
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-[#ff4757] shrink-0" />
                      <span className="font-mono text-xs text-[#4a5568]">
                        {inv.invoiceNo || getId(inv)}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 text-[#2d3436]">
                    {inv.createdAt ? format(new Date(inv.createdAt), "dd/MM/yyyy HH:mm") : "-"}
                  </td>
                  <td className="p-4">
                    <div className="font-medium text-[#2d3436]">
                      {inv.memberId?.fullName || inv.memberName || "-"}
                    </div>
                    <div className="text-xs text-[#4a5568]">
                      {inv.memberId?.email || inv.memberEmail || ""}
                    </div>
                  </td>
                  <td className="p-4 text-[#2d3436]">
                    {inv.packageId?.name || inv.packageName || "-"}
                  </td>
                  <td className="p-4">
                    <Badge>{METHOD_LABEL[inv.paymentMethod] || inv.paymentMethod || "-"}</Badge>
                  </td>
                  <td className="p-4 font-bold text-[#ff4757]">
                    {formatCurrency(inv.amount ?? inv.total)}
                  </td>
                  <td className="p-4">
                    <Badge variant={STATUS_VARIANT[inv.status] || "default"}>
                      {inv.status || "-"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[#4a5568]">
                    Chưa có hóa đơn nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {/* ── Pagination bar ────────────────────────────────────── */}
      <Pagination
        meta={pagination}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
