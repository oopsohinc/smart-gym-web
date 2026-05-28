import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useLoginMutation } from "@/hooks/use-auth-mutations";
import "@/styles/landing.css";

export default function Login() {
  const login = useLoginMutation();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { email: "", password: "" } });

  const rawError = login.error?.response?.data?.message || login.error?.response?.data?.error || login.error?.message;
  let serverError = null;
  if (rawError) {
    const lower = String(rawError).toLowerCase();
    if (lower.includes("invalid") || lower.includes("credentials") || lower.includes("wrong") || lower.includes("password") || lower.includes("incorrect") || lower.includes("unauthorized") || lower.includes("401")) {
      serverError = "Tài khoản hoặc mật khẩu không chính xác";
    } else if (lower.includes("not found") || lower.includes("exist")) {
      serverError = "Tài khoản email này không tồn tại trong hệ thống!";
    } else {
      serverError = rawError;
    }
  }

  return (
    <div className="min-h-dvh bg-[#e0e5ec] flex items-center justify-center px-4 py-10 noise-overlay">
      {/* Back to home */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-5 left-5 flex items-center gap-2 text-[#4a5568] hover:text-[#ff4757] text-sm font-semibold transition-colors"
      >
        <ArrowLeft size={16} />
        Trang chủ
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#e0e5ec] shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]">
            <img src="/svgymicon.svg" alt="SV Gym" className="w-14 h-14 object-contain mix-blend-multiply" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2d3436]">
            SV <span className="text-[#ff4757]">GYM</span>
          </h1>
          <p className="text-[#4a5568] text-sm mt-1 font-mono uppercase tracking-widest">Đăng nhập tài khoản</p>
        </div>

        {/* Form card */}
        <div className="bg-[#e0e5ec] rounded-2xl p-8 shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff]">
          {/* Server error */}
          {serverError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-[#ff4757]/10 border border-[#ff4757]/30 p-4 text-sm text-[#ff4757]">
              <span className="font-bold shrink-0">Lỗi:</span>
              <span>{serverError}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit((data) => login.mutate(data))}>
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#2d3436] mb-2">Email <span className="text-[#ff4757]">*</span></label>
              <input
                type="email"
                placeholder="example@gmail.com"
                className={`w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none transition-all
                  shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]
                  focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]
                  placeholder:text-[#a0aec0]
                  ${errors.email ? "shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]" : ""}`}
                {...register("email", { required: "Email là bắt buộc" })}
              />
              {errors.email && <p className="mt-1.5 text-xs text-[#ff4757]">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-[#2d3436]">Mật khẩu <span className="text-[#ff4757]">*</span></label>
                <Link to="/forgot-password" className="text-xs text-[#ff4757] font-semibold hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="••••••"
                  className={`w-full h-12 px-4 pr-12 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none transition-all
                    shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]
                    focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]
                    placeholder:text-[#a0aec0]`}
                  {...register("password", { required: "Mật khẩu là bắt buộc" })}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#ff4757] transition-colors"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-[#ff4757]">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full h-12 rounded-xl font-bold text-sm uppercase tracking-widest text-white bg-[#ff4757] transition-all
                shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.3)]
                hover:brightness-110 active:translate-y-[1px]
                disabled:opacity-60 disabled:pointer-events-none
                flex items-center justify-center gap-2"
            >
              {login.isPending && <Loader2 size={16} className="animate-spin" />}
              Đăng nhập
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#babecc] text-center">
            <p className="text-sm text-[#4a5568]">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-[#ff4757] font-semibold hover:underline">
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
