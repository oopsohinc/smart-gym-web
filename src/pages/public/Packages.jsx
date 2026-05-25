import { Link } from "react-router-dom";
import { Card } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { usePackages } from "@/hooks/use-queries";

export default function PackagesPublic() {
  const { data, isLoading, isError } = usePackages();
  const activePackages = (data || []).filter((pkg) => pkg.isActive);

  return (
    <div className="min-h-dvh px-4 py-6 sm:py-8 lg:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold">Gói tập Gym</h1>
          <p className="text-muted-foreground mt-2">Danh sách gói tập hiện có</p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
            <Link className="text-primary" to="/login">Đăng nhập</Link>
            <Link className="text-primary" to="/register">Đăng ký</Link>
          </div>
        </div>

        {isLoading && <div className="text-center text-muted-foreground">Đang tải gói tập...</div>}
        {isError && <div className="text-center text-destructive">Không thể tải gói tập.</div>}
        {!isLoading && !isError && activePackages.length === 0 && (
          <div className="text-center text-muted-foreground">Hiện chưa có gói tập nào.</div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {activePackages.map((pkg) => (
            <Card key={pkg.id} className="h-full">
              <div className="space-y-2">
                <h3 className="text-xl font-bold leading-tight">{pkg.name}</h3>
                <p className="text-muted-foreground text-sm">{pkg.code}</p>
              </div>
              <p className="text-muted-foreground text-sm mt-1">{pkg.description || "Không có mô tả"}</p>
              <p className="text-primary text-2xl font-bold mt-3">{formatCurrency(pkg.price)}</p>
              <p className="text-sm text-muted-foreground">{pkg.durationDays} ngày</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
