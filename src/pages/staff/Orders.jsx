import { format } from "date-fns";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useStaffApproveOrder, useStaffPendingOrders, useStaffRejectOrder } from "@/hooks/use-queries";

export default function StaffOrders() {
  const { data: orders, isLoading, isError } = useStaffPendingOrders();
  const approve = useStaffApproveOrder();
  const reject = useStaffRejectOrder();

  const getOrderId = (order) => order._id || order.id;

  const mobileCards = (orders || []).map((order) => (
    <Card key={getOrderId(order)} className="p-4 sm:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Mã đơn</p>
          <p className="truncate font-semibold">{order.orderNo || getOrderId(order)}</p>
        </div>
        <Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>{order.paymentStatus || "-"}</Badge>
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
  ));

  return (
    <div>
      <PageHeader title="Đơn hàng chờ duyệt" />

      <div className="space-y-4 sm:hidden">{mobileCards}</div>

      <Card className="hidden p-0 overflow-x-auto sm:block">
        {isLoading && <div className="p-6 text-muted-foreground">Đang tải danh sách đơn...</div>}
        {isError && <div className="p-6 text-destructive">Không tải được đơn hàng.</div>}

        {!isLoading && !isError && (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-4">Mã đơn</th>
                <th className="p-4">Ngày tạo</th>
                <th className="p-4">Hội viên</th>
                <th className="p-4">Gói tập</th>
                <th className="p-4">Thanh toán</th>
                <th className="p-4">Trạng thái thanh toán</th>
                <th className="p-4">Trạng thái đơn</th>
                <th className="p-4">Số tiền</th>
                <th className="p-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {(orders || []).map((order) => (
                <tr key={getOrderId(order)}>
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
                  <td className="p-4"><Badge variant={order.paymentStatus === "paid" ? "success" : "warning"}>{order.paymentStatus || "-"}</Badge></td>
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
              {orders?.length === 0 && (
                <tr>
                  <td className="p-6 text-center text-muted-foreground" colSpan={9}>
                    Không có đơn hàng đang chờ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
