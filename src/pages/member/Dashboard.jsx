import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Ruler, Scale, Activity, Dumbbell, QrCode, Calendar, Clock, Target, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { useProfile, useSubscription } from "@/hooks/use-queries";

function calculateBmi(heightCm, weightKg) {
  if (!heightCm || !weightKg || heightCm <= 0 || weightKg <= 0) return null;
  const heightMeter = heightCm / 100;
  return Number((weightKg / (heightMeter * heightMeter)).toFixed(1));
}

function getBmiCategory(bmi) {
  if (!bmi) return { label: "Chưa xác định", color: "text-[#4a5568] bg-[#d1d9e6]/20 border-[#babecc]/20" };
  if (bmi < 18.5) return { label: "Cân nặng thấp (Gầy)", color: "text-blue-600 bg-blue-500/10 border-blue-500/20" };
  if (bmi < 24.9) return { label: "Thể trạng bình thường", color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/20" };
  if (bmi < 29.9) return { label: "Tiền béo phì", color: "text-amber-600 bg-amber-500/10 border-amber-500/20" };
  return { label: "Béo phì", color: "text-rose-600 bg-rose-500/10 border-rose-500/20" };
}

function getGoalLabel(goal) {
  if (goal === "weight_loss") return "Giảm cân (Weight loss)";
  if (goal === "muscle_gain") return "Tăng cơ (Muscle gain)";
  if (goal === "maintenance") return "Giữ dáng (Maintenance)";
  return goal || "Chưa thiết lập";
}

function getLevelLabel(level) {
  if (level === "beginner") return "Mới bắt đầu (Beginner)";
  if (level === "intermediate") return "Trung bình (Intermediate)";
  if (level === "advanced") return "Nâng cao (Advanced)";
  return level || "Chưa thiết lập";
}

export default function MemberDashboard() {
  const { data: profile, isLoading: loadingProfile } = useProfile();
  const { data: subscription, isLoading: loadingSubscription } = useSubscription();

  const loading = loadingProfile || loadingSubscription;

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff4757] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#4a5568] font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const isActive = Boolean(subscription?.hasActiveSubscription ?? subscription?.isActive);

  // Lấy chiều cao, cân nặng từ healthProfile hoặc trực tiếp từ profile
  const healthProfile = profile?.healthProfile || {};
  const height = healthProfile.height ?? profile?.height ?? 0;
  const weight = healthProfile.weight ?? profile?.weight ?? 0;
  const bmi = calculateBmi(height, weight);
  const bmiCat = getBmiCategory(bmi);

  return (
    <div className="max-w-5xl space-y-6 pb-10">
      <PageHeader 
        title={`Chào mừng trở lại, ${profile?.name || "Hội viên"}! 👋`}
        description="Tổng quan chỉ số sức khỏe, trạng thái gói tập và lối tắt check-in phòng tập của bạn"
      />

      {/* Main Grid Layout: Left Column (Metrics & Subscription) | Right Column (Quick Check-in) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* LEFT COLUMN: Metrics & Subscription */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* BLOCK 1: CHỈ SỐ CỦA HỘI VIÊN */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[#e0e5ec] shadow-[9px_9px_18px_#babecc,-9px_-9px_18px_#ffffff] border border-white/40">
            <div className="flex items-center gap-2.5 mb-6">
              <div className="w-9 h-9 rounded-xl bg-[#e0e5ec] flex items-center justify-center shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]">
                <Activity className="h-4.5 w-4.5 text-[#ff4757]" />
              </div>
              <h3 className="text-lg font-bold text-[#2d3436]">Chỉ số sức khỏe của bạn</h3>
            </div>

            {/* Metrics cards grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Chiều cao */}
              <div className="rounded-2xl p-4 bg-[#e0e5ec] shadow-[inset_2px_2px_5px_#babecc,inset_-2px_-2px_5px_#ffffff] flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] flex items-center justify-center shadow-[2px_2px_4px_#babecc,-2px_-2px_4px_#ffffff]">
                  <Ruler className="h-5 w-5 text-[#ff4757]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#4a5568]">Chiều cao</p>
                  <p className="text-base font-extrabold text-[#2d3436] mt-0.5">{height ? `${height} cm` : "Chưa nhập"}</p>
                </div>
              </div>

              {/* Cân nặng */}
              <div className="rounded-2xl p-4 bg-[#e0e5ec] shadow-[inset_2px_2px_5px_#babecc,inset_-2px_-2px_5px_#ffffff] flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] flex items-center justify-center shadow-[2px_2px_4px_#babecc,-2px_-2px_4px_#ffffff]">
                  <Scale className="h-5 w-5 text-[#ff4757]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#4a5568]">Cân nặng</p>
                  <p className="text-base font-extrabold text-[#2d3436] mt-0.5">{weight ? `${weight} kg` : "Chưa nhập"}</p>
                </div>
              </div>
            </div>

            {/* BMI Display */}
            <div className="mt-4 rounded-2xl p-4 sm:p-5 bg-[#e0e5ec] shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] border border-white/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold text-[#4a5568]">Chỉ số BMI:</span>
                  <span className="text-lg font-extrabold text-[#2d3436]">{bmi || "Chưa tính toán"}</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border text-center ${bmiCat.color}`}>
                  {bmiCat.label}
                </span>
              </div>
              <p className="text-xs text-[#4a5568] mt-2 font-medium leading-relaxed">
                {bmi 
                  ? "Chỉ số BMI được tính tự động từ chiều cao và cân nặng để giúp bạn theo dõi thể trạng cơ thể hiện tại."
                  : "Vui lòng cập nhật chiều cao và cân nặng trong hồ sơ để hệ thống tự động tính toán chỉ số BMI."}
              </p>
            </div>

            {/* Goal and Level grid */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl p-4 bg-[#e0e5ec] shadow-[inset_2px_2px_5px_#babecc,inset_-2px_-2px_5px_#ffffff] flex items-start gap-3">
                <Target className="h-4.5 w-4.5 text-[#ff4757] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#4a5568]">Mục tiêu tập luyện</p>
                  <p className="text-sm font-bold text-[#2d3436] mt-0.5">{getGoalLabel(profile?.fitnessGoal)}</p>
                </div>
              </div>

              <div className="rounded-2xl p-4 bg-[#e0e5ec] shadow-[inset_2px_2px_5px_#babecc,inset_-2px_-2px_5px_#ffffff] flex items-start gap-3">
                <Dumbbell className="h-4.5 w-4.5 text-[#ff4757] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-[#4a5568]">Trình độ hiện tại</p>
                  <p className="text-sm font-bold text-[#2d3436] mt-0.5">{getLevelLabel(profile?.fitnessLevel)}</p>
                </div>
              </div>
            </div>

            {/* Profile update navigation */}
            <div className="mt-5 text-right">
              <Link 
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#ff4757] hover:underline" 
                to="/member/profile"
              >
                Cập nhật thông tin và chỉ số cơ thể
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* BLOCK 2: THÔNG TIN GÓI TẬP */}
          <div className="rounded-3xl p-6 sm:p-8 bg-[#e0e5ec] shadow-[9px_9px_18px_#babecc,-9px_-9px_18px_#ffffff] border border-white/40">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#e0e5ec] flex items-center justify-center shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]">
                  <Dumbbell className="h-4.5 w-4.5 text-[#ff4757]" />
                </div>
                <h3 className="text-lg font-bold text-[#2d3436]">Thông tin gói tập hiện tại</h3>
              </div>
              <span className={`px-3 py-1 rounded-full text-[10px] font-bold border shadow-[inset_1px_1px_2px_rgba(255,255,255,0.6)] ${isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}`}>
                {isActive ? "ĐANG HOẠT ĐỘNG" : "CHƯA KÍCH HOẠT / HẾT HẠN"}
              </span>
            </div>

            <div className="bg-[#e0e5ec] p-5 rounded-2xl shadow-[inset_2px_2px_5px_#babecc,inset_-2px_-2px_5px_#ffffff] border border-[#babecc]/30 space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-[#babecc]/40 pb-3">
                <span className="text-[#4a5568] font-medium">Tên gói tập:</span>
                <span className="font-extrabold text-[#2d3436] text-base">{subscription?.packageName || "Chưa có gói"}</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a5568] flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#ff4757]" />
                    Ngày bắt đầu
                  </p>
                  <p className="font-extrabold text-sm text-[#2d3436] mt-1">
                    {subscription?.startDate ? format(new Date(subscription.startDate), "dd/MM/yyyy") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a5568] flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-[#ff4757]" />
                    Ngày hết hạn
                  </p>
                  <p className="font-extrabold text-sm text-[#2d3436] mt-1">
                    {subscription?.endDate ? format(new Date(subscription.endDate), "dd/MM/yyyy") : "-"}
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center text-sm border-t border-[#babecc]/40 pt-3">
                <span className="text-[#4a5568] font-medium">Số ngày còn lại:</span>
                <span className="font-extrabold text-[#ff4757] text-lg">{subscription?.daysRemaining || 0} ngày</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link to="/member/subscription" className="flex-1">
                <button className="w-full py-3 rounded-2xl text-xs font-bold text-[#4a5568] border border-[#babecc] hover:bg-[#d1d9e6]/40 transition-colors shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]">
                  Xem lịch sử đăng ký
                </button>
              </Link>
              <Link to="/member/order" className="flex-[2]">
                <button className="w-full py-3 bg-[#ff4757] hover:bg-[#e03d4f] text-white font-bold text-xs uppercase tracking-wider rounded-2xl shadow-[4px_4px_8px_rgba(166,50,60,0.3),-4px_-4px_8px_#ffffff] transition-all active:translate-y-[1px]">
                  Gia hạn / Mua gói tập mới
                </button>
              </Link>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: QUICK CHECK-IN */}
        <div className="rounded-3xl p-6 bg-[#e0e5ec] shadow-[9px_9px_18px_#babecc,-9px_-9px_18px_#ffffff] border border-white/40 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-2xl bg-[#e0e5ec] flex items-center justify-center shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff] mb-4">
            <QrCode className="h-6 w-6 text-[#ff4757]" />
          </div>
          
          <h4 className="font-extrabold text-[#2d3436] text-lg">Check-in Nhanh</h4>
          <p className="text-xs text-[#4a5568] mt-2 leading-relaxed max-w-[220px]">
            Quét mã QR tại lễ tân để điểm danh vào phòng tập nhanh nhất.
          </p>
          
          {/* Simulated QR Code outline */}
          <div className="w-32 h-32 rounded-2xl bg-[#e0e5ec] shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] border border-[#babecc]/40 flex items-center justify-center mt-6 p-3 relative group transition-transform duration-300 hover:scale-[1.03]">
            <QrCode className="h-20 w-20 text-[#2d3436] opacity-80" />
            <div className="absolute inset-0 bg-[#e0e5ec]/20 rounded-2xl backdrop-blur-[0.5px] opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#4a5568]">
            <Clock className="h-4 w-4 text-[#ff4757]" />
            <span>Mở cửa: 05:00 - 22:00</span>
          </div>

          <Link to="/member/qr" className="mt-6 w-full">
            <button className="w-full py-3 rounded-2xl text-xs font-bold text-[#ff4757] border border-[#ff4757]/30 hover:bg-[#ff4757]/10 transition-colors shadow-[2px_2px_4px_#babecc,-2px_-2px_4px_#ffffff]">
              Lấy Mã QR Ra Vào Phòng Tập
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
