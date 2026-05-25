/**
 * Package Service — normalize và transform data cho gói tập
 */

export function toDurationDays(durationValue, durationUnit) {
  const value = Number(durationValue);
  if (!Number.isFinite(value) || value <= 0) {
    return 0;
  }

  const unit = String(durationUnit || "day").toLowerCase();
  if (unit === "month" || unit === "months") {
    return value * 30;
  }
  if (unit === "year" || unit === "years") {
    return value * 365;
  }

  return value;
}

export function normalizePackageItem(pkg) {
  const durationValue = Number(pkg?.durationValue ?? 0);
  const durationUnit = pkg?.durationUnit ?? "day";
  const durationDays =
    Number(pkg?.durationDays) > 0
      ? Number(pkg.durationDays)
      : toDurationDays(durationValue, durationUnit);

  return {
    ...pkg,
    id: pkg?.id ?? pkg?._id ?? null,
    _id: pkg?._id ?? pkg?.id ?? null,
    code: pkg?.code ?? "",
    name: pkg?.name ?? "",
    description: pkg?.description ?? "",
    price: Number(pkg?.price ?? 0),
    isActive: typeof pkg?.isActive === "boolean" ? pkg.isActive : true,
    durationValue: durationValue > 0 ? durationValue : Number(pkg?.durationDays ?? 0),
    durationUnit,
    durationDays,
  };
}

export function normalizePackagesResponse(raw) {
  const payload = raw?.data ?? raw;
  const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return list.map(normalizePackageItem);
}

export function normalizePackageMutationPayload(data) {
  const durationDays = Number(data?.durationDays ?? 0);

  if (durationDays > 0) {
    const durationValue = Math.max(1, Math.round(durationDays / 30));
    return {
      ...data,
      durationValue,
      durationUnit: "month",
    };
  }

  return data;
}
