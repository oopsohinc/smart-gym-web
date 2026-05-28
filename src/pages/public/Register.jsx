import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useRegisterMutation } from "@/hooks/use-auth-mutations";
import "@/styles/landing.css";

export default function Register() {
  const registerMutation = useRegisterMutation();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { fullName: "", email: "", phone: "", password: "", confirmPassword: "" },
  });

  const serverError = registerMutation.error?.response?.data?.message || registerMutation.error?.message;

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
            <img src="/svgymicon.svg" alt="SV Gym" className="w-14 h-14 object-contain" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2d3436]">
            SV <span className="text-[#ff4757]">GYM</span>
          </h1>
          <p className="text-[#4a5568] text-sm mt-1 font-mono uppercase tracking-widest">Tạo tài khoản hội viên</p>
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

          <form
            className="space-y-4"
            onSubmit={handleSubmit((data) => {
              const { confirmPassword, ...payload } = data;
              registerMutation.mutate(payload);
            })}
          >
            {/* Full name */}
            <div>
              <label className="block text-sm font-semibold text-[#2d3436] mb-2">Họ tên <span className="text-[#ff4757]">*</span></label>
              <input
                placeholder="Nguyễn Văn A"
                className={`w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none transition-all
                  shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]
                  focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]
                  placeholder:text-[#a0aec0]
                  ${errors.fullName ? "shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]" : ""}`}
                {...register("fullName", { required: "Họ tên là bắt buộc" })}
              />
              {errors.fullName && <p className="mt-1.5 text-xs text-[#ff4757]">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-[#2d3436] mb-2">Email <span className="text-[#ff4757]">*</span></label>
              <input
                type="email"
                placeholder="example@gmail.com"
                className="w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none transition-all shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757] placeholder:text-[#a0aec0]"
                {...register("email", { required: "Email là bắt buộc" })}
              />
              {errors.email && <p className="mt-1.5 text-xs text-[#ff4757]">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-[#2d3436] mb-2">Số điện thoại <span className="text-[#ff4757]">*</span></label>
              <input
                type="tel"
                placeholder="09xxxxxxxx"
                className={`w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none transition-all shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757] placeholder:text-[#a0aec0]
                  ${errors.phone ? "shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]" : ""}`}
                {...register("phone", { 
                  required: "Số điện thoại là bắt buộc",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Số điện thoại phải gồm 10 chữ số"
                  }
                })}
              />
              {errors.phone && <p className="mt-1.5 text-xs text-[#ff4757]">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-[#2d3436] mb-2">Mật khẩu <span className="text-[#ff4757]">*</span></label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full h-12 px-4 pr-12 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none transition-all shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757] placeholder:text-[#a0aec0]"
                  {...register("password", {
                    required: "Mật khẩu là bắt buộc",
                    minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                  })}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#ff4757] transition-colors">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="mt-1.5 text-xs text-[#ff4757]">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-[#2d3436] mb-2">Xác nhận mật khẩu <span className="text-[#ff4757]">*</span></label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full h-12 px-4 pr-12 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none transition-all shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757] placeholder:text-[#a0aec0]"
                  {...register("confirmPassword", {
                    required: "Vui lòng xác nhận mật khẩu",
                    validate: (val) => val === watch("password") || "Mật khẩu không khớp",
                  })}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#ff4757] transition-colors">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="mt-1.5 text-xs text-[#ff4757]">{errors.confirmPassword.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={registerMutation.isPending}
              className="w-full h-12 rounded-xl font-bold text-sm uppercase tracking-widest text-white bg-[#ff4757] transition-all
                shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.3)]
                hover:brightness-110 active:translate-y-[1px]
                disabled:opacity-60 disabled:pointer-events-none
                flex items-center justify-center gap-2 mt-2"
            >
              {registerMutation.isPending && <Loader2 size={16} className="animate-spin" />}
              Tạo tài khoản
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-[#babecc] text-center">
            <p className="text-sm text-[#4a5568]">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-[#ff4757] font-semibold hover:underline">
                Đăng nhập
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
