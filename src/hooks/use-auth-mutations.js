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
      toast({ title: "Đăng nhập thành công", description: `Chào mừng trở lại, ${data.user.name}` });
      if (data.user.role === "admin") navigate("/admin/dashboard");
      else if (data.user.role === "staff") navigate("/staff/orders");
      else navigate("/member/dashboard");
    },
    onError: (err) => {
      const status = err?.response?.status;
      const serverMessage = err?.response?.data?.message || err?.response?.data?.error;
      console.error("Login request failed", {
        status,
        data: err?.response?.data,
      });

      toast({
        variant: "destructive",
        title: "Lỗi đăng nhập",
        description: serverMessage || `Đăng nhập thất bại${status ? ` (HTTP ${status})` : ""}`,
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
