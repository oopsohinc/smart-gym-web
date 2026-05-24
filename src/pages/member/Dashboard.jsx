import { Link } from "react-router-dom";
import { Card, PageHeader } from "@/components/ui";
import { useProfile, useSubscription } from "@/hooks/use-queries";

export default function MemberDashboard() {
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: subscription, isLoading: loadingSubscription } = useSubscription();

  return (
    <div className="space-y-6">
      <PageHeader title="Member Dashboard" description="Tổng quan nhanh thông tin tài khoản" />

      {(loadingProfile || loadingSubscription) && <p className="text-muted-foreground">Đang tải dữ liệu...</p>}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <p className="text-sm text-muted-foreground">Hội viên</p>
          <h3 className="mt-2 text-xl font-bold break-words">{profile?.name || "-"}</h3>
          <p className="text-sm text-muted-foreground">{profile?.email || "-"}</p>
          <Link className="text-primary text-sm mt-4 inline-block" to="/member/profile">
            Cập nhật hồ sơ
          </Link>
        </Card>

        <Card>
          <p className="text-sm text-muted-foreground">Trạng thái gói</p>
          <h3 className="mt-2 text-xl font-bold">
            {subscription?.isActive ? "Đang hoạt động" : "Chưa hoạt động"}
          </h3>
          <p className="text-sm text-muted-foreground">{subscription?.packageName || "Chưa có gói"}</p>
          <Link className="text-primary text-sm mt-4 inline-block" to="/member/subscription">
            Xem chi tiết
          </Link>
        </Card>
      </div>
    </div>
  );
}
