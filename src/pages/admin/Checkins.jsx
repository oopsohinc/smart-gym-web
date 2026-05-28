import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { CheckinChart } from "@/components/admin/DashboardCharts";
import { useAdminCheckins } from "@/hooks/use-queries";
import { parseViDate, formatViDateToIso } from "@/lib/utils";

export default function AdminCheckins() {
  const [rangeMode, setRangeMode] = useState("thisMonth");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({ period: "thisMonth", from: "", to: "" });
  const [filterError, setFilterError] = useState("");

  const { data, isLoading, isError } = useAdminCheckins(appliedFilter);

  const checkinsPeriodText = useMemo(() => {
    if (appliedFilter.from && appliedFilter.to) {
      return ` (${format(new Date(appliedFilter.from), "dd/MM/yyyy")} - ${format(new Date(appliedFilter.to), "dd/MM/yyyy")})`;
    }
    if (appliedFilter.period) {
      const trans = { today: "Hôm nay", last7days: "7 ngày gần nhất", thisMonth: "Tháng này", thisYear: "Năm nay" };
      return ` (${trans[appliedFilter.period] || appliedFilter.period})`;
    }
    return "";
  }, [appliedFilter]);

  const handleApplyFilter = () => {
    setFilterError("");

    if (rangeMode === "custom") {
      if (!customFrom || !customTo) {
        setFilterError("Vui lòng nhập đầy đủ từ ngày và đến ngày.");
        return;
      }

      const dFrom = parseViDate(customFrom);
      const dTo = parseViDate(customTo);

      if (!dFrom || !dTo) {
        setFilterError("Định dạng ngày không hợp lệ. Vui lòng dùng dd/mm/yyyy");
        return;
      }

      if (dFrom > dTo) {
        setFilterError("Từ ngày không được lớn hơn đến ngày.");
        return;
      }

      setAppliedFilter({ period: "", from: formatViDateToIso(customFrom), to: formatViDateToIso(customTo) });
      return;
    }

    setAppliedFilter({ period: rangeMode, from: "", to: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Thống kê check-in" />

      {isLoading && <p className="text-muted-foreground">Đang tải check-ins...</p>}
      {isError && <p className="text-destructive">Không tải được check-ins.</p>}

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold shrink-0 text-[#4a5568]">Thời gian:</span>
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
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="dd/mm/yyyy"
                maxLength={10}
                value={customFrom}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9/]/g, "");
                  if (val.length === 2 && !val.includes("/")) {
                    val = val + "/";
                  } else if (val.length === 5 && val.split("/").length === 2) {
                    val = val + "/";
                  }
                  setCustomFrom(val);
                }}
              />
              <span className="text-sm text-[#4a5568]">-</span>
              <Input
                type="text"
                placeholder="dd/mm/yyyy"
                maxLength={10}
                value={customTo}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9/]/g, "");
                  if (val.length === 2 && !val.includes("/")) {
                    val = val + "/";
                  } else if (val.length === 5 && val.split("/").length === 2) {
                    val = val + "/";
                  }
                  setCustomTo(val);
                }}
              />
            </div>
          )}

          <Button onClick={handleApplyFilter} isLoading={isLoading} size="sm" className="h-10 px-5">
            Áp dụng
          </Button>

          {filterError && <p className="text-sm text-destructive">{filterError}</p>}
        </div>
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
        <h3 className="font-semibold mb-3">
          Lượt check-in theo ngày<span className="text-[#ff4757]">{checkinsPeriodText}</span>
        </h3>
        <div className="h-[300px] sm:h-[380px]">
          <CheckinChart data={data?.weeklyCheckins || []} />
        </div>
      </Card>
    </div>
  );
}
