import React from "react";
import Chart from "react-apexcharts";

/**
 * 1. Biểu đồ Doanh thu (Revenue Chart)
 * Nhận prop: `data` - mảng các object [{ x: "Tuần 1", revenue: 5000000 }, ...]
 */
export function RevenueChart({ data = [] }) {
  // Chuẩn bị dữ liệu cho ApexCharts
  const series = [
    {
      name: "Doanh thu",
      data: data.map((item) => item.revenue || item.value || 0),
    },
  ];

  const categories = data.map((item) => item.x || item.label || "");

  const options = {
    chart: {
      id: "revenue-chart",
      type: "area",
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    colors: ["#EF4444"], // Màu đỏ thương hiệu
    stroke: {
      curve: "smooth",
      width: 3,
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.6,
        opacityTo: 0.1,
        stops: [0, 90, 100],
      },
    },
    grid: {
      borderColor: "#d1d9e6",
      strokeDashArray: 4,
      xaxis: {
        lines: { show: false }, // Ẩn grid lines dọc để UI sạch hơn
      },
      yaxis: {
        lines: { show: true },
      },
    },
    xaxis: {
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#4a5568",
          fontSize: "12px",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#4a5568",
          fontSize: "12px",
        },
        // Formatter rút gọn số tiền (ví dụ: 1,000,000 -> 1.0M)
        formatter: (value) => {
          if (value === 0) return "0đ";
          if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
          if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
          return `${value}đ`;
        },
      },
    },
    tooltip: {
      theme: "light",
      x: { show: true },
      y: {
        formatter: (value) =>
          new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
          }).format(value),
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Chart options={options} series={series} type="area" height="100%" width="100%" />
    </div>
  );
}

/**
 * 2. Biểu đồ Thống kê Check-in (Check-in Bar Chart)
 * Nhận prop: `data` - mảng các object [{ date: "2026-05-26T00:00:00.000Z", count: 5 }, ...]
 */
export function CheckinChart({ data = [] }) {
  const series = [
    {
      name: "Lượt check-in",
      data: data.map((item) => item.count || 0),
    },
  ];

  const categories = data.map((item) => item.date || "");

  const options = {
    chart: {
      id: "checkin-chart",
      type: "bar",
      toolbar: { show: false },
      fontFamily: "inherit",
    },
    colors: ["#1F2937"], // Xám đen thanh lịch (hoặc dùng "#EF4444" cho đồng bộ đỏ)
    plotOptions: {
      bar: {
        borderRadius: 4, // Bo góc cột nhẹ
        columnWidth: "45%",
        distributed: false,
      },
    },
    dataLabels: {
      enabled: false,
    },
    grid: {
      borderColor: "#d1d9e6",
      strokeDashArray: 4,
      xaxis: {
        lines: { show: false },
      },
    },
    xaxis: {
      type: "datetime", // Định dạng kiểu datetime
      categories: categories,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: {
        style: {
          colors: "#4a5568",
          fontSize: "12px",
        },
        // Formatter của ApexCharts chuyển đổi ISO string sang dd/MM dễ nhìn
        datetimeFormatter: {
          year: "yyyy",
          month: "MM/yyyy",
          day: "dd/MM",
          hour: "HH:mm",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#4a5568",
          fontSize: "12px",
        },
        formatter: (value) => Math.floor(value), // Chỉ hiển thị số nguyên
      },
    },
    tooltip: {
      theme: "light",
      x: {
        format: "dd/MM/yyyy", // Tooltip format ngày đầy đủ
      },
    },
  };

  return (
    <div className="w-full h-full min-h-[300px]">
      <Chart options={options} series={series} type="bar" height="100%" width="100%" />
    </div>
  );
}
