import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { normalizeOrdersResponse, normalizeStaffMembersResponse } from "@/services/staff.service";

export const useStaffPendingOrders = () =>
  useQuery({
    queryKey: ["/staff/orders/pending"],
    queryFn: async () => normalizeOrdersResponse((await api.get("/staff/orders/pending")).data),
  });

export const useStaffMembers = (mode = "active", { page = 1, limit = 10 } = {}) =>
  useQuery({
    queryKey: ["/staff/members", mode, page, limit],
    queryFn: async () => {
      const res = await api.get(`/staff/members?mode=${mode}&page=${page}&limit=${limit}`);
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
    mutationFn: async (memberId) => (await api.post("/staff/checkin/manual", { memberId })).data,
  });

export const useQrCheckin = () =>
  useMutation({
    mutationFn: async (qrCode) => (await api.post("/staff/checkin/qr", { qrCode })).data,
  });

export const useCounterSale = () =>
  useMutation({
    mutationFn: async (data) => (await api.post("/staff/orders/counter-sale", data)).data,
  });
