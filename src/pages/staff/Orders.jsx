import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { Badge, Button, Card, PageHeader, Input, Select, Pagination, SearchFilterBar } from "@/components/ui";
import { formatCurrency, parseViDate, formatViDateToIso } from "@/lib/utils";
import {
  useStaffApproveOrder,
  useStaffPendingOrders,
  useStaffRejectOrder,
  usePackages,
} from "@/hooks/use-queries";

const LIMIT = 10;

export default function StaffOrders() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [packageFilter, setPackageFilter] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: rawPackages } = usePackages();
  const packages = rawPackages || [];

  // Reset page khi thay đổi bất kỳ filter nào
  useEffect(() => {
    setCurrentPage(1);
  }, [search, packageFilter, fromDate, toDate]);

  const dateError = useMemo(() => {
    if (!fromDate || !toDate) return null;
    const dFrom = parseViDate(fromDate);
    const dTo = parseViDate(toDate);
    if (dFrom && dTo && dFrom > dTo) {
      return "Từ ngày không được lớn hơn đến ngày!";
    }
    return null;
  }, [fromDate, toDate]);

  const { data: raw, isLoading, isError } = useStaffPendingOrders({
    page: currentPage,
    limit: LIMIT,
    q: search,
    packageId: packageFilter,
    from: dateError ? "" : formatViDateToIso(fromDate),
    to: dateError ? "" : formatViDateToIso(toDate),
  });

  const orders = raw?.data ?? (Array.isArray(raw) ? raw : []);
  const pagination = raw?.pagination ?? null;

  const approve = useStaffApproveOrder();
  const reject = useStaffRejectOrder();

  const getOrderId = (order) => order._id || order.id;

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleResetFilters = () => {
    setSearch("");
    setPackageFilter("");
    setFromDate("");
    setToDate("");
  };

  const filters = [
    {
      key: "packageId",
      label: "Gói tập",
      value: packageFilter,
      onChange: setPackageFilter,
      options: packages.map((pkg) => ({
        label: pkg.name || pkg.title || pkg.code || "",
        value: pkg._id || pkg.id || "",
      })),
      placeholder: "Tất cả gói tập",
      type: "select",
    },
    {
      key: "from",
      label: "Từ ngày",
      value: fromDate,
      onChange: setFromDate,
      type: "date",
    },
    {
      key: "to",
      label: "Đến ngày",
      value: toDate,
      onChange: setToDate,
      type: "date",
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Đơn hàng chờ duyệt"
        description={pagination ? `Tổng cộng ${pagination.total ?? pagination.totalRecords ?? orders.length} đơn chờ duyệt` : undefined}
      />

      {/* Bộ lọc và Tìm kiếm */}
      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên, email, sđt..."
        filters={filters}
        onClear={handleResetFilters}
      />

      {dateError && (
        <div className="text-sm font-semibold text-[#ef4444] bg-[#fee2e2] px-4 py-2.5 rounded-xl border border-[#fca5a5]">
          ⚠️ {dateError}
        </div>
      )}

      {isLoading && <div className="p-6 text-muted-foreground">Đang tải danh sách đơn...</div>}
      {isError && <div className="p-6 text-destructive">Không tải được đơn hàng.</div>}

      {/* Mobile cards */}
      {!isLoading && !isError && (
        <div className="space-y-4 sm:hidden">
          {orders.map((order) => (
            <Card key={getOrderId(order)} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Mã đơn</p>
                  <p className="truncate font-semibold">{order.orderNo || getOrderId(order)}</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Ngày tạo</p>
                  <p>{format(new Date(order.createdAt), "dd/MM HH:mm")}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Số tiền</p>
                  <p className="font-semibold text-primary">{formatCurrency(order.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Member</p>
                  <p className="truncate font-semibold">{order.memberName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Package</p>
                  <p className="truncate">{order.packageName}</p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="warning">{order.paymentMethod || "-"}</Badge>
                <Badge>{order.status || "-"}</Badge>
              </div>
              <div className="mt-4 flex gap-2">
                <Button className="flex-1" size="sm" variant="success" onClick={() => approve.mutate(getOrderId(order))} isLoading={approve.isPending}>
                  Duyệt
                </Button>
                <Button
                  className="flex-1"
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    const reason = prompt("Lý do từ chối");
                    if (reason !== null) {
                      reject.mutate({ id: getOrderId(order), reason });
                    }
                  }}
                >
                  Từ chối
                </Button>
              </div>
            </Card>
          ))}
          {orders.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Không có đơn hàng chờ duyệt.</p>
          )}
        </div>
      )}

      {/* Desktop table */}
      <Card className="hidden p-0 overflow-x-auto sm:block">
        {!isLoading && !isError && (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs uppercase tracking-wider text-[#4a5568]"
              style={{ background: "rgba(209,217,230,0.6)", borderBottom: "1px solid #babecc" }}>
              <tr>
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4">Hội viên</th>
                <th className="p-4">Gói tập</th>
                <th className="p-4">Thanh toán</th>
                <th className="p-4">Trạng thái đơn</th>
                <th className="p-4">Số tiền</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={getOrderId(order)} className="border-b border-[#d1d9e6] hover:bg-[#d1d9e6]/40 transition-colors">
                  <td className="p-4 font-medium">{order.orderNo || getOrderId(order)}</td>
                  <td className="p-4">{format(new Date(order.createdAt), "dd/MM HH:mm")}</td>
                  <td className="p-4 font-semibold">
                    <div>{order.memberName}</div>
                    <div className="text-xs text-muted-foreground">{order.memberEmail || order.memberPhone}</div>
                  </td>
                  <td className="p-4">
                    <div>{order.packageName}</div>
                    <div className="text-xs text-muted-foreground">{order.packageCode || "-"}</div>
                  </td>
                   <td className="p-4"><Badge variant="warning">{order.paymentMethod || "-"}</Badge></td>
                  <td className="p-4"><Badge>{order.status || "-"}</Badge></td>
                  <td className="p-4 text-primary font-semibold">{formatCurrency(order.amount)}</td>
                  <td className="p-4 text-right space-x-2">
                    <Button size="sm" variant="success" onClick={() => approve.mutate(getOrderId(order))} isLoading={approve.isPending}>
                      Duyệt
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        const reason = prompt("Lý do từ chối");
                        if (reason !== null) {
                          reject.mutate({ id: getOrderId(order), reason });
                        }
                      }}
                    >
                      Từ chối
                    </Button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-[#4a5568]" colSpan={8}>
                    Không có đơn hàng đang chờ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Pagination meta={pagination} currentPage={currentPage} onPageChange={handlePageChange} />
    </div>
  );
}
