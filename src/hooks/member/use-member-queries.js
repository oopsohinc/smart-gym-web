import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { normalizeProfileResponse, fetchSubscriptionStatus, normalizeQrResponse } from "@/services/member.service";
import { normalizeWorkoutPlan, normalizeWorkoutPlansResponse } from "@/services/workout.service";

export const useProfile = () =>
  useQuery({
    queryKey: ["/member/profile"],
    queryFn: async () => normalizeProfileResponse(await api.get("/member/profile")),
  });

export const useSubscription = () =>
  useQuery({
    queryKey: ["/member/subscription/status"],
    queryFn: fetchSubscriptionStatus,
  });

export const useActivateSubscription = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (subscriptionId) =>
      (await api.post(`/member/subscriptions/${subscriptionId}/activate`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/member/subscription/status"] });
      toast({ title: "Kích hoạt gói tập thành công" });
    },
    onError: (err) => {
      const errorCode = err?.response?.data?.code;
      let message = err?.response?.data?.message || "Kích hoạt gói thất bại";

      if (errorCode === "subscription_not_ready") {
        message = "Gói chưa đến ngày bắt đầu";
      } else if (errorCode === "active_subscription_exists") {
        message = "Bạn đang có gói đang hoạt động, vui lòng đợi gói này hết hạn";
      } else if (errorCode === "subscription_not_found") {
        message = "Không tìm thấy gói tập";
      }

      toast({
        variant: "destructive",
        title: "Lỗi",
        description: message,
      });
    },
  });
};

export const useQrCode = () =>
  useQuery({
    queryKey: ["/member/qr-generate"],
    queryFn: async () => normalizeQrResponse((await api.get("/member/qr-generate")).data),
    refetchInterval: 55000,
  });

export const useMemberCheckins = (page = 1, limit = 20) =>
  useQuery({
    queryKey: ["/member/checkins", page, limit],
    queryFn: async () => (await api.get(`/member/checkins?page=${page}&limit=${limit}`)).data,
  });

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data) => (await api.patch("/member/profile", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/member/profile"] });
      toast({ title: "Đã cập nhật hồ sơ" });
    },
  });
};

export const useChangePassword = () => {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data) => (await api.patch("/member/password", data)).data,
    onSuccess: () => toast({ title: "Đổi mật khẩu thành công" }),
    onError: (err) =>
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.response?.data?.message || "Đổi mật khẩu thất bại",
      }),
  });
};

export const useCreateOrder = () =>
  useMutation({
    mutationFn: async (data) => (await api.post("/member/orders", data)).data,
  });

// ─── Workout Plans ─────────────────────────────────────────────────────────────

/** GET /api/member/workout-plans — Danh sách kế hoạch tập */
export const useWorkoutPlans = () =>
  useQuery({
    queryKey: ["/member/workout-plans"],
    queryFn: async () => {
      const res = await api.get("/member/workout-plans");
      // Backend trả về { data: [...] } hoặc trực tiếp []
      const raw = res.data?.data ?? res.data;
      return normalizeWorkoutPlansResponse(raw);
    },
  });

/** GET /api/member/workout-plans/active — Kế hoạch đang kích hoạt */
export const useActiveWorkoutPlan = () =>
  useQuery({
    queryKey: ["/member/workout-plans/active"],
    queryFn: async () => {
      const res = await api.get("/member/workout-plans/active");
      // Backend trả về { data: {...} } hoặc trực tiếp {}
      const raw = res.data?.data ?? res.data;
      return normalizeWorkoutPlan(raw);
    },
  });

/** POST /api/member/workout-plans — Tạo kế hoạch mới */
export const useCreateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data) => (await api.post("/member/workout-plans", data)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/member/workout-plans"] });
      toast({ title: "Đã tạo kế hoạch tập" });
    },
    onError: (err) =>
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.response?.data?.message || "Không thể tạo kế hoạch",
      }),
  });
};

/** PATCH /api/member/workout-plans/:planId/activate — Kích hoạt kế hoạch */
export const useActivateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (planId) =>
      (await api.patch(`/member/workout-plans/${planId}/activate`)).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/member/workout-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/member/workout-plans/active"] });
      toast({ title: "Đã kích hoạt kế hoạch tập" });
    },
    onError: (err) =>
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.response?.data?.message || "Kích hoạt thất bại",
      }),
  });
};

/** POST /api/member/workout-plans/generate — Generate AI workout plan */
export const useGenerateWorkoutPlan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => (await api.post("/member/workout-plans/generate")).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/member/workout-plans"] });
      queryClient.invalidateQueries({ queryKey: ["/member/workout-plans/active"] });
      toast({ title: "Đã tạo AI Workout Plan" });
    },
    onError: (err) =>
      toast({
        variant: "destructive",
        title: "Lỗi",
        description: err?.response?.data?.message || "Không thể tạo AI Workout Plan",
      }),
  });
};
