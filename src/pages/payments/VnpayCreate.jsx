import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { useCreateVnpayPayment } from "@/hooks/use-queries";

export default function VnpayCreate() {
  const [params] = useSearchParams();
  const createPayment = useCreateVnpayPayment();
  const [status, setStatus] = useState("creating");
  const [message, setMessage] = useState("Vui lòng chờ trong giây lát.");

  useEffect(() => {
    const orderId = params.get("orderId");
    const amount = params.get("amount");
    const parsedAmount = Number(amount);

    if (!orderId || !amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setStatus("invalid");
      setMessage("Thiếu hoặc sai dữ liệu thanh toán. Vui lòng tạo đơn hàng lại.");
      return;
    }

    createPayment.mutate(
      { orderId, amount: parsedAmount },
      {
        onSuccess: (result) => {
          const paymentUrl = result?.paymentUrl || result?.data?.paymentUrl;

          if (paymentUrl) {
            setStatus("redirecting");
            setMessage("Đang chuyển hướng sang cổng thanh toán VNPAY...");
            window.location.href = paymentUrl;
            return;
          }

          setStatus("error");
          setMessage("Không nhận được đường dẫn thanh toán từ hệ thống.");
        },
        onError: (error) => {
          setStatus("error");
          setMessage(error?.response?.data?.message || "Tạo yêu cầu thanh toán thất bại. Vui lòng thử lại.");
        },
      },
    );
  }, [createPayment, params]);

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 sm:py-10">
      <Card className="w-full max-w-md text-center p-5 sm:p-8">
        {(status === "creating" || status === "redirecting") && (
          <>
            <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
            <h1 className="text-xl font-bold mt-4">
              {status === "creating" ? "Đang tạo link thanh toán VNPAY..." : "Đang chuyển hướng tới VNPAY..."}
            </h1>
            <p className="text-muted-foreground mt-2">{message}</p>
          </>
        )}

        {(status === "invalid" || status === "error") && (
          <>
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
            <h1 className="text-xl font-bold mt-4">Không thể bắt đầu thanh toán</h1>
            <p className="text-muted-foreground mt-2">{message}</p>
            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Link to="/member/order">
                <Button className="w-full sm:w-auto">Thử lại</Button>
              </Link>
              <Link to="/member/dashboard">
                <Button className="w-full sm:w-auto" variant="outline">Về dashboard</Button>
              </Link>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
