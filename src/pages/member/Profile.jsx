import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { Eye, EyeOff, Activity, Dumbbell, Ruler, Scale, Target, User, ShieldAlert, KeyRound, CheckCircle2 } from "lucide-react";
import { Button, Card, PageHeader } from "@/components/ui";
import { useProfile, useUpdateProfile, useChangePassword } from "@/hooks/use-queries";

const GOAL_OPTIONS = [
  { label: "Giảm cân (Weight loss)", value: "weight_loss" },
  { label: "Tăng cơ (Muscle gain)", value: "muscle_gain" },
  { label: "Giữ dáng (Maintenance)", value: "maintenance" },
];

const LEVEL_OPTIONS = [
  { label: "Mới bắt đầu (Beginner)", value: "beginner" },
  { label: "Trung bình (Intermediate)", value: "intermediate" },
  { label: "Nâng cao (Advanced)", value: "advanced" },
];

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculateBmi(heightCm, weightKg) {
  const height = toNumber(heightCm);
  const weight = toNumber(weightKg);

  if (!height || !weight || height <= 0 || weight <= 0) return null;

  const heightMeter = height / 100;
  return Number((weight / (heightMeter * heightMeter)).toFixed(1));
}

function getBmiCategory(bmi) {
  if (!bmi) return { label: "Chưa xác định", color: "text-[#4a5568] bg-[#d1d9e6]/20 border-[#babecc]/20" };
  if (bmi < 18.5) return { label: "Cân nặng thấp (Gầy)", color: "text-blue-600 bg-blue-500/10 border-blue-500/20" };
  if (bmi < 24.9) return { label: "Thể trạng bình thường", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
  if (bmi < 29.9) return { label: "Tiền béo phì", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
  return { label: "Béo phì", color: "text-rose-600 bg-rose-500/10 border-rose-500/20" };
}

export default function Profile() {
  const { data: profile, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // Password visibility states
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  // Form Profile State
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    dateOfBirth: "",
    fitnessGoal: "",
    fitnessLevel: "",
    height: "",
    weight: "",
  });

  // Password Form Hook
  const {
    register: registerPw,
    handleSubmit: handlePwSubmit,
    formState: { errors: pwErrors },
    reset: resetPwForm,
    watch: watchPw,
  } = useForm({ defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  const newPasswordVal = watchPw("newPassword");

  useEffect(() => {
    if (profile) {
      const healthProfile = profile.healthProfile || {};
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        dateOfBirth: profile.dateOfBirth ? format(new Date(profile.dateOfBirth), "yyyy-MM-dd") : "",
        fitnessGoal: profile.fitnessGoal || "",
        fitnessLevel: profile.fitnessLevel || "",
        height: healthProfile.height ?? profile.height ?? "",
        weight: healthProfile.weight ?? profile.weight ?? "",
      });
    }
  }, [profile]);

  const bmi = useMemo(() => calculateBmi(formData.height, formData.weight), [formData.height, formData.weight]);
  const bmiCat = getBmiCategory(bmi);

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff4757] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#4a5568] font-medium">Đang tải hồ sơ cá nhân...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center text-rose-700 max-w-xl mx-auto mt-10 shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]">
        <ShieldAlert className="h-10 w-10 text-[#ff4757] mx-auto mb-3" />
        <h3 className="font-bold text-lg">Lỗi tải hồ sơ</h3>
        <p className="text-sm mt-1">Không thể kết nối đến máy chủ. Vui lòng thử lại sau.</p>
      </div>
    );
  }

  // Submit Profile Update
  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  // Submit Password Change
  const onPasswordSubmit = (data) => {
    changePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      {
        onSuccess: () => {
          resetPwForm();
          setShowCurrentPw(false);
          setShowNewPw(false);
          setShowConfirmPw(false);
        },
      }
    );
  };

  return (
    <div className="max-w-5xl space-y-6 pb-10">
      <PageHeader
        title="Hồ sơ cá nhân"
        description="Quản lý thông tin tài khoản, cập nhật chỉ số thể hình và thay đổi mật khẩu bảo mật"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT COLUMN: Profile Info & Health Metrics (Takes 2 columns) */}
        <div className="lg:col-span-2 rounded-3xl p-6 sm:p-8 bg-[#e0e5ec] shadow-[9px_9px_18px_#babecc,-9px_-9px_18px_#ffffff] border border-white/40">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#e0e5ec] flex items-center justify-center shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]">
              <User className="h-4.5 w-4.5 text-[#ff4757]" />
            </div>
            <h3 className="text-lg font-bold text-[#2d3436]">Thông tin cá nhân & Chỉ số cơ thể</h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-6">
            {/* Grid 1: Basic personal details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1">Họ và tên <span className="text-[#ff4757]">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1">Số điện thoại</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757] transition-all"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1">Địa chỉ</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1">Ngày sinh</label>
                <input
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
                  className="w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757] transition-all cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1">Email (Tài khoản đăng nhập)</label>
                <input
                  type="email"
                  disabled
                  value={profile?.email || ""}
                  className="w-full h-12 px-4 rounded-xl text-sm text-[#718096] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] opacity-75 cursor-not-allowed"
                />
              </div>
            </div>

            {/* Grid 2: Health metrics section */}
            <div className="border-t border-[#babecc]/60 pt-6">
              <span className="text-xs uppercase font-bold tracking-widest text-[#4a5568] flex items-center gap-1.5 mb-4 px-1">
                <Dumbbell className="h-4 w-4 text-[#ff4757]" />
                Chỉ số thể hình & mục tiêu
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1 flex items-center gap-1">
                    <Ruler className="h-3.5 w-3.5 text-[#ff4757]" />
                    Chiều cao (cm)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 170"
                    value={formData.height}
                    onChange={(e) => setFormData((prev) => ({ ...prev, height: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1 flex items-center gap-1">
                    <Scale className="h-3.5 w-3.5 text-[#ff4757]" />
                    Cân nặng (kg)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="VD: 65"
                    value={formData.weight}
                    onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1 flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-[#ff4757]" />
                    Mục tiêu tập luyện
                  </label>
                  <select
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fitnessGoal: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757] transition-all cursor-pointer"
                  >
                    <option value="">-- Chưa thiết lập mục tiêu --</option>
                    {GOAL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1 flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-[#ff4757]" />
                    Trình độ hiện tại
                  </label>
                  <select
                    value={formData.fitnessLevel}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fitnessLevel: e.target.value }))}
                    className="w-full h-12 px-4 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757] transition-all cursor-pointer"
                  >
                    <option value="">-- Chưa thiết lập trình độ --</option>
                    {LEVEL_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Dynamic BMI Info Block */}
            <div className="rounded-2xl p-4 sm:p-5 bg-[#e0e5ec] shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] border border-white/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Activity className="h-4.5 w-4.5 text-[#ff4757]" />
                  <span className="text-sm font-semibold text-[#4a5568]">Chỉ số BMI hiện tại:</span>
                  <span className="text-base font-extrabold text-[#2d3436]">{bmi || "Chưa xác định"}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border text-center ${bmiCat.color}`}>
                  {bmiCat.label}
                </span>
              </div>
              <p className="text-xs text-[#4a5568] mt-2 font-medium leading-relaxed">
                {bmi 
                  ? `Chỉ số BMI của bạn được tự động cập nhật là ${bmi}. Hãy giữ thói quen tập luyện đều đặn và chế độ dinh dưỡng hợp lý để giữ thể trạng cân đối.`
                  : "Chỉ số BMI sẽ tự động tính toán ngay khi bạn điền đầy đủ cả hai trường chiều cao và cân nặng ở bên trên."}
              </p>
            </div>

            {/* Save profile changes */}
            <div className="pt-2">
              <Button
                type="submit"
                className="w-full sm:w-auto px-8 h-12 bg-[#ff4757] hover:bg-[#e03d4f] text-white font-bold text-sm uppercase tracking-wide rounded-2xl shadow-[3px_3px_6px_rgba(255,71,87,0.3)] transition-all active:translate-y-[1px]"
                isLoading={updateProfile.isPending}
                disabled={updateProfile.isPending}
              >
                Lưu hồ sơ sức khỏe
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN: Password Protection & Change Form (Takes 1 column) */}
        <div className="rounded-3xl p-6 bg-[#e0e5ec] shadow-[9px_9px_18px_#babecc,-9px_-9px_18px_#ffffff] border border-white/40">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-[#e0e5ec] flex items-center justify-center shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]">
              <KeyRound className="h-4.5 w-4.5 text-[#ff4757]" />
            </div>
            <h3 className="text-lg font-bold text-[#2d3436]">Bảo mật & Mật khẩu</h3>
          </div>

          <form onSubmit={handlePwSubmit(onPasswordSubmit)} className="space-y-5">
            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1">Mật khẩu hiện tại <span className="text-[#ff4757]">*</span></label>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  placeholder="••••••"
                  className={`w-full h-12 px-4 pr-12 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757] transition-all
                    ${pwErrors.currentPassword ? "shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757]" : ""}`}
                  {...registerPw("currentPassword", { required: "Vui lòng nhập mật khẩu hiện tại" })}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#ff4757] transition-colors"
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErrors.currentPassword && <p className="mt-1 text-xs text-[#ff4757] px-1">{pwErrors.currentPassword.message}</p>}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1">Mật khẩu mới <span className="text-[#ff4757]">*</span></label>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  placeholder="••••••"
                  className={`w-full h-12 px-4 pr-12 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757] transition-all
                    ${pwErrors.newPassword ? "shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757]" : ""}`}
                  {...registerPw("newPassword", { 
                    required: "Vui lòng nhập mật khẩu mới",
                    minLength: { value: 6, message: "Mật khẩu mới tối thiểu 6 ký tự" }
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#4a5568] hover:text-[#ff4757] transition-colors"
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {pwErrors.newPassword && <p className="mt-1 text-xs text-[#ff4757] px-1">{pwErrors.newPassword.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-[#4a5568] mb-2 px-1">Xác nhận mật khẩu mới <span className="text-[#ff4757]">*</span></label>
              <div className="relative">
                <input
                  type={showConfirmPw ? "text" : "password"}
                  placeholder="••••••"
                  className={`w-full h-12 px-4 pr-12 rounded-xl text-sm text-[#2d3436] bg-[#e0e5ec] outline-none shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff] focus:shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757] transition-all
                    ${pwErrors.confirmPassword ? "shadow-[inset_3px_3px_6px_#babecc,inset_-3px_-3px_6px_#ffffff,0_0_0_2px_#ff4757]" : ""}`}
                  {...registerPw("confirmPassword", { 
                    required: "Vui lòng xác nhận mật khẩu",
                    validate: (val) => val === newPasswordVal || "Xác nhận mật khẩu mới không khớp"
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
              {pwErrors.confirmPassword && <p className="mt-1 text-xs text-[#ff4757] px-1">{pwErrors.confirmPassword.message}</p>}
            </div>

            {/* Submit change password */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={changePassword.isPending}
                className="w-full h-12 bg-[#ff4757] hover:bg-[#e03d4f] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-[4px_4px_8px_rgba(166,50,60,0.3),-4px_-4px_8px_#ffffff] transition-all active:translate-y-[1px] disabled:opacity-60 flex items-center justify-center gap-2"
              >
                Cập nhật mật khẩu mới
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
