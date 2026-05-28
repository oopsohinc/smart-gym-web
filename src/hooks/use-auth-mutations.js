import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export function useLoginMutation() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data) => {
      const loginId = String(data?.email ?? data?.username ?? data?.identifier ?? "").trim();
      const password = String(data?.password ?? "");

      const payload = {
        email: loginId,
        username: loginId,
        identifier: loginId,
        password,
      };

      const res = await api.post("/auth/login", payload);
      return res.data;
    },
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken || "", data.user);
      toast({ title: "Đăng nhập thành công", description: `Chào mừng trở lại, ${data.user.fullName}` });
      if (data.user.role === "admin") navigate("/admin/dashboard");
      else if (data.user.role === "staff") navigate("/staff/orders");
      else navigate("/member/dashboard");
    },
    onError: (err) => {
      const status = err?.response?.status;
      const rawMessage = err?.response?.data?.message || err?.response?.data?.error || err?.message;
      let friendlyMessage = rawMessage || "Đăng nhập thất bại";
      
      if (rawMessage) {
        const lower = String(rawMessage).toLowerCase();
        if (lower.includes("invalid") || lower.includes("credentials") || lower.includes("wrong") || lower.includes("password") || lower.includes("incorrect") || lower.includes("unauthorized") || lower.includes("401")) {
          friendlyMessage = "Tài khoản hoặc mật khẩu không chính xác";
        } else if (lower.includes("not found") || lower.includes("exist")) {
          friendlyMessage = "Tài khoản email này không tồn tại!";
        }
      }

      console.error("Login request failed", {
        status,
        data: err?.response?.data,
      });

      toast({
        variant: "destructive",
        title: "Lỗi đăng nhập",
        description: friendlyMessage,
      });
    },
  });
}

export function useRegisterMutation() {
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data) => {
      const res = await api.post("/auth/register", data);
      return res.data;
    },
    onSuccess: (data) => {
      login(data.accessToken, data.refreshToken || "", data.user);
      toast({ title: "Đăng ký thành công", description: "Tài khoản của bạn đã được tạo." });
      navigate("/member/dashboard");
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Lỗi đăng ký",
        description: err?.response?.data?.message || "Không thể tạo tài khoản",
      });
    },
  });
}

export function useForgotPasswordMutation() {
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ email }) => {
      const res = await api.post("/auth/forgot-password", { email });
      return res.data;
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Lỗi yêu cầu reset",
        description: err?.response?.data?.message || "Không thể yêu cầu đặt lại mật khẩu",
      });
    },
  });
}

export function useResetPasswordMutation() {
  const { toast } = useToast();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async ({ otp, newPassword }) => {
      const res = await api.post("/auth/reset-password", { otp, newPassword });
      return res.data;
    },
    onSuccess: () => {
      toast({ title: "Thành công", description: "Mật khẩu của bạn đã được đặt lại thành công." });
      navigate("/login");
    },
    onError: (err) => {
      toast({
        variant: "destructive",
        title: "Lỗi đặt lại mật khẩu",
        description: err?.response?.data?.message || "Không thể đặt lại mật khẩu",
      });
    },
  });
}
