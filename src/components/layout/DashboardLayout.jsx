import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/AuthContext";
import {
  Activity,
  ClipboardList,
  CreditCard,
  Dumbbell,
  History,
  Key,
  LayoutDashboard,
  LogOut,
  Package,
  QrCode,
  Menu,
  X,
  UserCircle,
  Users,
  ChevronRight,
  Receipt,
  Shield,
  BookOpen,
  Swords,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = {
  member: [
    { label: "Tổng quan", href: "/member/dashboard", icon: LayoutDashboard },
    { label: "Hồ sơ", href: "/member/profile", icon: UserCircle },
    { label: "Gói tập của tôi", href: "/member/subscription", icon: Dumbbell },
    { label: "Kế hoạch tập", href: "/member/workout-plans", icon: Swords },
    { label: "Mã QR check-in", href: "/member/qr", icon: QrCode },
    { label: "Lịch sử check-in", href: "/member/checkins", icon: History },
  ],
  staff: [
    { label: "Đơn chờ duyệt", href: "/staff/orders", icon: ClipboardList },
    { label: "Check-in", href: "/staff/checkin", icon: QrCode },
    { label: "Danh sách hội viên", href: "/staff/members", icon: Users },
  ],
  admin: [
    { label: "Tổng quan doanh thu", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Tổng quan check-in", href: "/admin/checkins", icon: Activity },
    { label: "Quản lý nhân viên", href: "/admin/staff", icon: UserCircle },
    { label: "Quản lý gói tập", href: "/admin/packages", icon: Package },
    { label: "Danh sách đơn hàng", href: "/admin/orders", icon: ClipboardList },
    { label: "Hóa đơn", href: "/admin/invoices", icon: Receipt },
    { label: "Danh sách hội viên", href: "/admin/members", icon: Users },
    { label: "Phân quyền", href: "/admin/roles", icon: Shield },
    { label: "Cơ sở tri thức AI", href: "/admin/knowledge-bases", icon: BookOpen },
  ],
};

const ROLE_LABEL = { admin: "Quản trị viên", staff: "Nhân viên", member: "Hội viên" };

function NavItem({ item, onClick }) {
  const Icon = item.icon;
  return (
    <NavLink
      to={item.href}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
          isActive
            ? "nav-active font-semibold"
            : "text-[#4a5568] hover:bg-[#d1d9e6] hover:text-[#2d3436]",
        )
      }
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{item.label}</span>
      {({ isActive }) => isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-60" />}
    </NavLink>
  );
}

function SidebarContent({ user, links, logout, onClose }) {
  return (
    <div className="flex h-full flex-col bg-[#e0e5ec]">
      {/* Logo */}
      <div
        className="flex h-16 items-center gap-3 px-5 border-b border-[#babecc]"
        style={{ boxShadow: "0 2px 4px #babecc" }}
      >
        <div className="w-9 h-9 rounded-full flex items-center justify-center bg-[#e0e5ec] shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff] shrink-0">
          <img src="/svgymicon.svg" alt="SV Gym" className="w-7 h-7 object-contain" />
        </div>
        <span className="font-display text-lg font-extrabold text-[#2d3436]">
          SV <span className="text-[#ff4757]">GYM</span>
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto rounded-full p-1.5 text-[#4a5568] hover:bg-[#d1d9e6] transition-colors md:hidden"
            aria-label="Đóng menu"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-2">
        <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold bg-[#ff4757]/10 text-[#ff4757] border border-[#ff4757]/20">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ff4757] animate-pulse" />
          {ROLE_LABEL[user.role] || user.role}
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 pb-4 space-y-0.5">
        {links.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-[#ff4757]/10 text-[#ff4757] font-semibold shadow-[3px_3px_6px_#babecc,-3px_-3px_6px_#ffffff]"
                  : "text-[#4a5568] hover:bg-[#d1d9e6] hover:text-[#2d3436]",
              )
            }
          >
            {({ isActive }) => {
              const Icon = item.icon;
              return (
                <>
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all",
                    isActive
                      ? "bg-[#ff4757] text-white shadow-[0_0_10px_rgba(255,71,87,0.35)]"
                      : "bg-[#d1d9e6] text-[#4a5568]",
                  )}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate">{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-3 w-3 shrink-0 opacity-60" />}
                </>
              );
            }}
          </NavLink>
        ))}
      </nav>

      {/* User card + logout */}
      <div className="border-t border-[#babecc] p-4">
        <div
          className="mb-3 rounded-xl p-3"
          style={{ boxShadow: "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff" }}
        >
          <p className="text-sm font-semibold text-[#2d3436] truncate">{user.name || user.fullName}</p>
          <p className="text-xs text-[#4a5568] truncate mt-0.5">{user.email}</p>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuthContext();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!user) return null;

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const links = navItems[user.role] || [];

  return (
    <div className="flex h-screen overflow-hidden bg-[#e0e5ec]">
      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Đóng menu"
          className="fixed inset-0 z-40 bg-[#2d3436]/30 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Desktop Sidebar */}
      <aside
        className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-[#babecc] overflow-hidden"
        style={{ boxShadow: "4px 0 12px #babecc" }}
      >
        <SidebarContent user={user} links={links} logout={logout} />
      </aside>

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[80vw] max-w-[280px] flex flex-col border-r border-[#babecc] shadow-[8px_0_24px_#babecc] transition-transform duration-300 md:hidden",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <SidebarContent
          user={user}
          links={links}
          logout={logout}
          onClose={() => setIsMobileMenuOpen(false)}
        />
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top header */}
        <header
          className="flex h-14 shrink-0 items-center justify-between border-b border-[#babecc] bg-[#e0e5ec] px-4 md:hidden"
          style={{ boxShadow: "0 2px 8px #babecc" }}
        >
          <button
            type="button"
            aria-label="Mở menu"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#4a5568] transition-all"
            style={{ boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }}
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </button>

          <span className="font-display text-base font-extrabold text-[#2d3436]">
            SV <span className="text-[#ff4757]">GYM</span>
          </span>

          <button
            onClick={logout}
            className="rounded-xl px-3 py-1.5 text-xs font-semibold text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors"
            style={{ boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }}
          >
            Đăng xuất
          </button>
        </header>

        {/* Desktop top header */}
        <header
          className="hidden md:flex h-14 shrink-0 items-center justify-between border-b border-[#babecc] bg-[#e0e5ec] px-6"
          style={{ boxShadow: "0 2px 8px #babecc" }}
        >
          <div>
            <p className="text-sm font-semibold text-[#2d3436] capitalize">
              {location.pathname.replace(/\//g, " › ").replace(/^./, (c) => c.toUpperCase())}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-[#4a5568] font-semibold hidden sm:inline-block px-3 py-1.5 rounded-lg bg-[#d1d9e6]/50 shadow-[inset_2px_2px_4px_#babecc,inset_-2px_-2px_4px_#ffffff]">
              📅 {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
            </span>
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-1.5 text-sm"
              style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
            >
              <div className="w-6 h-6 rounded-full bg-[#ff4757] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {(user.name || user.fullName || "U")[0].toUpperCase()}
              </div>
              <span className="text-[#2d3436] font-medium text-sm">{user.name || user.fullName}</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-6 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
