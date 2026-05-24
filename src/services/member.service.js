import { api } from "@/lib/api";

/**
 * Member Service — normalize và transform data cho member domain
 */

export function normalizeSubscriptionResponse(raw) {
  const payload = raw?.data ?? raw;
  const subscription =
    payload?.activeSubscription ??
    payload?.subscription ??
    payload?.data?.activeSubscription ??
    payload?.data?.subscription ??
    null;
  const subscriptions =
    payload?.subscriptions ??
    payload?.data?.subscriptions ??
    (subscription ? [subscription] : []);
  const packageObject = subscription?.packageId ?? subscription?.package ?? null;

  if (!payload || typeof payload !== "object") {
    return { isActive: false };
  }

  const startDate =
    subscription?.startDate || payload.startDate || payload.startedAt || payload.fromDate || null;
  const endDate = subscription?.endDate || payload.endDate || payload.expiredAt || payload.toDate || null;

  const packageName =
    packageObject?.name ||
    subscription?.packageName ||
    payload.packageName ||
    payload.package?.name ||
    payload.planName ||
    payload.subscriptionPackage?.name ||
    null;

  const activeByStatus =
    String(subscription?.status || payload.status || "").toLowerCase() === "active" ||
    String(payload.subscriptionStatus || "").toLowerCase() === "active";

  const isActive =
    typeof payload.hasActiveSubscription === "boolean"
      ? payload.hasActiveSubscription
      : typeof payload.isActive === "boolean"
        ? payload.isActive
        : typeof payload.active === "boolean"
          ? payload.active
          : activeByStatus;

  let daysRemaining = Number(payload.remainingDays ?? payload.daysRemaining ?? subscription?.remainingDaysCache);
  if (Number.isNaN(daysRemaining)) {
    if (endDate) {
      const ms = new Date(endDate).getTime() - Date.now();
      daysRemaining = Math.max(0, Math.ceil(ms / 86400000));
    } else {
      daysRemaining = 0;
    }
  }

  const normalizedSubscriptions = Array.isArray(subscriptions)
    ? subscriptions.map((item) => {
      const itemPackage = item?.packageId ?? item?.package ?? null;
      const itemEndDate = item?.endDate ?? null;
      let itemRemainingDays = Number(item?.remainingDays ?? item?.remainingDaysCache);

      if (Number.isNaN(itemRemainingDays)) {
        if (itemEndDate) {
          const ms = new Date(itemEndDate).getTime() - Date.now();
          itemRemainingDays = Math.max(0, Math.ceil(ms / 86400000));
        } else {
          itemRemainingDays = 0;
        }
      }

      return {
        ...item,
        id: item?.id ?? item?._id ?? null,
        _id: item?._id ?? item?.id ?? null,
        status: item?.status ?? null,
        packageName: itemPackage?.name ?? item?.packageName ?? null,
        packageCode: itemPackage?.code ?? null,
        packagePrice: Number(itemPackage?.price ?? 0),
        startDate: item?.startDate ?? null,
        endDate: itemEndDate,
        remainingDays: itemRemainingDays,
      };
    })
    : [];

  const pendingSubscriptions = normalizedSubscriptions.filter(
    (item) => String(item?.status || "").toLowerCase() === "pending",
  );

  return {
    isActive,
    hasActiveSubscription: isActive,
    packageName,
    packageCode: packageObject?.code ?? null,
    packagePrice: Number(packageObject?.price ?? 0),
    startDate,
    endDate,
    daysRemaining,
    pendingSubscriptions,
    subscriptions: normalizedSubscriptions,
    subscription,
  };
}

export function normalizeProfileResponse(raw) {
  const payload = raw?.data ?? raw;
  const user = payload?.user ?? payload?.data?.user ?? payload?.member ?? payload ?? {};
  const activeSubscription =
    payload?.activeSubscription ?? payload?.data?.activeSubscription ?? payload?.subscription ?? null;

  const packageObject = activeSubscription?.packageId ?? activeSubscription?.package ?? null;
  const startDate = activeSubscription?.startDate ?? null;
  const endDate = activeSubscription?.endDate ?? null;

  let remainingDays = Number(payload?.remainingDays ?? activeSubscription?.remainingDaysCache);
  if (Number.isNaN(remainingDays)) {
    if (endDate) {
      const ms = new Date(endDate).getTime() - Date.now();
      remainingDays = Math.max(0, Math.ceil(ms / 86400000));
    } else {
      remainingDays = 0;
    }
  }

  const hasActiveSubscription =
    Boolean(activeSubscription) &&
    String(activeSubscription?.status || "").toLowerCase() !== "inactive";

  return {
    ...user,
    _id: user._id ?? user.id ?? null,
    id: user.id ?? user._id ?? null,
    name: user.fullName ?? user.name ?? "",
    fullName: user.fullName ?? user.name ?? "",
    email: user.email ?? "",
    phone: user.phone ?? "",
    role: user.role ?? "member",
    status: user.status ?? "active",
    activeSubscription,
    hasActiveSubscription,
    packageName: packageObject?.name ?? activeSubscription?.packageName ?? null,
    startDate,
    endDate,
    remainingDays,
  };
}

export function normalizeQrResponse(raw) {
  const payload = raw?.data ?? raw;
  const qrData = payload?.data ?? payload ?? {};

  return {
    token: qrData?.token ?? qrData?.qrCode ?? qrData?.qrToken ?? null,
    ttlSeconds: qrData?.ttlSeconds ?? null,
    expiresAt: qrData?.expiresAt ?? null,
    jti: qrData?.jti ?? null,
    message: payload?.message ?? null,
  };
}

/**
 * Thử nhiều endpoint liên tiếp — fallback nếu backend chưa chuẩn hóa route
 */
export async function fetchSubscriptionStatus() {
  const endpoints = ["/member/subscription/status", "/member/subscription", "/member/subscriptions/current"];
  let lastError;

  for (const endpoint of endpoints) {
    try {
      const res = await api.get(endpoint);
      return normalizeSubscriptionResponse(res.data);
    } catch (error) {
      const status = error?.response?.status;

      if (status === 404 || status === 405) {
        lastError = error;
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("No subscription endpoint available");
}
