import { useMemo, useState } from "react";
import { CalendarRange, DollarSign, ReceiptText } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";
import { Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { useAdminRevenue } from "@/hooks/use-queries";
import { normalizeRevenueSeries, buildFallbackChartData } from "@/services/admin.service";

export default function AdminDashboard() {
  const [rangeMode, setRangeMode] = useState("thisMonth");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");
  const [appliedFilter, setAppliedFilter] = useState({ period: "thisMonth", from: "", to: "" });
  const [filterError, setFilterError] = useState("");

  const { data, isLoading, isError } = useAdminRevenue(appliedFilter);

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
        setFilterError("Vui lòng chọn đầy đủ từ ngày và đến ngày.");
        return;
      }

      if (new Date(customFrom) > new Date(customTo)) {
        setFilterError("Từ ngày không được lớn hơn đến ngày.");
        return;
      }

      setAppliedFilter({ from: customFrom, to: customTo, period: "" });
      return;
    }

    setAppliedFilter({ period: rangeMode, from: "", to: "" });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Admin Dashboard" />
      {isLoading && <p className="text-muted-foreground">Đang tải dashboard...</p>}
      {isError && <p className="text-destructive">Không tải được dashboard.</p>}

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
          <h3 className="text-lg font-semibold mb-4">
            Doanh thu {data?.filterType ? `(${data.filterType})` : "kỳ hiện tại"}
          </h3>
          <p className="mb-3 text-sm text-muted-foreground">
            Granularity: <span className="text-foreground font-medium">{data?.granularity || "auto"}</span>
          </p>
          <div className="h-[280px] sm:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="x" />
                <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}M`} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Area type="monotone" dataKey="revenue" stroke="hsl(0 84% 63%)" fill="hsl(0 84% 63% / 0.2)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}
    </div>
  );
}
