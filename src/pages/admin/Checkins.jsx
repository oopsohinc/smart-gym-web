import { useState } from "react";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { useAdminCheckins } from "@/hooks/use-queries";

export default function AdminCheckins() {
  const [rangeMode, setRangeMode] = useState("thisMonth");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({ period: "thisMonth", from: "", to: "" });
  const [filterError, setFilterError] = useState("");

  const { data, isLoading, isError } = useAdminCheckins(appliedFilter);

  const handleApplyFilter = () => {
    setFilterError("");

    if (rangeMode === "custom") {
      if (!customFrom || !customTo) {
        setFilterError("Vui lòng chọn đầy đủ từ ngày và đến ngày.");
        return;
      }

      if (new Date(customFrom) > new Date(customTo)) {
        setFilterError("Từ ngày không được lớn hơn đến ngày.");
        return;
      }

      setAppliedFilter({ period: "", from: customFrom, to: customTo });
      return;
    }

    setAppliedFilter({ period: rangeMode, from: "", to: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard Check-ins" />

      {isLoading && <p className="text-muted-foreground">Đang tải check-ins...</p>}
      {isError && <p className="text-destructive">Không tải được check-ins.</p>}

      <Card>
        <div className="grid gap-4 md:grid-cols-[220px_1fr_1fr_auto] md:items-end">
          <div>
            <p className="mb-2 text-sm font-medium">Khoảng thời gian</p>
            <Select
              value={rangeMode}
              onChange={(e) => setRangeMode(e.target.value)}
              options={[
                { label: "Hôm nay", value: "today" },
                { label: "7 ngày gần nhất", value: "last7days" },
                { label: "Tháng này", value: "thisMonth" },
                { label: "Năm nay", value: "thisYear" },
                { label: "Tùy chỉnh", value: "custom" },
              ]}
            />
          </div>

          {rangeMode === "custom" && (
            <>
              <div>
                <p className="mb-2 text-sm font-medium">Từ ngày</p>
                <Input type="date" value={customFrom} onChange={(e) => setCustomFrom(e.target.value)} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Đến ngày</p>
                <Input type="date" value={customTo} onChange={(e) => setCustomTo(e.target.value)} />
              </div>
            </>
          )}

          <div className="md:justify-self-end">
            <Button onClick={handleApplyFilter} isLoading={isLoading}>
              Áp dụng
            </Button>
          </div>
        </div>
        {filterError && <p className="mt-3 text-sm text-destructive">{filterError}</p>}
        <p className="mt-4 text-sm text-muted-foreground">
          Kiểu dữ liệu: <span className="text-foreground font-medium">{data?.filterType || appliedFilter.period || "custom"}</span>
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <p className="text-sm text-muted-foreground">Tổng check-ins</p>
          <p className="text-2xl font-bold mt-2 sm:text-3xl">{data?.totalCheckins || 0}</p>
        </Card>
        <Card>
          <p className="text-sm text-muted-foreground">Check-ins hôm nay</p>
          <p className="text-2xl font-bold mt-2 sm:text-3xl">{data?.todayCheckins || 0}</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold mb-3">Theo ngày trong tuần</h3>
        <div className="space-y-2">
          {(data?.weeklyCheckins || []).map((item) => (
            <div key={item.date} className="flex items-center justify-between gap-3 rounded-lg border border-white/10 p-3">
              <span className="min-w-0 truncate">{item.date}</span>
              <strong className="shrink-0">{item.count}</strong>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
