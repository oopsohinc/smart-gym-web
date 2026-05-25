import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, Label, PageHeader, Select } from "@/components/ui";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { useCreateVnpayPayment, usePackages } from "@/hooks/use-queries";

export default function OrderCreate() {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { data: packages, isLoading, isError } = usePackages();
  const createVnpayPayment = useCreateVnpayPayment();

  const [packageId, setPackageId] = useState("");
  const [method, setMethod] = useState("vnpay");

  const activePackages = (packages || []).filter((item) => item.isActive);
  const selectedPkg = activePackages.find((item) => item.id === packageId);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!packageId) {
      return;
    }

    const memberId = user?.id || user?._id;

    if (!memberId) {
      alert("Không tìm thấy thông tin hội viên. Vui lòng đăng nhập lại.");
      navigate("/login");
      return;
    }

    createVnpayPayment.mutate(
      { memberId, packageId, paymentMethod: method },
      {
        onSuccess: (result) => {
          const paymentUrl = result?.paymentUrl || result?.data?.paymentUrl;

          if (paymentUrl) {
            window.location.href = paymentUrl;
          } else {
            alert("Không nhận được link thanh toán VNPAY.");
          }
        },
        onError: (error) => {
          alert(error?.response?.data?.message || "Không thể tạo thanh toán VNPAY.");
        },
      },
    );
  };

  return (
    <div className="max-w-3xl">
      <PageHeader title="Tạo order" description="Chọn gói tập và phương thức thanh toán" />

      {isLoading && <p className="text-muted-foreground">Đang tải gói tập...</p>}
      {isError && <p className="text-destructive">Không thể tải gói tập.</p>}

      {!isLoading && !isError && (
        <Card className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label required>Chọn gói</Label>
              <Select
                value={packageId}
                onChange={(e) => setPackageId(e.target.value)}
                options={activePackages.map((pkg) => ({
                  label: `${pkg.name} - ${formatCurrency(pkg.price)} / ${pkg.durationDays} ngày`,
                  value: pkg.id,
                }))}
              />
            </div>

            <div>
              <Label required>Phương thức thanh toán</Label>
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                options={[
                  { label: "VNPay", value: "vnpay" },
                  
                ]}
              />
            </div>

            {selectedPkg && (
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <p className="text-sm text-muted-foreground">Tổng thanh toán</p>
                <p className="text-2xl font-bold text-primary mt-1">{formatCurrency(selectedPkg.price)}</p>
              </div>
            )}

            <Button type="submit" isLoading={createVnpayPayment.isPending} disabled={!packageId}>
              Thanh toán VNPAY
            </Button>
          </form>
        </Card>
      )}
    </div>
  );
}
