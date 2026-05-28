import { useMemo, useState } from "react";
import { CalendarRange, DollarSign, ReceiptText } from "lucide-react";
import { format } from "date-fns";
import { RevenueChart } from "@/components/admin/DashboardCharts";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { formatCurrency, parseViDate, formatViDateToIso } from "@/lib/utils";
import { useAdminRevenue } from "@/hooks/use-queries";
import { normalizeRevenueSeries, buildFallbackChartData } from "@/services/admin.service";

function translatePeriod(period = "") {
  if (!period) return "Kỳ hiện tại";
  const lower = period.toLowerCase();
  if (lower.includes("today") || lower.includes("hôm nay")) return "Hôm nay";
  if (lower.includes("7days") || lower.includes("7 ngày")) return "7 ngày gần nhất";
  if (lower.includes("month") || lower.includes("tháng")) return "Tháng này";
  if (lower.includes("year") || lower.includes("năm")) return "Năm nay";
  if (lower.includes("custom") || lower.includes("tùy chỉnh")) return "Tùy chỉnh";
  return period;
}

function translateGranularity(gran = "") {
  if (!gran) return "Tự động";
  const lower = gran.toLowerCase();
  if (lower.includes("day") || lower.includes("daily") || lower.includes("ngày")) return "Theo ngày";
  if (lower.includes("week") || lower.includes("weekly") || lower.includes("tuần")) return "Theo tuần";
  if (lower.includes("month") || lower.includes("monthly") || lower.includes("tháng")) return "Theo tháng";
  if (lower.includes("hour") || lower.includes("hourly") || lower.includes("giờ")) return "Theo giờ";
  return gran;
}

export default function AdminDashboard() {
  const [rangeMode, setRangeMode] = useState("thisMonth");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({ period: "thisMonth", from: "", to: "" });
  const [filterError, setFilterError] = useState("");

  const { data, isLoading, isError } = useAdminRevenue(appliedFilter);

  const chartTitlePeriod = useMemo(() => {
    if (appliedFilter.from && appliedFilter.to) {
      return `Tùy chỉnh (${format(new Date(appliedFilter.from), "dd/MM/yyyy")} - ${format(new Date(appliedFilter.to), "dd/MM/yyyy")})`;
    }
    return translatePeriod(data?.filterType || appliedFilter.period);
  }, [appliedFilter, data?.filterType]);

  // ✅ Chart helpers giờ import từ services/admin.service.js — không còn trong file này
  const chartData = useMemo(() => {
    const trendSeries = normalizeRevenueSeries(data?.trend);
    if (trendSeries.length > 0) {
      return trendSeries;
    }

    const normalizedSeries = normalizeRevenueSeries(data?.monthlyRevenue);
    if (normalizedSeries.length > 0) {
      return normalizedSeries;
    }

    return buildFallbackChartData(data, appliedFilter);
  }, [data, appliedFilter]);

  const stats = [
    { title: "Tổng doanh thu", value: formatCurrency(data?.totalRevenue), icon: DollarSign },
    { title: "Tổng hóa đơn", value: data?.totalInvoices || 0, icon: ReceiptText },
    {
      title: "Khoảng thời gian",
      value:
        data?.from && data?.to
          ? `${format(new Date(data.from), "dd/MM/yyyy")} - ${format(new Date(data.to), "dd/MM/yyyy")}`
          : "-",
      icon: CalendarRange,
    },
  ];

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

      setAppliedFilter({ from: formatViDateToIso(customFrom), to: formatViDateToIso(customTo), period: "" });
      return;
    }

    setAppliedFilter({ period: rangeMode, from: "", to: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Trang chủ quản trị" />
      {isLoading && <p className="text-muted-foreground">Đang tải dashboard...</p>}
      {isError && <p className="text-destructive">Không tải được dashboard.</p>}

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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.title} className="flex items-start gap-4 p-4 sm:p-6">
            <item.icon className="h-7 w-7 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">{item.title}</p>
              <p className="break-words text-xl font-bold sm:text-2xl">{item.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {!isLoading && !isError && chartData.length > 0 && (
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4 border-b border-[#d1d9e6]/50 pb-3">
            <h3 className="text-base font-bold text-[#2d3436]">
              Doanh thu: <span className="text-[#ff4757]">{chartTitlePeriod}</span>
            </h3>
            <p className="text-xs text-[#4a5568]">
              Độ chi tiết: <span className="text-[#2d3436] font-semibold">{translateGranularity(data?.granularity)}</span>
            </p>
          </div>
          <div className="h-[300px] sm:h-[380px]">
            <RevenueChart data={chartData} />
          </div>
        </Card>
      )}
    </div>
  );
}
