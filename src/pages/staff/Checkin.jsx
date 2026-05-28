import { useCallback, useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button, Card, Input, Label, PageHeader } from "@/components/ui";
import { useManualCheckin, useQrCheckin } from "@/hooks/use-queries";

function getCheckinMemberName(response) {
  const payload = response?.data ?? response ?? {};
  const member = payload?.member ?? payload?.memberId ?? payload?.user ?? payload?.data?.member ?? null;

  return (
    member?.fullName ??
    member?.name ??
    payload?.memberName ??
    payload?.fullName ??
    payload?.name ??
    payload?.data?.memberName ??
    payload?.data?.fullName ??
    payload?.data?.name ??
    null
  );
}

function CameraQrScanner({ enabled, onScan, onError }) {
  const readerIdRef = useRef("staff-qr-reader");
  const onScanRef = useRef(onScan);
  const onErrorRef = useRef(onError);

  const createQrBox = useCallback((viewfinderWidth, viewfinderHeight) => {
    const shortestSide = Math.min(viewfinderWidth, viewfinderHeight);
    const size = Math.max(220, Math.floor(shortestSide * 0.72));

    return {
      width: size,
      height: size,
    };
  }, []);

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
            fps: 12,
            qrbox: createQrBox,
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
  }, [createQrBox, enabled]);

  return <div id={readerIdRef.current} className="overflow-hidden rounded-2xl border border-white/10 bg-black/20" />;
}

export default function StaffCheckin() {
  const [phone, setPhone] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [scannerEnabled, setScannerEnabled] = useState(true);
  const [scannerMessage, setScannerMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const manual = useManualCheckin();
  const qr = useQrCheckin();

  const handleQrCheckin = useCallback((value) => {
    const token = value?.trim();

    if (!token || qr.isPending) {
      return;
    }

    setQrCode(token);
    setScannerMessage("Đang xác thực QR...");
  setSuccessMessage("");

    qr.mutate(token, {
      onSuccess: (result) => {
        const memberName = getCheckinMemberName(result);
        setScannerMessage("");
        setSuccessMessage(memberName ? `Check-in QR thành công cho ${memberName}.` : "Check-in QR thành công.");
        setQrCode("");
      },
      onError: (err) => {
        setScannerMessage("");
        setSuccessMessage("");
        alert(err?.response?.data?.message || "Check-in QR thất bại");
      },
    });
  }, [qr]);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="md:col-span-2">
        <PageHeader title="Check-in hội viên" description="Scan QR hoặc nhập tay memberId" />
      </div>

      {successMessage && (
        <div className="md:col-span-2 rounded-xl border border-success/40 bg-success/10 p-4 text-sm text-success">
          {successMessage}
        </div>
      )}

      <Card>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className="text-lg font-semibold">Check-in QR bằng camera</h3>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setScannerMessage("");
              setSuccessMessage("");
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
              setSuccessMessage("");
            }}
          />

          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-muted-foreground">
            <p className="font-medium text-white">Hướng dẫn</p>
            <p className="mt-1">Cho phép trình duyệt dùng camera và đưa QR của member vào khung quét.</p>
            {scannerMessage && <p className="mt-2 text-primary">{scannerMessage}</p>}
            {qr.isPending && <p className="mt-2 text-primary">Đang gửi check-in...</p>}
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold mb-4">Check-in thủ công</h3>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            manual.mutate(phone, {
              onSuccess: (result) => {
                const memberName = getCheckinMemberName(result);
                setPhone("");
                setScannerMessage("");
                setSuccessMessage(memberName ? `Check-in thủ công thành công cho ${memberName}.` : "Check-in thủ công thành công.");
              },
              onError: (err) => alert(err?.response?.data?.message || "Check-in thủ công thất bại"),
            });
          }}
        >
          <div>
            <Label required>Số điện thoại hội viên</Label>
            <Input
              type="tel"
              placeholder="VD: 0901234567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          <Button type="submit" variant="secondary" isLoading={manual.isPending}>Check-in thủ công</Button>
        </form>
      </Card>
    </div>
  );
}
