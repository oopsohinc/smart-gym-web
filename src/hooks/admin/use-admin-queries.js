import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { createVnpayPayment } from "@/lib/payments";
import { buildQueryString } from "@/lib/queryString";
import {
  normalizeAdminStaffResponse,
  normalizeAdminMembersResponse,
  normalizeAdminRevenueResponse,
  normalizeAdminCheckinsResponse,
  buildDashboardRangeQuery,
} from "@/services/admin.service";
import { normalizePackagesResponse, normalizePackageMutationPayload } from "@/services/package.service";
import { normalizeOrdersResponse } from "@/services/staff.service";

/** GET /api/admin/staff — search: q, status; paginate: page, limit */
export const useAdminStaff = ({ page = 1, limit = 10, q = "", status = "" } = {}) =>
  useQuery({
    queryKey: ["/admin/staff", page, limit, q, status],
    queryFn: async () => {
      const qs = buildQueryString({ page, limit, q, status });
      const res = await api.get(`/admin/staff?${qs}`);
      const raw = res.data;
      if (Array.isArray(raw)) return { data: normalizeAdminStaffResponse(raw), pagination: null };
      return { data: normalizeAdminStaffResponse(raw?.data ?? []), pagination: raw?.pagination ?? null };
    },
    keepPreviousData: true,
  });

/** GET /api/admin/packages — search: q; paginate: page, limit */
export const useAdminPackages = ({ page = 1, limit = 10, q = "" } = {}) =>
  useQuery({
    queryKey: ["/admin/packages", page, limit, q],
    queryFn: async () => {
      const qs = buildQueryString({ page, limit, q });
      const res = await api.get(`/admin/packages?${qs}`);
      const raw = res.data;
      if (Array.isArray(raw)) return { data: normalizePackagesResponse(raw), pagination: null };
      return { data: normalizePackagesResponse(raw?.data ?? []), pagination: raw?.pagination ?? null };
    },
    keepPreviousData: true,
  });

/** GET /api/admin/orders — search: q; filter: packageId, status, from, to; paginate: page, limit */
export const useAdminOrders = ({ page = 1, limit = 10, q = "", packageId = "", status = "", from = "", to = "" } = {}) =>
  useQuery({
    queryKey: ["/admin/orders", page, limit, q, packageId, status, from, to],
    queryFn: async () => {
      const qs = buildQueryString({ page, limit, q, packageId, status, from, to });
      const res = await api.get(`/admin/orders?${qs}`);
      const raw = res.data;
      if (Array.isArray(raw)) return { data: normalizeOrdersResponse(raw), pagination: null };
      return { data: normalizeOrdersResponse(raw?.data ?? []), pagination: raw?.pagination ?? null };
    },
    keepPreviousData: true,
  });

/** GET /api/admin/members — search: q; paginate: page, limit */
export const useAdminMembers = ({ page = 1, limit = 10, q = "" } = {}) =>
  useQuery({
    queryKey: ["/admin/members", page, limit, q],
    queryFn: async () => {
      const qs = buildQueryString({ page, limit, q });
      const res = await api.get(`/admin/members?${qs}`);
      const raw = res.data;
      if (Array.isArray(raw)) return { data: normalizeAdminMembersResponse(raw), pagination: null };
      return { data: normalizeAdminMembersResponse(raw?.data ?? []), pagination: raw?.pagination ?? null };
    },
    keepPreviousData: true,
  });

export const useAdminRevenue = (params = {}) => {
  const { period, from, to, queryString } = buildDashboardRangeQuery(params);
  const queryKey = ["/admin/dashboard/revenue", period, from, to];

  return useQuery({
    queryKey,
    queryFn: async () => {
      const url = queryString ? `/admin/dashboard/revenue?${queryString}` : "/admin/dashboard/revenue";
      return normalizeAdminRevenueResponse((await api.get(url)).data);
    },
  });
};

export const useAdminCheckins = (params = {}) => {
  const { period, from, to, queryString } = buildDashboardRangeQuery(params);

  return useQuery({
    queryKey: ["/admin/dashboard/checkins", period, from, to],
    queryFn: async () => {
      const url = queryString ? `/admin/dashboard/checkins?${queryString}` : "/admin/dashboard/checkins";
      return normalizeAdminCheckinsResponse((await api.get(url)).data);
    },
  });
};

export const useAdminCreateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => (await api.post("/admin/staff", data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/staff"] }),
  });
};

export const useAdminUpdateStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => (await api.patch(`/admin/staff/${id}`, data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/staff"] }),
  });
};

export const useAdminDeleteStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/admin/staff/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/staff"] }),
  });
};

export const useAdminCreatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) =>
      (await api.post("/admin/packages", normalizePackageMutationPayload(data))).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/packages"] }),
  });
};

export const useAdminUpdatePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) =>
      (await api.patch(`/admin/packages/${id}`, normalizePackageMutationPayload(data))).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/packages"] }),
  });
};

export const useAdminDeletePackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/admin/packages/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/packages"] }),
  });
};

export const useCreateVnpayPayment = () =>
  useMutation({
    mutationFn: createVnpayPayment,
  });

// ─── Orders ───────────────────────────────────────────────────────────────────

/** DELETE /api/admin/orders/:orderId — Void / hủy order */
export const useAdminVoidOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (orderId) => (await api.delete(`/admin/orders/${orderId}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/orders"] }),
  });
};

// ─── Invoices ─────────────────────────────────────────────────────────────────

/** GET /api/admin/invoices — search: q; filter: packageId, status, from, to; paginate: page, limit */
export const useAdminInvoices = ({ page = 1, limit = 10, q = "", packageId = "", status = "", from = "", to = "" } = {}) =>
  useQuery({
    queryKey: ["/admin/invoices", page, limit, q, packageId, status, from, to],
    queryFn: async () => {
      const qs = buildQueryString({ page, limit, q, packageId, status, from, to });
      const res = await api.get(`/admin/invoices?${qs}`);
      return res.data;
    },
    keepPreviousData: true,
  });

// ─── Roles & Permissions ──────────────────────────────────────────────────────

/** GET /api/admin/permissions */
export const useAdminPermissions = () =>
  useQuery({
    queryKey: ["/admin/permissions"],
    queryFn: async () => (await api.get("/admin/permissions")).data,
  });

/** GET /api/admin/roles */
export const useAdminRoles = () =>
  useQuery({
    queryKey: ["/admin/roles"],
    queryFn: async () => (await api.get("/admin/roles")).data,
  });

/** POST /api/admin/roles */
export const useAdminCreateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => (await api.post("/admin/roles", data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/roles"] }),
  });
};

/** PATCH /api/admin/roles/:roleId */
export const useAdminUpdateRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) => (await api.patch(`/admin/roles/${id}`, data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/roles"] }),
  });
};

/** DELETE /api/admin/roles/:roleId */
export const useAdminDeleteRole = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/admin/roles/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/roles"] }),
  });
};

// ─── Knowledge Base ───────────────────────────────────────────────────────────

/** GET /api/admin/knowledge-bases — search: q on title; paginate: page, limit */
export const useAdminKnowledgeBases = ({ page = 1, limit = 10, q = "" } = {}) =>
  useQuery({
    queryKey: ["/admin/knowledge-bases", page, limit, q],
    queryFn: async () => {
      const qs = buildQueryString({ page, limit, q });
      const res = await api.get(`/admin/knowledge-bases?${qs}`);
      const raw = res.data;
      if (Array.isArray(raw)) return { data: raw, pagination: null };
      return { data: raw?.data ?? raw?.knowledgeBases ?? [], pagination: raw?.pagination ?? null };
    },
    keepPreviousData: true,
  });

/** GET /api/admin/knowledge-bases/:id */
export const useAdminKnowledgeBaseDetail = (id) =>
  useQuery({
    queryKey: ["/admin/knowledge-bases", id],
    queryFn: async () => (await api.get(`/admin/knowledge-bases/${id}`)).data,
    enabled: Boolean(id),
  });

/** POST /api/admin/knowledge-bases */
export const useAdminCreateKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => (await api.post("/admin/knowledge-bases", data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/knowledge-bases"] }),
  });
};

/** PATCH /api/admin/knowledge-bases/:id */
export const useAdminUpdateKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }) =>
      (await api.patch(`/admin/knowledge-bases/${id}`, data)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/knowledge-bases"] }),
  });
};

/** DELETE /api/admin/knowledge-bases/:id */
export const useAdminDeleteKnowledgeBase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => (await api.delete(`/admin/knowledge-bases/${id}`)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/admin/knowledge-bases"] }),
  });
};
