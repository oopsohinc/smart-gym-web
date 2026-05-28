import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Calendar, Clock, CreditCard, Dumbbell, ShieldCheck, Zap, AlertTriangle } from "lucide-react";
import { Badge, Button, Card, PageHeader } from "@/components/ui";
import { useSubscription, useActivateSubscription } from "@/hooks/use-queries";

function getStatusBadgeClass(status) {
  const normalizedStatus = String(status || "").toLowerCase();
  if (normalizedStatus === "active") {
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  }
  if (normalizedStatus === "pending") {
    return "bg-amber-100 text-amber-700 border-amber-200";
  }
  return "bg-rose-100 text-rose-700 border-rose-200";
}

function getStatusLabel(status) {
  const normalizedStatus = String(status || "").toLowerCase();
  if (normalizedStatus === "active") return "Đang hoạt động";
  if (normalizedStatus === "pending") return "Chờ kích hoạt";
  if (normalizedStatus === "expired") return "Đã hết hạn";
  if (normalizedStatus === "inactive") return "Không hoạt động";
  return status || "Không xác định";
}

export default function Subscription() {
  const { data: sub, isLoading, isError } = useSubscription();
  const activate = useActivateSubscription();
  const isActive = Boolean(sub?.hasActiveSubscription ?? sub?.isActive);
  const allSubscriptions = (sub?.subscriptions || [])
    .slice()
    .sort((a, b) => new Date(b?.startDate || 0).getTime() - new Date(a?.startDate || 0).getTime());

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#ff4757] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-[#4a5568] font-medium">Đang tải trạng thái gói tập...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl bg-rose-50 border border-rose-200 p-6 text-center text-rose-700 max-w-xl mx-auto mt-10 shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]">
        <AlertTriangle className="h-10 w-10 text-[#ff4757] mx-auto mb-3" />
        <h3 className="font-bold text-lg">Không thể tải thông tin</h3>
        <p className="text-sm mt-1">Vui lòng kiểm tra lại kết nối mạng hoặc liên hệ hỗ trợ.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-10">
      <PageHeader 
        title="Gói tập của tôi" 
        description="Theo dõi chi tiết trạng thái đăng ký hội viên của bạn tại SV Gym"
      />

      {/* Hero section: Active package card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
        {/* Main Status & Info Card */}
        <div className="md:col-span-2 rounded-3xl p-6 sm:p-8 bg-[#e0e5ec] shadow-[9px_9px_18px_#babecc,-9px_-9px_18px_#ffffff] border border-white/40 flex flex-col justify-between relative overflow-hidden">
          {/* Decorative subtle gradient bubble */}
          <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#ff4757]/5 blur-2xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs uppercase font-bold tracking-widest text-[#4a5568] flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                Gói tập hiện tại
              </span>
              <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-bold border shadow-[inset_1px_1px_2px_rgba(255,255,255,0.6)] ${isActive ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 animate-pulse" : "bg-rose-500/10 text-rose-600 border-rose-500/20"}`}>
                {isActive ? "ĐANG HOẠT ĐỘNG" : "HẾT HẠN / INACTIVE"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#2d3436] tracking-tight">
              {sub?.packageName || "Chưa đăng ký gói tập"}
            </h2>

            {/* Dates Grid */}
            <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 border-t border-[#babecc]/60 pt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] flex items-center justify-center shrink-0 shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]">
                  <Calendar className="h-4.5 w-4.5 text-[#ff4757]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#4a5568]">Ngày kích hoạt</p>
                  <p className="text-sm font-bold text-[#2d3436] mt-0.5">
                    {sub?.startDate ? format(new Date(sub.startDate), "dd/MM/yyyy") : "-"}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#e0e5ec] flex items-center justify-center shrink-0 shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]">
                  <Calendar className="h-4.5 w-4.5 text-[#ff4757]" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#4a5568]">Ngày hết hạn</p>
                  <p className="text-sm font-bold text-[#2d3436] mt-0.5">
                    {sub?.endDate ? format(new Date(sub.endDate), "dd/MM/yyyy") : "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <Link to="/member/order" className="inline-block w-full">
              <Button className="w-full h-12 bg-[#ff4757] hover:bg-[#e03d4f] text-white font-bold text-sm uppercase tracking-wider rounded-2xl shadow-[4px_4px_8px_rgba(166,50,60,0.3),-4px_-4px_8px_#ffffff] transition-all active:translate-y-[1px] flex items-center justify-center gap-2">
                <Zap className="h-4 w-4 fill-current" />
                Mua / Gia hạn gói tập ngay
              </Button>
            </Link>
          </div>
        </div>

        {/* Counter Card */}
        <div className="rounded-3xl p-6 bg-[#e0e5ec] shadow-[9px_9px_18px_#babecc,-9px_-9px_18px_#ffffff] border border-white/40 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase font-bold tracking-widest text-[#4a5568] mb-4">Thời gian còn lại</p>
          
          {/* Circular Neumorphic display */}
          <div className="w-36 h-36 rounded-full bg-[#e0e5ec] shadow-[inset_6px_6px_12px_#babecc,inset_-6px_-6px_12px_#ffffff] flex flex-col items-center justify-center p-4">
            <span className="text-4xl font-extrabold text-[#ff4757]">
              {sub?.daysRemaining || 0}
            </span>
            <span className="text-xs text-[#4a5568] font-bold mt-1 uppercase tracking-wider">Ngày</span>
          </div>

          <div className="mt-5 flex items-center gap-2 text-xs font-medium text-[#4a5568]">
            <Clock className="h-3.5 w-3.5 text-[#ff4757] shrink-0" />
            <span>Mở cửa từ 5:00 - 22:00 hàng ngày</span>
          </div>
        </div>
      </div>

      {/* History section */}
      <div className="rounded-3xl p-6 sm:p-8 bg-[#e0e5ec] shadow-[9px_9px_18px_#babecc,-9px_-9px_18px_#ffffff] border border-white/40">
        <div className="flex items-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl bg-[#e0e5ec] flex items-center justify-center shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]">
            <Dumbbell className="h-4.5 w-4.5 text-[#ff4757]" />
          </div>
          <h3 className="text-lg font-bold text-[#2d3436]">Lịch sử đăng ký gói tập</h3>
        </div>

        {allSubscriptions.length === 0 ? (
          <div className="text-center py-10 rounded-2xl border border-dashed border-[#babecc] bg-[#e0e5ec]/50 shadow-[inset_2px_2px_4px_#babecc,inset_-2px_-2px_4px_#ffffff]">
            <CreditCard className="h-8 w-8 text-[#a0aec0] mx-auto mb-2" />
            <p className="text-sm font-medium text-[#4a5568]">Bạn chưa đăng ký gói tập nào tại hệ thống.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {allSubscriptions.map((item) => {
              const isPending = String(item.status || "").toLowerCase() === "pending";
              return (
                <div 
                  key={item.id || item._id} 
                  className="rounded-2xl p-4 sm:p-5 bg-[#e0e5ec] shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] border border-white/30 transition-all hover:scale-[1.005]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-extrabold text-sm sm:text-base text-[#2d3436]">
                          {item.packageName || "Gói không xác định"}
                        </h4>
                        <span className={`text-[10px] sm:text-xs font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadgeClass(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                      <p className="text-xs font-mono text-[#4a5568] mt-1">Mã đơn: {item.packageCode || "-"}</p>
                    </div>

                    {isPending && (
                      <div className="sm:self-center shrink-0">
                        <Button
                          size="sm"
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 py-2 rounded-xl shadow-[3px_3px_6px_rgba(16,185,129,0.3)] transition-all active:translate-y-[1px]"
                          onClick={() => activate.mutate(item.id || item._id)}
                          isLoading={activate.isPending}
                          disabled={activate.isPending}
                        >
                          Kích hoạt ngay
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Details row */}
                  <div className="mt-4 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4 border-t border-[#babecc]/50 pt-4">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a5568]">Ngày bắt đầu</p>
                      <p className="font-bold text-[#2d3436] mt-0.5">
                        {item.startDate ? format(new Date(item.startDate), "dd/MM/yyyy") : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a5568]">Ngày kết thúc</p>
                      <p className="font-bold text-[#2d3436] mt-0.5">
                        {item.endDate ? format(new Date(item.endDate), "dd/MM/yyyy") : "-"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a5568]">Thời gian hạn</p>
                      <p className="font-bold text-[#2d3436] mt-0.5">{item.remainingDays ?? 0} ngày</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#4a5568]">Trạng thái kích hoạt</p>
                      <p className="font-bold text-[#2d3436] mt-0.5">
                        {isPending ? "Chờ kích hoạt" : "Đã hoàn tất"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
