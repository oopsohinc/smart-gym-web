import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Dumbbell, Heart, Clock, Users, Activity, Zap, Phone, MapPin, Menu, X, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { usePackages } from "@/hooks/use-queries";
import "@/styles/landing.css";

const NAV_LINKS = [
  { label: "Trang chủ", href: "#home" },
  { label: "Về chúng tôi", href: "#about" },
  { label: "Dịch vụ", href: "#services" },
  { label: "Lịch tập", href: "#schedule" },
  { label: "Bảng giá", href: "#pricing" },
];

const SERVICES = [
  { icon: Dumbbell, title: "Gym & Tạ Tự Do", desc: "Trang thiết bị máy móc hiện đại, đầy đủ tạ tự do và máy tập cardio chuyên nghiệp cho mọi trình độ." },
  { icon: Activity, title: "Aerobic & Zumba", desc: "Lớp học nhảy aerobic và Zumba sôi động mỗi ngày, đốt cháy calo hiệu quả với huấn luyện viên chuyên nghiệp." },
  { icon: Users, title: "Personal Training", desc: "Huấn luyện viên cá nhân 1-1 giúp bạn đạt mục tiêu nhanh nhất với giáo án tập luyện được cá nhân hóa." },
  { icon: Heart, title: "Tư vấn dinh dưỡng", desc: "Chương trình tư vấn dinh dưỡng và chế độ ăn khoa học, hỗ trợ quá trình tập luyện hiệu quả tối ưu." },
  { icon: Zap, title: "Đo lường Inbody", desc: "Dịch vụ đo thành phần cơ thể Inbody miễn phí, theo dõi tiến trình và điều chỉnh kế hoạch luyện tập." },
  { icon: Clock, title: "Mở cửa 24/7", desc: "Phòng tập hoạt động 24/7 không nghỉ, phù hợp mọi lịch trình để bạn tập bất cứ lúc nào thuận tiện." },
];

const SCHEDULE = [
  { day: "Thứ 2 - Thứ 6", gym: "05:00 - 23:00", aerobic: "06:00 & 17:30", pt: "Theo lịch hẹn" },
  { day: "Thứ 7", gym: "05:00 - 23:00", aerobic: "07:00 & 16:00", pt: "Theo lịch hẹn" },
  { day: "Chủ Nhật", gym: "05:00 - 22:00", aerobic: "07:00", pt: "Theo lịch hẹn" },
];

const STATS = [
  { number: "9.700+", label: "Hội viên" },
  { number: "815+", label: "Lượt check-in" },
  { number: "24/7", label: "Hoạt động" },
  { number: "5+", label: "Năm kinh nghiệm" },
];

const PACKAGES = [
  { name: "1 Tháng", price: "350.000", duration: "30 ngày", features: ["Gym tự do", "Phòng tập hiện đại", "Hỗ trợ cơ bản"] },
  { name: "3 Tháng", price: "900.000", duration: "90 ngày", popular: true, features: ["Gym tự do", "Aerobic miễn phí", "Tư vấn dinh dưỡng", "Đo Inbody"] },
  { name: "6 Tháng", price: "1.500.000", duration: "180 ngày", features: ["Gym tự do", "Aerobic miễn phí", "PT 2 buổi", "Tư vấn dinh dưỡng"] },
  { name: "12 Tháng", price: "2.400.000", duration: "365 ngày", features: ["Gym tự do", "Aerobic miễn phí", "PT 5 buổi", "Tủ đồ riêng"] },
];

function LEDIndicator({ color = "green", pulse = true }) {
  const colors = {
    green: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,1)]",
    red: "bg-[#ff4757] shadow-[0_0_10px_rgba(255,71,87,0.8)]",
    yellow: "bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.8)]",
  };

  return <div className={`w-2 h-2 rounded-full ${colors[color]} ${pulse ? "animate-pulse" : ""}`} />;
}

function NeuCard({ children, className = "", elevated = false, withScrews = false }) {
  return (
    <div className={`neu-card relative rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 ${elevated ? "neu-floating" : ""} ${withScrews ? "with-screws" : ""} ${className}`}>
      {children}
    </div>
  );
}

function NeuButton({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-[#ff4757] text-white shadow-[4px_4px_8px_rgba(166,50,60,0.4),-4px_-4px_8px_rgba(255,100,110,0.4)] hover:brightness-110 active:translate-y-[2px] active:shadow-[inset_6px_6px_12px_#babecc,inset_-6px_-6px_12px_#ffffff]",
    secondary: "bg-[#e0e5ec] text-[#2d3436] shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff] hover:text-[#ff4757] active:translate-y-[2px] active:shadow-[inset_6px_6px_12px_#babecc,inset_-6px_-6px_12px_#ffffff]",
  };

  return (
    <button className={`px-6 py-3 rounded-xl font-bold text-sm uppercase tracking-widest transition-all duration-150 ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

function VentSlots() {
  return (
    <div className="absolute top-4 right-4 flex gap-1">
      {[0, 1, 2].map((slot) => (
        <div key={slot} className="h-6 w-1 rounded-full bg-[#d1d9e6] shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]" />
      ))}
    </div>
  );
}

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { data: packagesData, isLoading: packagesLoading } = usePackages();
  const activePackages = (packagesData || []).filter((p) => p.isActive);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href) => {
    const element = document.querySelector(href);
    if (element) element.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#e0e5ec] text-[#2d3436] overflow-x-hidden noise-overlay">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#e0e5ec]/95 shadow-[0_4px_16px_#babecc] backdrop-blur-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] flex items-center justify-center overflow-hidden bg-[#e0e5ec]">
                <img src="/svgymicon.svg" alt="SV Gym logo" className="w-10 h-10 object-contain mix-blend-multiply" />
              </div>
              <div>
                <span className="font-extrabold text-xl md:text-2xl tracking-tight drop-shadow-[0_1px_0_#ffffff]">
                  SV <span className="text-[#ff4757]">GYM</span>
                </span>
                <div className="hidden sm:flex items-center gap-2">
                  <LEDIndicator color="green" />
                  <span className="font-mono text-[10px] text-[#4a5568] uppercase tracking-widest">24/7 Active</span>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map((link) => (
                <button key={link.href} onClick={() => scrollTo(link.href)} className="text-[#4a5568] hover:text-[#ff4757] transition-colors text-sm font-semibold uppercase tracking-wide">
                  {link.label}
                </button>
              ))}
              <button onClick={() => navigate("/login")} className="text-[#4a5568] hover:text-[#ff4757] transition-colors text-sm font-semibold uppercase tracking-wide">Đăng nhập</button>
              <NeuButton variant="primary" onClick={() => navigate("/register")}>Đăng Ký</NeuButton>
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-3 rounded-xl shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]" aria-label="Toggle menu">
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-screen" : "max-h-0"}`}>
          <div className="px-4 py-4 bg-[#e0e5ec] shadow-[inset_0_4px_8px_#babecc]">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollTo(link.href)}
                className="block w-full text-left py-3 text-[#4a5568] hover:text-[#ff4757] font-semibold uppercase tracking-wide border-b border-[#babecc]"
              >
                {link.label}
              </button>
            ))}
            <button onClick={() => { navigate("/login"); setMenuOpen(false); }} className="block w-full text-left py-3 text-[#4a5568] hover:text-[#ff4757] font-semibold uppercase tracking-wide border-b border-[#babecc]">Đăng nhập</button>
            <NeuButton variant="primary" className="w-full mt-4" onClick={() => navigate("/register")}>Đăng Ký</NeuButton>
          </div>
        </div>
      </nav>

      <section id="home" className="relative min-h-screen flex items-center pt-20">
        <div className="absolute inset-0 bg-[url('/images/hero-gym.jpg')] bg-cover bg-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#e0e5ec]/35 via-[#e0e5ec]/70 to-[#e0e5ec]" />
        <div className="absolute inset-0 carbon-fiber opacity-10" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3 space-y-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] bg-[#e0e5ec]">
                <LEDIndicator color="green" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#4a5568]">System Online • Huế</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-none drop-shadow-[0_2px_0_#ffffff]">
                <span className="text-[#2d3436]">SV </span>
                <span className="text-[#ff4757]">GYM</span>
                <span className="block text-3xl sm:text-4xl lg:text-5xl mt-4 text-[#4a5568] font-bold">Fitness Center</span>
              </h1>

              <p className="text-lg text-[#4a5568] max-w-2xl leading-relaxed">
                Trung tâm Fitness & Thể hình hàng đầu tại Huế — với trang thiết bị hiện đại, HLV chuyên nghiệp và cộng đồng năng lượng tích cực. Hoạt động 24/7.
              </p>

              <div className="flex flex-wrap gap-4">
                <NeuButton variant="primary" onClick={() => scrollTo("#pricing")}>Xem Bảng Giá</NeuButton>
                <NeuButton variant="secondary" onClick={() => scrollTo("#about")}>Tìm Hiểu Thêm</NeuButton>
              </div>

              <div className="flex items-center gap-3 pt-8">
                <div className="w-px h-12 bg-gradient-to-b from-[#ff4757] to-transparent" />
                <span className="font-mono text-xs uppercase tracking-widest text-[#4a5568] animate-bounce">Kéo xuống</span>
                <ChevronDown size={16} className="text-[#ff4757] animate-bounce" />
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="relative">
                <div className="relative bg-[#2d3436] rounded-3xl p-4 shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff] carbon-fiber">
                  <div className="bg-[#1a1a2e] rounded-2xl p-1 relative overflow-hidden">
                    <div className="relative bg-gradient-to-br from-[#16213e] to-[#0f0f23] rounded-xl aspect-[3/4] overflow-hidden scanlines">
                      <img src="/images/hero-gym.jpg" alt="SV Gym Interior" className="absolute inset-0 h-full w-full object-cover opacity-60" />
                      <div className="absolute inset-0 flex flex-col justify-between p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <LEDIndicator color="green" />
                            <span className="font-mono text-[10px] text-green-400 uppercase">PWR</span>
                          </div>
                          <span className="font-mono text-[10px] text-[#4a5568]">24:00:00</span>
                        </div>

                        <div className="space-y-2">
                          <div className="bg-black/50 backdrop-blur-sm rounded-lg p-3 border border-[#ff4757]/30">
                            <span className="font-mono text-xs text-[#ff4757] uppercase">Active Members</span>
                            <div className="font-mono text-2xl text-white font-bold">9,700+</div>
                          </div>
                          <div className="flex gap-2">
                            <div className="flex-1 bg-black/50 backdrop-blur-sm rounded-lg p-2 border border-green-500/30">
                              <span className="font-mono text-[10px] text-green-400 uppercase">Status</span>
                              <div className="font-mono text-sm text-white">ONLINE</div>
                            </div>
                            <div className="flex-1 bg-black/50 backdrop-blur-sm rounded-lg p-2 border border-yellow-500/30">
                              <span className="font-mono text-[10px] text-yellow-400 uppercase">Hours</span>
                              <div className="font-mono text-sm text-white">24/7</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="absolute -right-1 top-1/4 w-1 h-8 bg-[#4a5568] rounded-l-sm" />
                  <div className="absolute -right-1 top-1/3 w-1 h-12 bg-[#4a5568] rounded-l-sm" />

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2">
                    <LEDIndicator color="green" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#2d3436] py-12 relative overflow-hidden">
        <div className="absolute inset-0 carbon-fiber opacity-50" />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-mono text-4xl md:text-5xl text-white font-bold tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">{stat.number}</div>
                <div className="font-mono text-xs text-[#a8b2d1] uppercase tracking-widest mt-2">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative order-2 lg:order-1">
              <NeuCard elevated withScrews className="p-4">
                <div className="relative rounded-xl overflow-hidden aspect-[4/3]">
                  <img src="/images/svgymdumbell.jpg" alt="SV Gym Training" className="absolute inset-0 h-full w-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
                </div>
                <VentSlots />
              </NeuCard>

              <div className="absolute -bottom-4 -right-4 lg:bottom-6 lg:-right-6 bg-[#e0e5ec] rounded-2xl p-4 shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff]">
                <div className="flex items-center gap-2">
                  <LEDIndicator color="green" />
                  <span className="font-mono text-xs uppercase tracking-widest text-[#4a5568]">24/7</span>
                </div>
                <div className="font-bold text-[#2d3436] mt-1">Luôn mở cửa</div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-1 bg-[#ff4757] rounded-full" />
                <span className="font-mono text-xs text-[#ff4757] uppercase tracking-widest">Về chúng tôi</span>
              </div>
              <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-[0_1px_0_#ffffff]">
                SV GYM - NƠI <span className="text-[#ff4757]">ĐAM MÊ</span> GẶP GỠ <span className="text-[#ff4757]">KỶ LUẬT</span>
              </h2>

              <p className="text-[#4a5568] mt-6 leading-relaxed">
                <strong className="text-[#2d3436]">SV GYM 24/7</strong> tọa lạc tại <strong className="text-[#ff4757]">B11, Kiệt 44, Hồ Đắc Di, Phường An Cựu, Huế</strong> — là trung tâm fitness cung cấp dịch vụ chăm sóc sức khỏe và thể hình toàn diện.
              </p>

              <p className="text-[#4a5568] mt-4 leading-relaxed">
                Với hơn <strong className="text-[#2d3436]">9.700 hội viên</strong> và hơn <strong className="text-[#2d3436]">815 lượt ghé thăm</strong>, chúng tôi tự hào là một trong những phòng tập được yêu thích nhất tại Thành phố Huế.
              </p>

              <div className="mt-8 grid sm:grid-cols-2 gap-4">
                {["Huấn Luyện Viên Chuyên Nghiệp", "Thiết Bị Hiện Đại"].map((item, index) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#ff4757] flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(255,71,87,0.4)]">
                      <span className="text-white text-xs font-bold">✓</span>
                    </div>
                    <div>
                      <p className="font-bold text-[#2d3436] text-sm">{item}</p>
                      <p className="text-[#4a5568] text-xs mt-0.5">{index === 0 ? "Được đào tạo bài bản, nhiệt tình" : "Máy móc chuyên nghiệp, đầy đủ"}</p>
                    </div>
                  </div>
                ))}
              </div>

              <NeuButton variant="primary" className="mt-8" onClick={() => scrollTo("#pricing")}>Đăng Ký Ngay →</NeuButton>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-24 bg-[#d1d9e6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-1 bg-[#ff4757] rounded-full" />
              <span className="font-mono text-xs text-[#ff4757] uppercase tracking-widest">Dịch vụ</span>
              <div className="w-8 h-1 bg-[#ff4757] rounded-full" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-[0_1px_0_#ffffff]">
              DỊCH VỤ <span className="text-[#ff4757]">ĐẲNG CẤP</span>
            </h2>
            <p className="text-[#4a5568] mt-4 max-w-2xl mx-auto">Chúng tôi cung cấp đầy đủ các dịch vụ fitness & thể hình để đáp ứng mọi nhu cầu của bạn</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => {
              const Icon = service.icon;
              return (
                <NeuCard key={service.title} className="group relative" withScrews>
                  <VentSlots />
                  <div className="w-14 h-14 rounded-2xl bg-[#d1d9e6] shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff] flex items-center justify-center mb-4 group-hover:shadow-[0_0_20px_rgba(255,71,87,0.3)] transition-all duration-300">
                    <Icon className="w-7 h-7 text-[#ff4757]" />
                  </div>
                  <h3 className="font-bold text-lg text-[#2d3436] mb-2 group-hover:text-[#ff4757] transition-colors">{service.title}</h3>
                  <p className="text-[#4a5568] text-sm leading-relaxed">{service.desc}</p>
                  <div className="mt-4 w-8 h-1 bg-[#ff4757] rounded-full group-hover:w-16 transition-all duration-300" />
                </NeuCard>
              );
            })}
          </div>
        </div>
      </section>

      <section id="schedule" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-1 bg-[#ff4757] rounded-full" />
              <span className="font-mono text-xs text-[#ff4757] uppercase tracking-widest">Lịch tập</span>
              <div className="w-8 h-1 bg-[#ff4757] rounded-full" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-[0_1px_0_#ffffff]">
              LỊCH <span className="text-[#ff4757]">HOẠT ĐỘNG</span>
            </h2>
          </div>

          <NeuCard elevated withScrews className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[680px]">
                <thead>
                  <tr className="bg-[#2d3436] text-white">
                    <th className="text-left font-mono text-xs uppercase tracking-widest py-4 px-6">Ngày</th>
                    <th className="text-left font-mono text-xs uppercase tracking-widest py-4 px-6">Phòng Gym</th>
                    <th className="text-left font-mono text-xs uppercase tracking-widest py-4 px-6">Lớp Aerobic</th>
                    <th className="text-left font-mono text-xs uppercase tracking-widest py-4 px-6">PT Cá Nhân</th>
                  </tr>
                </thead>
                <tbody>
                  {SCHEDULE.map((row, index) => (
                    <tr key={row.day} className={`border-b border-[#babecc] ${index % 2 === 0 ? "bg-[#e0e5ec]" : "bg-[#d1d9e6]"} hover:bg-[#ff4757]/10 transition-colors`}>
                      <td className="py-5 px-6 font-semibold text-[#2d3436]">{row.day}</td>
                      <td className="py-5 px-6 font-mono text-sm text-[#4a5568]">{row.gym}</td>
                      <td className="py-5 px-6 font-mono text-sm text-[#4a5568]">{row.aerobic}</td>
                      <td className="py-5 px-6 font-mono text-sm text-[#4a5568]">{row.pt}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex items-center justify-center gap-3 px-6 pb-2">
              <LEDIndicator color="green" />
              <span className="font-mono text-xs text-[#4a5568] uppercase tracking-wide">Phòng gym mở cửa 24/7 — Trừ thời gian vệ sinh định kỳ</span>
            </div>
          </NeuCard>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-[#d1d9e6]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-1 bg-[#ff4757] rounded-full" />
              <span className="font-mono text-xs text-[#ff4757] uppercase tracking-widest">Bảng giá</span>
              <div className="w-8 h-1 bg-[#ff4757] rounded-full" />
            </div>
            <h2 className="text-4xl lg:text-5xl font-extrabold tracking-tight drop-shadow-[0_1px_0_#ffffff]">
              GÓI TẬP <span className="text-[#ff4757]">PHÙ HỢP</span> VỚI BẠN
            </h2>
            <p className="text-[#4a5568] mt-4 text-base">Mức giá hợp lý, phù hợp với mọi đối tượng</p>
          </div>

          {/* Loading state */}
          {packagesLoading && (
            <div className="flex items-center justify-center py-16 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#ff4757]" />
              <span className="font-mono text-sm text-[#4a5568] uppercase tracking-widest">Đang tải gói tập...</span>
            </div>
          )}

          {/* Real packages from API */}
          {!packagesLoading && activePackages.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activePackages.map((pkg, idx) => {
                const isPopular = idx === 1;
                const cardClass = isPopular
                  ? "bg-[#e0e5ec] shadow-[0_0_0_3px_#ff4757,12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff]"
                  : "bg-[#e0e5ec] shadow-[8px_8px_16px_#babecc,-8px_-8px_16px_#ffffff] hover:shadow-[12px_12px_24px_#babecc,-12px_-12px_24px_#ffffff]";

                return (
                  <div key={pkg.id} className={`relative rounded-2xl transition-all duration-300 hover:-translate-y-2 ${cardClass}`}>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="w-4 h-4 rounded-full bg-[#d1d9e6] shadow-[inset_2px_2px_4px_#babecc,inset_-2px_-2px_4px_#ffffff]" />
                    </div>

                    {isPopular && (
                      <div className="bg-[#ff4757] text-white text-xs font-bold uppercase tracking-widest text-center py-2 rounded-t-2xl">
                        <div className="flex items-center justify-center gap-2">
                          <LEDIndicator color="yellow" pulse={false} />
                          Phổ Biến Nhất
                        </div>
                      </div>
                    )}

                    <div className="p-6 pt-8">
                      <h3 className="font-bold text-xl text-[#2d3436]">{pkg.name}</h3>
                      {pkg.description && (
                        <p className="text-xs text-[#4a5568] mt-1 mb-2 leading-snug">{pkg.description}</p>
                      )}
                      <div className="flex items-end gap-1 mt-2 mb-1">
                        <span className={`font-mono text-2xl font-bold leading-none ${isPopular ? "text-[#ff4757]" : "text-[#2d3436]"}`}>
                          {formatCurrency(pkg.price)}
                        </span>
                      </div>
                      <div className="font-mono text-xs text-[#4a5568] uppercase tracking-wide mb-4">
                        {pkg.durationDays} ngày
                      </div>
                      <div className="w-full h-px bg-[#babecc] mb-4" />
                      <NeuButton
                        variant={isPopular ? "primary" : "secondary"}
                        className="w-full"
                        onClick={() => navigate("/register")}
                      >
                        Đăng Ký Ngay
                      </NeuButton>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fallback khi API trống */}
          {!packagesLoading && activePackages.length === 0 && (
            <div className="text-center py-12">
              <p className="text-[#4a5568] font-mono text-sm">Vui lòng liên hệ để biết thêm thông tin gói tập.</p>
              <NeuButton variant="primary" className="mt-6" onClick={() => navigate("/register")}>Đăng Ký Tư Vấn</NeuButton>
            </div>
          )}

          <p className="text-center text-[#4a5568] text-sm mt-8 font-mono">* Giá có thể thay đổi. Vui lòng liên hệ để biết thêm chi tiết và ưu đãi đặc biệt.</p>
        </div>
      </section>

      <section className="py-20 bg-[#2d3436] relative overflow-hidden">
        <div className="absolute inset-0 carbon-fiber opacity-30" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 0, transparent 50%)", backgroundSize: "20px 20px" }} />

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-4">SẴN SÀNG THAY ĐỔI BẢN THÂN?</h2>
          <p className="text-[#a8b2d1] text-lg mb-8 max-w-2xl mx-auto">Hãy đến SV GYM hôm nay — buổi tập đầu tiên của bạn sẽ là bước thay đổi cuộc đời!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="tel:+84935367752" className="inline-flex items-center justify-center gap-3 bg-white text-[#2d3436] px-8 py-4 rounded-xl font-bold uppercase tracking-widest shadow-[4px_4px_8px_rgba(0,0,0,0.3),-4px_-4px_8px_rgba(255,255,255,0.1)] hover:brightness-110 transition-all">
              <Phone size={20} />
              0935 367 752
            </a>
            <a href="https://www.google.com/maps/place/SV+GYM/@16.4475519,107.602326,21z" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-3 bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white hover:text-[#2d3436] transition-all">
              <MapPin size={20} />
              Chỉ Đường
            </a>
          </div>
        </div>
      </section>

      <footer className="bg-[#e0e5ec] border-t border-[#babecc] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] flex items-center justify-center overflow-hidden bg-[#e0e5ec]">
                <img src="/svgymicon.svg" alt="SV Gym" className="w-10 h-10 object-contain mix-blend-multiply" />
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight">
                  SV <span className="text-[#ff4757]">GYM</span>
                </span>
                <p className="font-mono text-xs text-[#4a5568]">24/7 Fitness Center • Huế</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-center">
              {NAV_LINKS.map((link) => (
                <button key={link.href} onClick={() => scrollTo(link.href)} className="font-mono text-xs text-[#4a5568] hover:text-[#ff4757] uppercase tracking-widest transition-colors">
                  {link.label}
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              {[
                { href: "https://www.facebook.com/p/SV-GYM-247-H%E1%BB%93-%C4%90%E1%BA%AFc-Di-Hu%E1%BA%BF-100083204717126/", label: "f" },
                { href: "tel:+84935367752", icon: Phone },
                { href: "https://www.google.com/maps/place/SV+GYM/@16.4475519,107.602326,21z", icon: MapPin },
              ].map((social, index) => {
                const SocialIcon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target={social.href.startsWith("http") ? "_blank" : undefined}
                    rel={social.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="w-10 h-10 rounded-xl shadow-[4px_4px_8px_#babecc,-4px_-4px_8px_#ffffff] flex items-center justify-center text-[#4a5568] hover:text-[#ff4757] hover:shadow-[0_0_10px_rgba(255,71,87,0.3)] transition-all active:shadow-[inset_4px_4px_8px_#babecc,inset_-4px_-4px_8px_#ffffff]"
                  >
                    {social.label ? <span className="font-bold">{social.label}</span> : <SocialIcon size={18} />}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#babecc] text-center">
            <p className="font-mono text-xs text-[#4a5568]">
              © {new Date().getFullYear()} SV GYM 24/7 – B11, Kiệt 44, Hồ Đắc Di, Phường An Cựu, Huế. Điện thoại:{" "}
              <a href="tel:+84935367752" className="hover:text-[#ff4757] transition-colors">0935 367 752</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}