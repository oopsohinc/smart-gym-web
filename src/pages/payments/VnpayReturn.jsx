import { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";
import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Button, Card } from "@/components/ui";

export default function VnpayReturn() {
  const location = useLocation();

  const payload = useMemo(() => {
    const query = new URLSearchParams(location.search);
    const result = query.get("result");
    const message = query.get("message") || "";
    const txnRef = query.get("vnp_TxnRef") || "";
    const responseCode = query.get("vnp_ResponseCode") || "";
    const transactionNo = query.get("vnp_TransactionNo") || "";

    const hasRequiredForKnown = Boolean(result && txnRef && responseCode);

    if (!hasRequiredForKnown) {
      return {
        state: "unknown",
        title: "Không xác định trạng thái giao dịch",
        message:
          "Thiếu thông tin callback từ hệ thống thanh toán. Vui lòng liên hệ staff để được kiểm tra giao dịch.",
        txnRef,
        responseCode,
        transactionNo,
      };
    }

    if (result === "success") {
      return {
        state: "success",
        title: "Thanh toán thành công",
        message: message || "Giao dịch đã được xác nhận thành công.",
        txnRef,
        responseCode,
        transactionNo,
      };
    }

    if (result === "failed") {
      return {
        state: "failed",
        title: "Thanh toán thất bại",
        message: message || "Giao dịch không thành công hoặc đã bị hủy.",
        txnRef,
        responseCode,
        transactionNo,
      };
    }

    return {
      state: "unknown",
      title: "Không xác định trạng thái giao dịch",
      message:
        "Giá trị trạng thái trả về không hợp lệ. Vui lòng liên hệ staff để được hỗ trợ.",
      txnRef,
      responseCode,
      transactionNo,
    };
  }, [location.search]);

  const isSuccess = payload.state === "success";
  const isFailed = payload.state === "failed";
  const isUnknown = payload.state === "unknown";

  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-8 sm:py-10">
      <Card className="w-full max-w-md text-center p-5 sm:p-8">
        {isSuccess && (
          <>
            <CheckCircle2 className="h-12 w-12 text-success mx-auto" />
            <div className="mt-4 rounded-xl border border-success/40 bg-success/10 p-3 text-success font-semibold">
              Xác nhận thanh toán thành công
            </div>
          </>
        )}

        {isFailed && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto" />
            <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-destructive font-semibold">
              Giao dịch thất bại
            </div>
          </>
        )}

        {isUnknown && (
          <>
            <AlertTriangle className="h-12 w-12 text-warning mx-auto" />
            <div className="mt-4 rounded-xl border border-warning/40 bg-warning/10 p-3 text-warning font-semibold">
              Không xác định được kết quả giao dịch
            </div>
          </>
        )}

        <h2 className="text-2xl font-bold mt-4">{payload.title}</h2>
        <p className="text-muted-foreground mt-2">{payload.message}</p>

        <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4 text-left text-sm space-y-2 break-words">
          <p><span className="text-muted-foreground">Mã đơn:</span> <span className="font-semibold">{payload.txnRef || "-"}</span></p>
          <p><span className="text-muted-foreground">Mã giao dịch:</span> <span className="font-semibold">{payload.transactionNo || "-"}</span></p>
          <p><span className="text-muted-foreground">Response code:</span> <span className="font-semibold">{payload.responseCode || "-"}</span></p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <Link to="/member/dashboard">
            <Button className="w-full sm:w-auto" variant="outline">Về dashboard</Button>
          </Link>
          <Link to="/member/subscription">
            <Button className="w-full sm:w-auto">Xem trạng thái gói</Button>
          </Link>
          {isFailed && (
            <Link to="/member/order">
              <Button className="w-full sm:w-auto" variant="outline">Thử lại thanh toán</Button>
            </Link>
          )}
        </div>
      </Card>
    </div>
  );
}
