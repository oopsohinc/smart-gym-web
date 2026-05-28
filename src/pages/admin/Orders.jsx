import { useEffect, useMemo, useState } from "react";
import { Ban } from "lucide-react";
import { format } from "date-fns";
import { Badge, Button, Card, ConfirmModal, PageHeader, Pagination, SearchFilterBar } from "@/components/ui";
import { formatCurrency, parseViDate, formatViDateToIso } from "@/lib/utils";
import { useAdminOrders, useAdminVoidOrder } from "@/hooks/use-queries";

const LIMIT = 10;
const STATUS_OPTIONS = [
  { label: "Pending",   value: "pending" },
  { label: "Approved",  value: "approved" },
  { label: "Rejected",  value: "rejected" },
  { label: "Expired",   value: "expired" },
  { label: "Voided",    value: "voided" },
];

const statusVariant = (s) => s === "completed" || s === "approved" ? "success" : s === "voided" || s === "rejected" ? "destructive" : "warning";

export default function AdminOrders() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [from, setFrom]       = useState("");
  const [to, setTo]           = useState("");
  const [voidTargetId, setVoidTargetId] = useState(null);

  // UX: reset page khi filter thay đổi
  useEffect(() => { setCurrentPage(1); }, [search, status, from, to]);

  const dateError = useMemo(() => {
    if (!from || !to) return null;
    const dFrom = parseViDate(from);
    const dTo = parseViDate(to);
    if (dFrom && dTo && dFrom > dTo) {
      return "Từ ngày không được lớn hơn đến ngày!";
    }
    return null;
  }, [from, to]);

  const { data: raw, isLoading, isError, isFetching } = useAdminOrders({
    page: currentPage, limit: LIMIT, q: search, status, 
    from: dateError ? "" : formatViDateToIso(from), 
    to: dateError ? "" : formatViDateToIso(to),
  });
  const voidOrder = useAdminVoidOrder();

  const orders     = raw?.data ?? (Array.isArray(raw) ? raw : []);
  const pagination = raw?.pagination ?? null;

  const getOrderId    = (order) => order._id || order.id;
  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleClear = () => { setSearch(""); setStatus(""); setFrom(""); setTo(""); };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Danh sách orders"
        description={pagination ? `Tổng cộng ${pagination.total ?? orders.length} đơn hàng` : undefined}
      />

      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên, email, SĐT member..."
        filters={[
          { key: "status", label: "Trạng thái", value: status, onChange: setStatus, options: STATUS_OPTIONS, type: "select" },
          { key: "from", label: "Từ ngày", value: from, onChange: setFrom, type: "date" },
          { key: "to",   label: "Đến ngày", value: to,   onChange: setTo,   type: "date" },
        ]}
        onClear={handleClear}
      />

      {dateError && (
        <div className="text-sm font-semibold text-[#ef4444] bg-[#fee2e2] px-4 py-2.5 rounded-xl border border-[#fca5a5]">
          ⚠️ {dateError}
        </div>
      )}

      {isLoading && <p className="text-[#4a5568]">Đang tải orders...</p>}
      {isError   && <p className="text-[#ef4444]">Không tải được orders.</p>}
      {isFetching && !isLoading && <p className="text-xs text-[#4a5568]">Đang cập nhật...</p>}

      {/* Mobile cards */}
      <div className="space-y-4 sm:hidden">
        {orders.map((order) => (
          <Card key={getOrderId(order)} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-[#4a5568]">Mã đơn</p>
                <p className="truncate font-semibold text-[#2d3436]">{order.orderNo || getOrderId(order)}</p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[#4a5568]">Ngày tạo</p><p>{order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy") : "-"}</p></div>
              <div><p className="text-[#4a5568]">Số tiền</p><p className="font-semibold text-[#ff4757]">{formatCurrency(order.amount)}</p></div>
              <div><p className="text-[#4a5568]">Member</p><p className="truncate font-medium">{order.memberName}</p></div>
              <div><p className="text-[#4a5568]">Gói</p><p className="truncate font-medium">{order.packageName}</p></div>
            </div>
            {order.status !== "voided" && (
              <Button variant="destructive" size="sm" className="mt-3 w-full" onClick={() => setVoidTargetId(getOrderId(order))}>
                <Ban className="mr-2 h-3.5 w-3.5" />Void đơn
              </Button>
            )}
          </Card>
        ))}
        {!isLoading && !isError && orders.length === 0 && (
          <p className="text-center text-[#4a5568] py-8">Không tìm thấy đơn hàng nào.</p>
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden p-0 overflow-x-auto sm:block">
        {!isLoading && !isError && (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs uppercase tracking-wider text-[#4a5568]"
              style={{ background: "rgba(209,217,230,0.6)", borderBottom: "1px solid #babecc" }}>
              <tr>
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4">Member</th>
                <th className="p-4">Gói tập</th>
                 <th className="p-4">Thanh toán</th>
                <th className="p-4">Số tiền</th>
                <th className="p-4">Status</th>
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={getOrderId(order)} className="border-b border-[#d1d9e6] hover:bg-[#d1d9e6]/40 transition-colors">
                  <td className="p-4 font-mono text-xs text-[#4a5568]">{order.orderNo || getOrderId(order)}</td>
                  <td className="p-4">{order.createdAt ? format(new Date(order.createdAt), "dd/MM/yyyy HH:mm") : "-"}</td>
                  <td className="p-4">
                    <div className="font-medium text-[#2d3436]">{order.memberName}</div>
                    <div className="text-xs text-[#4a5568]">{order.memberEmail || order.memberPhone}</div>
                  </td>
                  <td className="p-4">
                    <div className="text-[#2d3436]">{order.packageName}</div>
                    <div className="text-xs text-[#4a5568]">{order.packageCode || "-"}</div>
                  </td>
                   <td className="p-4"><Badge variant="warning">{order.paymentMethod || "-"}</Badge></td>
                  <td className="p-4 font-semibold text-[#ff4757]">{formatCurrency(order.amount)}</td>
                  <td className="p-4"><Badge variant={statusVariant(order.status)}>{order.status || "-"}</Badge></td>
                  <td className="p-4">
                    {order.status !== "voided" ? (
                      <Button variant="destructive" size="sm" onClick={() => setVoidTargetId(getOrderId(order))}>
                        <Ban className="mr-1.5 h-3.5 w-3.5" />Void
                      </Button>
                    ) : (
                      <span className="text-xs text-[#4a5568] italic">Đã void</span>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={8} className="p-8 text-center text-[#4a5568]">Không tìm thấy đơn hàng nào.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Pagination meta={pagination} currentPage={currentPage} onPageChange={handlePageChange} />

      <ConfirmModal isOpen={!!voidTargetId} onClose={() => setVoidTargetId(null)}
        onConfirm={() => voidOrder.mutate(voidTargetId, { onSuccess: () => setVoidTargetId(null), onError: () => setVoidTargetId(null) })}
        title="Void đơn hàng" message="Bạn có chắc muốn void đơn này? Đơn sẽ bị hủy và không thể hoàn tác."
        confirmLabel="Void đơn" isLoading={voidOrder.isPending} />
    </div>
  );
}
