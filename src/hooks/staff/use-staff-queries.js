import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeOrdersResponse, normalizeStaffMembersResponse } from "@/services/staff.service";

export const useStaffPendingOrders = ({ page = 1, limit = 10, q = "", packageId = "", from = "", to = "" } = {}) =>
  useQuery({
    queryKey: ["/staff/orders/pending", page, limit, q, packageId, from, to],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (q) params.append("q", q);
      if (packageId) params.append("packageId", packageId);
      if (from) params.append("from", from);
      if (to) params.append("to", to);

      const res = await api.get(`/staff/orders/pending?${params.toString()}`);
      const raw = res.data;
      if (Array.isArray(raw)) return { data: normalizeOrdersResponse(raw), pagination: null };
      return { data: normalizeOrdersResponse(raw?.data ?? []), pagination: raw?.pagination ?? null };
    },
    keepPreviousData: true,
  });

export const useStaffMembers = ({ mode = "active", page = 1, limit = 10, q = "", status = "", packageId = "" } = {}) =>
  useQuery({
    queryKey: ["/staff/members", mode, page, limit, q, status, packageId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (mode) params.append("mode", mode);
      if (page) params.append("page", page);
      if (limit) params.append("limit", limit);
      if (q) params.append("q", q);
      if (status) params.append("status", status);
      if (packageId) params.append("packageId", packageId);

      const res = await api.get(`/staff/members?${params.toString()}`);
      const raw = res.data;
      if (Array.isArray(raw)) return { data: normalizeStaffMembersResponse(raw), pagination: null };
      return { data: normalizeStaffMembersResponse(raw?.data ?? []), pagination: raw?.pagination ?? null };
    },
    keepPreviousData: true,
  });

export const useStaffApproveOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.post(`/staff/orders/${id}/approve`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/staff/orders/pending"] }),
  });
};

export const useStaffRejectOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reason }) =>
      (await api.post(`/staff/orders/${id}/reject`, { reason })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/staff/orders/pending"] }),
  });
};

export const useManualCheckin = () =>
  useMutation({
    mutationFn: async (phone) => (await api.post("/staff/checkin/manual", { phone })).data,
  });

export const useQrCheckin = () =>
  useMutation({
    mutationFn: async (qrToken) => (await api.post("/staff/checkin/qr", { qrToken })).data,
  });

export const useCounterSale = () =>
  useMutation({
    mutationFn: async (data) => (await api.post("/staff/orders/counter-sale", data)).data,
  });
