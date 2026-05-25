import { toDurationDays } from "@/services/package.service";

/**
 * Staff Service — normalize và transform data cho staff domain
 */

export function normalizeStaffMembersResponse(raw) {
  const payload = raw?.data ?? raw;
  const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];

  return list.map((member) => ({
    ...member,
    id: member?.id ?? member?._id ?? null,
    _id: member?._id ?? member?.id ?? null,
    name: member?.name ?? member?.fullName ?? "",
    fullName: member?.fullName ?? member?.name ?? "",
    email: member?.email ?? "",
    phone: member?.phone ?? "",
    status: member?.status ?? "active",
    currentPackage: member?.currentPackage ?? null,
    packageName:
      member?.packageName ??
      member?.currentPackage?.name ??
      member?.package?.name ??
      null,
    subscriptionEndDate: member?.subscriptionEndDate ?? member?.endDate ?? null,
    daysRemaining: member?.remainingDays ?? member?.daysRemaining ?? null,
  }));
}

export function normalizeOrderItem(order) {
  const member = order?.memberId ?? {};
  const packageObject = order?.packageId ?? {};

  return {
    ...order,
    id: order?.id ?? order?._id ?? null,
    _id: order?._id ?? order?.id ?? null,
    orderNo: order?.orderNo ?? "",
    memberName: member?.fullName ?? order?.memberName ?? "",
    memberEmail: member?.email ?? order?.memberEmail ?? "",
    memberPhone: member?.phone ?? order?.memberPhone ?? "",
    packageName: packageObject?.name ?? order?.packageName ?? "",
    packageCode: packageObject?.code ?? order?.packageCode ?? "",
    packageDurationDays:
      Number(packageObject?.durationDays ?? 0) > 0
        ? Number(packageObject.durationDays)
        : toDurationDays(packageObject?.durationValue, packageObject?.durationUnit),
    paymentMethod: order?.paymentMethod ?? "",
    paymentProvider: order?.paymentProvider ?? "",
    paymentStatus: order?.paymentStatus ?? "",
    status: order?.status ?? "",
    amount: Number(order?.amount ?? 0),
  };
}

export function normalizeOrdersResponse(raw) {
  const payload = raw?.data ?? raw;
  const list = Array.isArray(payload?.data) ? payload.data : Array.isArray(payload) ? payload : [];
  return list.map(normalizeOrderItem);
}
