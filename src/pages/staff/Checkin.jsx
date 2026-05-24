import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button, Card, Input, Label, PageHeader } from "@/components/ui";
import { useManualCheckin, useQrCheckin } from "@/hooks/use-queries";

function CameraQrScanner({ enabled, onScan, onError }) {
  const readerIdRef = useRef("staff-qr-reader");
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onScanRef.current = onScan;
    onErrorRef.current = onError;
  }, [onScan, onError]);

  useEffect(() => {
    if (!enabled) {
      return undefined;
    }

    const html5QrCode = new Html5Qrcode(readerIdRef.current);
    let disposed = false;

    const startScanner = async () => {
      try {
        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 260, height: 260 },
            aspectRatio: 1,
          },
          async (decodedText) => {
            if (disposed) {
              return;
            }

            disposed = true;
            onScanRef.current(decodedText);

            try {
              await html5QrCode.stop();
            } catch {
              // Ignore stop errors when the camera is already closed.
            }

            try {
              await html5QrCode.clear();
            } catch {
              // Ignore clear errors during rapid scan/reload cycles.
            }
          },
          () => {},
        );
      } catch (error) {
        if (!disposed) {
          onErrorRef.current(error);
        }
      }
    };

    startScanner();

    return () => {
      disposed = true;
      html5QrCode
        .stop()
        .catch(() => {})
        .finally(() => html5QrCode.clear().catch(() => {}));
    };
  }, [enabled]);

  return <div id={readerIdRef.current} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20" />;
}

export default function StaffCheckin() {
  const [memberId, setMemberId] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [scannerMessage, setScannerMessage] = useState("");
  const manual = useManualCheckin();
  const qr = useQrCheckin();

  const handleQrCheckin = useCallback((value) => {
    const token = value?.trim();

    if (!token || qr.isPending) {
      return;
    }

    setQrCode(token);
    setScannerMessage("Đang xác thực QR...");

    qr.mutate(token, {
      onSuccess: () => {
        setScannerMessage("Check-in QR thành công.");
        setQrCode("");
      },
      onError: (err) => {
        setScannerMessage("");
        alert(err?.response?.data?.message || "Check-in QR thất bại");
      },
    });
  }, [qr]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <PageHeader title="Check-in hội viên" description="Scan QR hoặc nhập tay memberId" />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Check-in QR bằng camera</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setScannerMessage("");
              setScannerEnabled((current) => !current);
            }}
          >
            {scannerEnabled ? "Tắt camera" : "Mở camera"}
          </Button>
        </div>

        <div className="space-y-4">
          <CameraQrScanner
            enabled={scannerEnabled}
            onScan={handleQrCheckin}
            onError={(error) => {
              const message = error?.message || "Không thể mở camera. Hãy cấp quyền hoặc dùng nhập tay.";
              setScannerMessage(message);
            }}
          />

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-white">Hướng dẫn</p>
            <p className="mt-1">Cho phép trình duyệt dùng camera và đưa QR của member vào khung quét.</p>
            {scannerMessage && <p className="mt-2 text-primary">{scannerMessage}</p>}
            {qr.isPending && <p className="mt-2 text-primary">Đang gửi check-in...</p>}
          </div>

          <div className="space-y-2">
            <Label>Token QR đã quét</Label>
            <Input value={qrCode} readOnly placeholder="Token sẽ hiện ở đây sau khi quét" />
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Check-in thủ công</h3>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            manual.mutate(memberId, {
              onSuccess: () => setMemberId(""),
              onError: (err) => alert(err?.response?.data?.message || "Check-in thủ công thất bại"),
            });
          }}
        >
          <div>
            <Label required>Member ID</Label>
            <Input value={memberId} onChange={(e) => setMemberId(e.target.value)} required />
          </div>
          <Button type="submit" variant="secondary" isLoading={manual.isPending}>Check-in thủ công</Button>
        </form>
      </Card>
    </div>
  );
}
