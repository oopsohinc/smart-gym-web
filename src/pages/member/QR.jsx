import { QRCodeSVG } from "qrcode.react";
import { Badge, Card, PageHeader } from "@/components/ui";
import { useQrCode, useSubscription } from "@/hooks/use-queries";

export default function QRCheckin() {
  const { data: qr, isLoading, isError } = useQrCode();
  const { data: sub } = useSubscription();

  if (sub && !sub.isActive) {
    return (
      <div className="max-w-md">
        <PageHeader title="Mã QR check-in" />
        <Card>
          <Badge variant="destructive">Gói tập đã hết hạn</Badge>
          <p className="text-muted-foreground mt-3">Vui lòng gia hạn gói tập để sử dụng QR check-in.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <PageHeader title="Mã QR check-in" description="Mã tự refresh theo backend" />
      <Card className="text-center">
        {isLoading && <p className="text-muted-foreground">Đang tạo mã QR...</p>}
        {isError && <p className="text-destructive">Không tạo được mã QR.</p>}
        {!isLoading && !isError && qr?.token && (
          <div className="inline-block rounded-xl bg-white p-4">
            <QRCodeSVG value={qr.token} size={240} />
          </div>
        )}
        {!isLoading && !isError && !qr?.token && <p className="text-muted-foreground">Không có dữ liệu QR hợp lệ.</p>}
      </Card>
    </div>
  );
}
