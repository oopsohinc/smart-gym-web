import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { useSubscription, useActivateSubscription } from "@/hooks/use-queries";

function getStatusBadgeVariant(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "active") return "success";
  if (normalizedStatus === "pending") return "warning";
  if (normalizedStatus === "expired" || normalizedStatus === "inactive") return "destructive";
  return "default";
}

function getStatusLabel(status) {
  const normalizedStatus = String(status || "").toLowerCase();

  if (normalizedStatus === "active") return "Đang hoạt động";
  if (normalizedStatus === "pending") return "Chờ kích hoạt";
  if (normalizedStatus === "expired") return "Đã hết hạn";
  if (normalizedStatus === "inactive") return "Không hoạt động";
  return status || "Không xác định";
}

export default function Subscription() {
  const { data: sub, isLoading, isError } = useSubscription();
  const activate = useActivateSubscription();
  const isActive = Boolean(sub?.hasActiveSubscription ?? sub?.isActive);
  const allSubscriptions = (sub?.subscriptions || [])
    .slice()
    .sort((a, b) => new Date(b?.startDate || 0).getTime() - new Date(a?.startDate || 0).getTime());

  if (isLoading) return <p className="text-muted-foreground">Đang tải trạng thái gói tập...</p>;
  if (isError) return <p className="text-destructive">Không thể tải trạng thái gói tập.</p>;

  return (
    <div className="max-w-3xl">
      <PageHeader title="Gói tập của tôi" />
      <Card>
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-semibold">Trạng thái</p>
          <Badge variant={isActive ? "success" : "destructive"}>{isActive ? "Đang hoạt động" : "Hết hạn"}</Badge>
        </div>

        <p className="text-xl font-bold">{sub?.packageName || "Chưa có gói"}</p>
        <p className="text-sm text-muted-foreground mt-1">Còn lại: {sub?.daysRemaining || 0} ngày</p>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Ngày bắt đầu</p>
            <p>{sub?.startDate ? format(new Date(sub.startDate), "dd/MM/yyyy") : "-"}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Ngày kết thúc</p>
            <p>{sub?.endDate ? format(new Date(sub.endDate), "dd/MM/yyyy") : "-"}</p>
          </div>
        </div>

        <Link to="/member/order" className="inline-block mt-6">
          <Button>Mua/gia hạn gói</Button>
        </Link>
      </Card>

      <Card className="mt-4">
        <p className="text-lg font-semibold">Tất cả gói tập của bạn</p>

        {allSubscriptions.length === 0 && (
          <p className="text-sm text-muted-foreground mt-3">Bạn chưa có gói tập nào.</p>
        )}

        {allSubscriptions.length > 0 && (
          <div className="mt-4 space-y-3">
            {allSubscriptions.map((item) => (
              <div key={item.id || item._id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.packageName || "Gói không xác định"}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.packageCode || "-"}</p>
                  </div>
                  <Badge variant={getStatusBadgeVariant(item.status)}>{getStatusLabel(item.status)}</Badge>
                </div>

                <div className="mt-3 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Bắt đầu</p>
                    <p>{item.startDate ? format(new Date(item.startDate), "dd/MM/yyyy") : "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Kết thúc</p>
                    <p>{item.endDate ? format(new Date(item.endDate), "dd/MM/yyyy") : "-"}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Còn lại</p>
                    <p>{item.remainingDays ?? 0} ngày</p>
                  </div>
                  {String(item.status || "").toLowerCase() === "pending" && (
                    <div className="flex items-end sm:col-span-2 lg:col-span-1">
                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() => activate.mutate(item.id || item._id)}
                        isLoading={activate.isPending}
                        disabled={activate.isPending}
                      >
                        Kích hoạt
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
