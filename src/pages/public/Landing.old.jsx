import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { usePackages } from "@/hooks/use-queries";
import { formatCurrency } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Trang chủ", href: "#home" },
  { label: "Về chúng tôi", href: "#about" },
  { label: "Dịch vụ", href: "#services" },
  { label: "Lịch tập", href: "#schedule" },
  { label: "Bảng giá", href: "#pricing" },
];

const SERVICES = [
  {
    icon: "🏋️",
    title: "Gym & Tạ Tự Do",
    desc: "Trang thiết bị máy móc hiện đại, đầy đủ tạ tự do và máy tập cardio chuyên nghiệp cho mọi trình độ.",
  },
  {
    icon: "🤸",
    title: "Aerobic & Zumba",
    desc: "Lớp học nhảy aerobic và Zumba sôi động mỗi ngày, đốt cháy calo hiệu quả với huấn luyện viên chuyên nghiệp.",
  },
  {
    icon: "💪",
    title: "Personal Training",
    desc: "Huấn luyện viên cá nhân 1-1 giúp bạn đạt mục tiêu nhanh nhất với giáo án tập luyện được cá nhân hóa.",
  },
  {
    icon: "🥗",
    title: "Tư vấn dinh dưỡng",
    desc: "Chương trình tư vấn dinh dưỡng và chế độ ăn khoa học, hỗ trợ quá trình tập luyện hiệu quả tối ưu.",
  },
  {
    icon: "📊",
    title: "Đo lường Inbody",
    desc: "Dịch vụ đo thành phần cơ thể Inbody miễn phí, theo dõi tiến trình và điều chỉnh kế hoạch luyện tập.",
  },
  {
    icon: "🕐",
    title: "Mở cửa 24/7",
    desc: "Phòng tập hoạt động 24/7 không nghỉ, phù hợp mọi lịch trình để bạn tập bất cứ lúc nào thuận tiện.",
  },
];

const SCHEDULE = [
  { day: "Thứ 2 - Thứ 6", gym: "05:00 - 23:00", aerobic: "06:00 & 17:30", pt: "Theo lịch hẹn" },
  { day: "Thứ 7", gym: "05:00 - 23:00", aerobic: "07:00 & 16:00", pt: "Theo lịch hẹn" },
  { day: "Chủ Nhật", gym: "05:00 - 22:00", aerobic: "07:00", pt: "Theo lịch hẹn" },
];

const STATS = [
  { number: "9.700+", label: "Hội viên" },
  { number: "815+", label: "Lượt ghé thăm" },
  { number: "24/7", label: "Hoạt động" },
  { number: "5+", label: "Năm kinh nghiệm" },
];

export default function Landing1() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: packages } = usePackages();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollTo = (href) => {
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const activePackages = (packages || []).filter((pkg) => pkg.isActive);

  return (
    <div className="bg-black text-white min-h-screen overflow-x-hidden">
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-black/95 shadow-lg shadow-red-900/20 backdrop-blur-sm" : "bg-transparent"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <img src="/svgymicon.svg" alt="SV Gym logo" className="w-10 h-10 md:w-12 md:h-12 object-contain flex-shrink-0 rounded-full" />
              <div>
                <span className="font-bebas text-2xl md:text-3xl text-white tracking-wider">SV <span className="text-red-500">GYM</span></span>
                <p className="text-gray-400 text-xs hidden sm:block tracking-widest uppercase">24/7 Fitness Center</p>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <button key={link.href} onClick={() => scrollTo(link.href)} className="text-gray-300 hover:text-red-500 transition-colors duration-200 text-sm font-medium tracking-wide uppercase">
                  {link.label}
                </button>
              ))}
            </div>

            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden text-white p-2" aria-label="Toggle menu">
              <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
              <div className={`w-6 h-0.5 bg-white mb-1.5 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
              <div className={`w-6 h-0.5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
            </button>
          </div>
        </div>

        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${menuOpen ? "max-h-screen bg-black/98 border-t border-red-900/40" : "max-h-0"}`}>
          <div className="px-6 py-4 flex flex-col gap-4">
            {NAV_LINKS.map((link) => (
              <button key={link.href} onClick={() => scrollTo(link.href)} className="text-gray-300 hover:text-red-500 transition-colors text-left text-base font-medium tracking-wide uppercase py-2 border-b border-gray-800/50">
                {link.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/hero-gym.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black" />
        <div className="relative z-10 text-center max-w-5xl mx-auto px-4 py-20">
          <div className="inline-flex items-center gap-2 bg-red-600/20 border border-red-600/50 rounded-full px-4 py-1.5 mb-6">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="text-red-400 text-sm font-medium tracking-widest uppercase">Phòng tập Huế • Hoạt động 24/7</span>
          </div>

          <h1 className="font-bebas text-6xl sm:text-8xl md:text-9xl lg:text-[10rem] leading-none tracking-wider mb-4">
            <span className="text-white">SV </span>
            <span className="text-red-500">GYM</span>
          </h1>

          <p className="text-gray-300 text-lg sm:text-xl md:text-2xl font-light tracking-wide mb-3">Trung tâm Fitness & Thể hình Hàng đầu Tại Huế</p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => scrollTo("#pricing")} className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded font-bold text-base uppercase tracking-widest transition-all duration-200 hover:shadow-2xl hover:shadow-red-600/40 hover:-translate-y-0.5">Xem Bảng Giá</button>
            <button onClick={() => scrollTo("#about")} className="border border-white/30 hover:border-red-500 text-white hover:text-red-400 px-8 py-4 rounded font-bold text-base uppercase tracking-widest transition-all duration-200 hover:-translate-y-0.5">Tìm Hiểu Thêm</button>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
            <div className="w-px h-10 bg-gradient-to-b from-red-500 to-transparent" />
            <span className="text-gray-500 text-xs tracking-widest uppercase">Kéo xuống</span>
          </div>
        </div>
      </section>

      <section className="bg-red-600 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-bebas text-4xl md:text-5xl text-white tracking-wider">{stat.number}</div>
                <div className="text-red-200 text-sm uppercase tracking-widest font-medium mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about" className="py-20 md:py-28 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
            <div className="relative">
              <div className="relative overflow-hidden rounded-lg">
                <img src="/images/svgymdumbell.jpg" alt="SV Gym Training" className="w-full h-80 md:h-[500px] object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-full h-full border-2 border-red-600 rounded-lg -z-10" />
              <div className="absolute bottom-6 left-6 bg-black/90 border border-red-600/50 rounded-lg px-5 py-4">
                <div className="font-bebas text-3xl text-red-500">24/7</div>
                <div className="text-white text-sm font-medium">Luôn mở cửa</div>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-0.5 bg-red-600" />
                <span className="text-red-500 text-sm font-semibold uppercase tracking-widest">Về chúng tôi</span>
              </div>
              <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider leading-none mb-6">SV GYM - NƠI <span className="text-red-500">ĐAM MÊ</span> GẶP GỠ <span className="text-red-500">KỶ LUẬT</span></h2>
              <p className="text-gray-300 text-base leading-relaxed mb-6"><strong className="text-white">SV GYM 24/7</strong> tọa lạc tại <strong className="text-red-400">B11, Kiệt 44, Hồ Đắc Di, Phường An Cựu, Huế</strong> — là trung tâm fitness cung cấp dịch vụ chăm sóc sức khỏe và thể hình toàn diện.</p>
              <Link to="/register" className="mt-8 inline-block bg-red-600 hover:bg-red-700 text-white px-7 py-3 rounded font-bold text-sm uppercase tracking-widest transition-all duration-200 hover:shadow-lg hover:shadow-red-600/40">Đăng Ký Ngay →</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-20 md:py-28 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-red-600" />
              <span className="text-red-500 text-sm font-semibold uppercase tracking-widest">Dịch vụ</span>
              <div className="w-8 h-0.5 bg-red-600" />
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider">DỊCH VỤ <span className="text-red-500">ĐẲNG CẤP</span></h2>
            <p className="text-gray-400 mt-4 max-w-2xl mx-auto text-base">Chúng tôi cung cấp đầy đủ các dịch vụ fitness & thể hình để đáp ứng mọi nhu cầu của bạn</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES.map((service) => (
              <div key={service.title} className="group bg-black border border-gray-800 hover:border-red-600 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-red-900/20 hover:-translate-y-1">
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="font-bebas text-xl text-white tracking-wider mb-2 group-hover:text-red-400 transition-colors">{service.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{service.desc}</p>
                <div className="mt-4 w-8 h-0.5 bg-red-600 group-hover:w-16 transition-all duration-300" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="schedule" className="py-20 md:py-28 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-red-600" />
              <span className="text-red-500 text-sm font-semibold uppercase tracking-widest">Lịch tập</span>
              <div className="w-8 h-0.5 bg-red-600" />
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider">LỊCH <span className="text-red-500">HOẠT ĐỘNG</span></h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-red-600">
                  <th className="text-left text-white font-bold uppercase tracking-widest text-sm py-4 px-6 rounded-tl-lg">Ngày</th>
                  <th className="text-left text-white font-bold uppercase tracking-widest text-sm py-4 px-6">Phòng Gym</th>
                  <th className="text-left text-white font-bold uppercase tracking-widest text-sm py-4 px-6">Lớp Aerobic</th>
                  <th className="text-left text-white font-bold uppercase tracking-widest text-sm py-4 px-6 rounded-tr-lg">PT Cá Nhân</th>
                </tr>
              </thead>
              <tbody>
                {SCHEDULE.map((row, idx) => (
                  <tr key={row.day} className={`border-b border-gray-800 ${idx % 2 === 0 ? "bg-gray-950" : "bg-black"} hover:bg-red-950/30 transition-colors`}>
                    <td className="py-5 px-6 text-white font-semibold text-sm">{row.day}</td>
                    <td className="py-5 px-6 text-gray-300 text-sm">{row.gym}</td>
                    <td className="py-5 px-6 text-gray-300 text-sm">{row.aerobic}</td>
                    <td className="py-5 px-6 text-gray-300 text-sm">{row.pt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20 md:py-28 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-8 h-0.5 bg-red-600" />
              <span className="text-red-500 text-sm font-semibold uppercase tracking-widest">Bảng Giá</span>
              <div className="w-8 h-0.5 bg-red-600" />
            </div>
            <h2 className="font-bebas text-4xl sm:text-5xl md:text-6xl text-white tracking-wider">GÓI TẬP <span className="text-red-500">PHÙ HỢP</span> VỚI BẠN</h2>
            <p className="text-gray-400 mt-4 text-base">Mức giá hợp lý, phù hợp với mọi đối tượng</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {activePackages.length === 0 ? (
              <div className="col-span-full text-center text-gray-400 py-8">Đang tải gói tập...</div>
            ) : (
              activePackages.map((plan, idx) => (
                <div key={plan.id} className={`relative rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-2 ${idx === 1 ? "border-2 border-red-600 bg-red-600/10 shadow-2xl shadow-red-900/30" : "border border-gray-800 bg-black hover:border-red-600/50"}`}>
                  {idx === 1 && (<div className="bg-red-600 text-white text-xs font-bold uppercase tracking-widest text-center py-2">🔥 Phổ Biến Nhất</div>)}
                  <div className="p-6">
                    <h3 className="font-bebas text-2xl text-white tracking-wider mb-1">{plan.name}</h3>
                    <div className="flex items-end gap-1 mb-4">
                      <span className={`font-bebas text-4xl tracking-wider ${idx === 1 ? "text-red-400" : "text-white"}`}>{plan.price}</span>
                      <span className="text-gray-400 text-sm mb-1">/{plan.durationDays} ngày</span>
                    </div>
                    <div className="w-full h-px bg-gray-800 mb-4" />
                    <p className="text-gray-300 text-sm mb-4">{plan.description || "Gói tập phù hợp"}</p>
                    <Link to="/register" className={`block w-full py-3 rounded font-bold text-sm uppercase tracking-wide transition-all duration-200 text-center ${idx === 1 ? "bg-red-600 hover:bg-red-700 text-white hover:shadow-lg hover:shadow-red-600/40" : "border border-gray-600 hover:border-red-600 text-gray-300 hover:text-white hover:bg-red-600/10"}`}>
                      Đăng Ký Ngay
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <footer className="bg-gray-950 border-t border-gray-800 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <img src="/svgymicon.svg" alt="SV Gym logo" className="w-10 h-10 object-contain" />
              <div>
                <div className="font-bebas text-2xl text-white tracking-wider">SV <span className="text-red-500">GYM</span></div>
                <p className="text-gray-500 text-xs">24/7 Fitness Center • Huế</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 justify-center">
              {NAV_LINKS.map((link) => (
                <button key={link.href} onClick={() => scrollTo(link.href)} className="text-gray-500 hover:text-red-400 text-xs uppercase tracking-widest transition-colors">{link.label}</button>
              ))}
            </div>

            <div className="flex gap-4">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all"><span className="text-sm font-bold">f</span></a>
              <a href="tel:+84935367752" className="w-10 h-10 bg-gray-800 hover:bg-red-600 rounded-full flex items-center justify-center text-gray-400 hover:text-white transition-all"><span className="text-sm">📞</span></a>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-800 text-center">
            <p className="text-gray-600 text-xs">© {new Date().getFullYear()} SV GYM 24/7 – B11, Kiệt 44, Hồ Đắc Di, Phường An Cựu, Huế. Điện thoại: <a href="tel:+84935367752" className="hover:text-red-400 transition-colors">0935 367 752</a></p>
          </div>
        </div>
      </footer>
    </div>
  );
}
