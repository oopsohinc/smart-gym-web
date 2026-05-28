import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { useForgotPasswordMutation, useResetPasswordMutation } from "@/hooks/use-auth-mutations";
import "@/styles/landing.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  
  // Trạng thái màn hình: 'request' (Yêu cầu OTP) hoặc 'reset' (Xác thực OTP & Đổi mật khẩu mới)
  const [step, setStep] = useState("request");
  const [registeredEmail, setRegisteredEmail] = useState("");

  const forgotMutation = useForgotPasswordMutation();
  const resetMutation = useResetPasswordMutation();

  // Form 1: Yêu cầu gửi mã OTP
  const {
    register: registerEmail,
    handleSubmit: handleEmailSubmit,
    formState: { errors: emailErrors },
  } = useForm({ defaultValues: { email: "" } });

  // Form 2: Nhập OTP và mật khẩu mới
  const {
    register: registerReset,
    handleSubmit: handleResetSubmit,
    watch,
    formState: { errors: resetErrors },
  } = useForm({ defaultValues: { otp: "", newPassword: "", confirmNewPassword: "" } });

  const newPasswordVal = watch("newPassword");

  const onEmailSubmit = (data) => {
    forgotMutation.mutate(
      { email: data.email },
      {
        onSuccess: () => {
          setRegisteredEmail(data.email);
          setStep("reset");
        },
      }
    );
  };

  const onResetSubmit = (data) => {
    resetMutation.mutate({
      otp: data.otp,
      newPassword: data.newPassword,
    });
  };

  const serverError = forgotMutation.error?.response?.data?.message || resetMutation.error?.response?.data?.message;

  return (
    <div className="min-h-dvh bg-[#e0e5ec] flex items-center justify-center px-4 py-10 noise-overlay">
      {/* Quay lại login */}
      <button
        onClick={() => navigate("/login")}
        className="fixed top-5 left-5 flex items-center gap-2 text-[#4a5568] hover:text-[#ff4757] text-sm font-semibold transition-colors"
      >
        <ArrowLeft size={16} />
        Đăng nhập
      </button>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center bg-[#e0e5ec] shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]">
            <KeyRound size={32} className="text-[#ff4757]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#2d3436]">
            SV <span className="text-[#ff4757]">GYM</span>
          </h1>
          <p className="text-[#4a5568] text-sm mt-1 font-mono uppercase tracking-widest">
            {step === "request" ? "Yêu cầu OTP" : "Xác thực & Reset"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-[#e0e5ec] rounded-2xl p-8 shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff]">
          {/* Lỗi Server */}
          {serverError && (
            <div className="mb-5 flex items-start gap-3 rounded-xl bg-[#ff4757]/10 border border-[#ff4757]/30 p-4 text-sm text-[#ff4757]">
              <span className="font-bold shrink-0">Lỗi:</span>
              <span>{serverError}</span>
            </div>
          )}

          {step === "request" ? (
            /* ================= BƯỚC 1: YÊU CẦU OTP ================= */
            <form className="space-y-5" onSubmit={handleEmailSubmit(onEmailSubmit)}>
              <p className="text-sm text-[#4a5568] leading-relaxed mb-4">
                Nhập địa chỉ email của bạn, chúng tôi sẽ khởi tạo một mã xác nhận OTP gồm 6 chữ số (hiệu lực trong 10 phút) để giúp bạn đặt lại mật khẩu mới.
              </p>

              <div>
                <label className="block text-sm font-semibold text-[#2d3436] mb-2">Email tài khoản <span className="text-[#ff4757]">*</span></label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="example@gmail.com"
                  className={`w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none transition-all
                    shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]
                    focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]
                    placeholder:text-[#a0aec0]
                    ${emailErrors.email ? "shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]" : ""}`}
                  {...registerEmail("email", { required: "Vui lòng nhập Email" })}
                />
                {emailErrors.email && <p className="mt-1.5 text-xs text-[#ff4757]">{emailErrors.email.message}</p>}
              </div>

              <button
                type="submit"
                disabled={forgotMutation.isPending}
                className="w-full h-12 rounded-xl font-bold text-sm uppercase tracking-widest text-white bg-[#ff4757] transition-all
                  shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.3)]
                  hover:brightness-110 active:translate-y-[1px]
                  disabled:opacity-60 disabled:pointer-events-none
                  flex items-center justify-center gap-2"
              >
                {forgotMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                Gửi mã OTP
              </button>
            </form>
          ) : (
            /* ================= BƯỚC 2: ĐỔI MẬT KHẨU MỚI ================= */
            <form className="space-y-5" onSubmit={handleResetSubmit(onResetSubmit)}>
              <p className="text-sm text-[#4a5568] leading-relaxed mb-4">
                Mã xác thực OTP đã được gửi thành công đến địa chỉ <strong className="text-[#2d3436]">{registeredEmail}</strong>.
              </p>

              {/* OTP Input */}
              <div>
                <label className="block text-sm font-semibold text-[#2d3436] mb-2">Nhập mã OTP (6 chữ số) <span className="text-[#ff4757]">*</span></label>
                <input
                  type="text"
                  maxLength={6}
                  autoComplete="one-time-code"
                  placeholder="••••••"
                  className={`w-full h-14 rounded-xl text-center font-mono text-2xl font-bold tracking-[8px] text-[#1a73e8] bg-[#e0e5ec] outline-none transition-all
                    shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]
                    focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]
                    placeholder:text-[#a0aec0]
                    ${resetErrors.otp ? "shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]" : ""}`}
                  {...registerReset("otp", { 
                    required: "Vui lòng nhập mã OTP",
                    pattern: {
                      value: /^[0-9]{6}$/,
                      message: "Mã OTP phải gồm 6 chữ số"
                    }
                  })}
                />
                {resetErrors.otp && <p className="mt-1.5 text-xs text-[#ff4757] text-center">{resetErrors.otp.message}</p>}
              </div>

              {/* New Password Input */}
              <div>
                <label className="block text-sm font-semibold text-[#2d3436] mb-2">Mật khẩu mới <span className="text-[#ff4757]">*</span></label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••"
                    className={`w-full h-12 px-4 pr-12 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none transition-all
                      shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]
                      focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]
                      placeholder:text-[#a0aec0]`}
                    {...registerReset("newPassword", {
                      required: "Mật khẩu mới là bắt buộc",
                      minLength: { value: 6, message: "Mật khẩu phải từ 6 ký tự" }
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#ff4757] transition-colors"
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {resetErrors.newPassword && <p className="mt-1.5 text-xs text-[#ff4757]">{resetErrors.newPassword.message}</p>}
              </div>

              {/* Confirm New Password Input */}
              <div>
                <label className="block text-sm font-semibold text-[#2d3436] mb-2">Xác nhận mật khẩu mới <span className="text-[#ff4757]">*</span></label>
                <div className="relative">
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="••••••"
                    className={`w-full h-12 px-4 pr-12 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none transition-all
                      shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]
                      focus:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff,0_0_0_2px_#ff4757]
                      placeholder:text-[#a0aec0]`}
                    {...registerReset("confirmNewPassword", {
                      required: "Xác nhận mật khẩu là bắt buộc",
                      validate: (val) => val === newPasswordVal || "Mật khẩu xác nhận không khớp"
                    })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#ff4757] transition-colors"
                  >
                    {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {resetErrors.confirmNewPassword && <p className="mt-1.5 text-xs text-[#ff4757]">{resetErrors.confirmNewPassword.message}</p>}
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep("request")}
                  className="flex-1 h-12 rounded-xl font-bold text-sm text-[#4a5568] border border-[#babecc] hover:bg-[#d1d9e6]/40 transition-colors"
                  style={{ boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }}
                >
                  Quay lại
                </button>
                <button
                  type="submit"
                  disabled={resetMutation.isPending}
                  className="flex-[2] h-12 rounded-xl font-bold text-sm uppercase tracking-widest text-white bg-[#ff4757] transition-all
                    shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.3)]
                    hover:brightness-110 active:translate-y-[1px]
                    disabled:opacity-60 disabled:pointer-events-none
                    flex items-center justify-center gap-2"
                >
                  {resetMutation.isPending && <Loader2 size={16} className="animate-spin" />}
                  Đổi mật khẩu
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 pt-5 border-t border-[#babecc] text-center">
            <p className="text-sm text-[#4a5568]">
              Nhớ mật khẩu?{" "}
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
