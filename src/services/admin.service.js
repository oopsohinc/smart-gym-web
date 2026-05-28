import { format } from "date-fns";
import { normalizeOrdersResponse } from "@/services/staff.service";

/**
 * Admin Service — normalize, chart helpers và transform data cho admin domain
 */

// ─── Staff ────────────────────────────────────────────────────────────────────

export function normalizeAdminStaffResponse(raw) {
  const payload = raw?.data ?? raw;
  const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

  return list.map((staff) => {
    const status = String(staff?.status ?? "active").toLowerCase();
    return {
      ...staff,
      id: staff?.id ?? staff?._id ?? null,
      _id: staff?._id ?? staff?.id ?? null,
      name: staff?.name ?? staff?.fullName ?? "",
      fullName: staff?.fullName ?? staff?.name ?? "",
      email: staff?.email ?? "",
      phone: staff?.phone ?? "",
      role: staff?.role ?? "staff",
      status,
      isActive: status === "active",
      createdAt: staff?.createdAt ?? null,
      updatedAt: staff?.updatedAt ?? null,
      lastLoginAt: staff?.lastLoginAt ?? null,
    };
  });
}

// ─── Members ──────────────────────────────────────────────────────────────────

export function normalizeAdminMembersResponse(raw) {
  const payload = raw?.data ?? raw;
  const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

  return list.map((member) => {
    const status = String(member?.status ?? "active").toLowerCase();
    return {
      ...member,
      id: member?.id ?? member?._id ?? null,
      _id: member?._id ?? member?.id ?? null,
      name: member?.name ?? member?.fullName ?? "",
      fullName: member?.fullName ?? member?.name ?? "",
      email: member?.email ?? "",
      phone: member?.phone ?? "",
      role: member?.role ?? "member",
      status,
      isActive: status === "active",
      createdAt: member?.createdAt ?? null,
      updatedAt: member?.updatedAt ?? null,
      lastLoginAt: member?.lastLoginAt ?? null,
      dateOfBirth: member?.dateOfBirth ?? null,
    };
  });
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function normalizeAdminRevenueResponse(raw) {
  const payload = raw?.data ?? raw;
  const data = payload?.data ?? payload ?? {};

  return {
    from: data?.from ?? null,
    to: data?.to ?? null,
    filterType: data?.filterType ?? data?.rangeType ?? null,
    rangeType: data?.rangeType ?? data?.filterType ?? null,
    granularity: data?.granularity ?? null,
    totalRevenue: Number(data?.totalRevenue ?? 0),
    totalInvoices: Number(data?.totalInvoices ?? 0),
    trend: Array.isArray(data?.trend) ? data.trend : [],
    monthlyRevenue: Array.isArray(data?.monthlyRevenue) ? data.monthlyRevenue : [],
  };
}

export function normalizeAdminCheckinsResponse(raw) {
  const payload = raw?.data ?? raw;
  const data = payload?.data ?? payload ?? {};

  // Support new backend shape where `trend` is an array of documents like:
  // { _id: { year, month, day }, total: N }
  const trend = Array.isArray(data?.trend) ? data.trend : Array.isArray(data?.weeklyCheckins) ? data.weeklyCheckins : [];

  const normalizeTrend = (items) => {
    return items
      .map((it) => {
        // _id can be an object { year, month, day } or a string/date
        const id = it?._id ?? it?.date ?? it?.label ?? null;
        let date = null;
        if (id && typeof id === "object" && (id.year || id.month || id.day)) {
          // month in backend is 1-based
          const y = Number(id.year ?? id?.y ?? null);
          const m = Number(id.month ?? id?.m ?? id?.mon ?? null);
          const d = Number(id.day ?? id?.d ?? 1);
          if (!Number.isNaN(y) && !Number.isNaN(m)) {
            // create Date in UTC to avoid timezone shifting when comparing
            date = new Date(Date.UTC(y, Math.max(0, m - 1), Math.max(1, d)));
          }
        } else if (id && typeof id === "string") {
          const parsed = new Date(id);
          if (!Number.isNaN(parsed.getTime())) date = parsed;
        }

        const count = Number(it?.total ?? it?.count ?? it?.value ?? 0);
        return date ? { date: date.toISOString(), count } : null;
      })
      .filter(Boolean)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const daily = normalizeTrend(trend);
  const totalFromTrend = daily.reduce((s, x) => s + Number(x.count || 0), 0);

  // Determine today's count using `to` or last trend entry
  let todayCount = Number(data?.todayCheckins ?? 0);
  if (!todayCount) {
    if (daily.length) {
      const toDate = data?.to ? new Date(data.to) : new Date(daily[daily.length - 1].date);
      const toIso = toDate.toISOString().slice(0, 10);
      const found = daily.find((d) => d.date.slice(0, 10) === toIso);
      todayCount = Number(found?.count ?? 0);
    }
  }

  return {
    from: data?.from ?? null,
    to: data?.to ?? null,
    filterType: data?.filterType ?? data?.rangeType ?? null,
    totalCheckins: Number(data?.totalCheckins ?? totalFromTrend ?? 0),
    todayCheckins: Number(todayCount ?? 0),
    weeklyCheckins: daily, // keep the old key but fill with normalized daily series
    trend: trend,
    daily,
  };
}

export function buildDashboardRangeQuery(params = {}) {
  const period = params?.period || "thisMonth";
  const from = params?.from || "";
  const to = params?.to || "";

  const queryParams = new URLSearchParams();
  if (from || to) {
    if (from) queryParams.set("from", from);
    if (to) queryParams.set("to", to);
  } else if (period) {
    queryParams.set("period", period);
  }

  return {
    period,
    from,
    to,
    queryString: queryParams.toString(),
  };
}

// ─── Revenue Chart Helpers ─────────────────────────────────────────────────────

export function normalizeRevenueSeries(series) {
  if (!Array.isArray(series)) {
    return [];
  }

  return series.map((item, index) => ({
    x: item?.label ?? item?.bucket ?? item?.month ?? item?.date ?? item?.hour ?? `Mốc ${index + 1}`,
    revenue: Number(item?.revenue ?? item?.value ?? item?.amount ?? item?.totalRevenue ?? 0),
  }));
}

function distributeRevenue(totalRevenue, labels) {
  if (!labels.length || totalRevenue <= 0) {
    return [];
  }

  const base = Math.floor(totalRevenue / labels.length);
  let remainder = totalRevenue - base * labels.length;

  return labels.map((label) => {
    const value = base + (remainder > 0 ? 1 : 0);
    if (remainder > 0) {
      remainder -= 1;
    }

    return { x: label, revenue: value };
  });
}

export function buildFallbackChartData(data, appliedFilter) {
  const totalRevenue = Number(data?.totalRevenue ?? 0);
  if (totalRevenue <= 0) {
    return [];
  }

  const today = new Date();
  const fromDate = data?.from ? new Date(data.from) : null;
  const toDate = data?.to ? new Date(data.to) : null;
  const rangeType = String(
    data?.filterType || (appliedFilter?.from || appliedFilter?.to ? "custom" : appliedFilter?.period || "thisMonth"),
  ).toLowerCase();

  if (rangeType === "day" || rangeType === "today") {
    const label = format(toDate || fromDate || today, "dd/MM");
    return [{ x: label, revenue: totalRevenue }];
  }

  if (rangeType === "week" || rangeType === "last7days" || rangeType === "7days") {
    const end = toDate || today;
    const labels = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(end);
      date.setDate(end.getDate() - i);
      labels.push(format(date, "dd/MM"));
    }
    return distributeRevenue(totalRevenue, labels);
  }

  if (rangeType === "year" || rangeType === "thisyear") {
    const labels = Array.from({ length: 12 }, (_, idx) => `Th${idx + 1}`);
    return distributeRevenue(totalRevenue, labels);
  }

  if (rangeType === "custom" && fromDate && toDate) {
    const labels = [];
    const start = new Date(fromDate);
    const end = new Date(toDate);
    let cursor = new Date(start);

    while (cursor <= end && labels.length < 31) {
      labels.push(format(cursor, "dd/MM"));
      cursor.setDate(cursor.getDate() + 1);
    }

    if (labels.length === 0) {
      labels.push(format(start, "dd/MM"));
    }

    return distributeRevenue(totalRevenue, labels);
  }

  return distributeRevenue(totalRevenue, ["Tuần 1", "Tuần 2", "Tuần 3", "Tuần 4"]);
}

// Re-export để tránh import từ nhiều chỗ
export { normalizeOrdersResponse };
