import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Badge, Button, Card, PageHeader, Pagination } from "@/components/ui";
import { useStaffMembers } from "@/hooks/use-queries";

const LIMIT = 10;

export default function StaffMembers() {
  const [mode, setMode] = useState("active");
  const [currentPage, setCurrentPage] = useState(1);

  // UX: reset về trang 1 khi đổi mode
  useEffect(() => { setCurrentPage(1); }, [mode]);

  const { data: raw, isLoading, isError, isFetching } = useStaffMembers(mode, { page: currentPage, limit: LIMIT });

  const members    = raw?.data ?? (Array.isArray(raw) ? raw : []);
  const pagination = raw?.pagination ?? null;

  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div>
      <PageHeader
        title="Danh sách hội viên"
        description={pagination ? `Tổng ${pagination.totalRecords ?? members.length} hội viên` : "Lọc theo trạng thái"}
      />

      {/* Filter mode */}
      <div
        className="mb-4 flex gap-1 p-1 rounded-xl w-fit"
        style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
      >
        {[{ key: "active", label: "Active" }, { key: "expiring_soon", label: "Sắp hết hạn" }].map((m) => (
          <button key={m.key} onClick={() => setMode(m.key)}
            className={[
              "px-4 py-2 rounded-lg text-sm font-semibold transition-all",
              mode === m.key
                ? "bg-[#ff4757] text-white shadow-[3px_3px_6px_rgba(166,50,60,0.3)]"
                : "text-[#4a5568] hover:text-[#2d3436]",
            ].join(" ")}>
            {m.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-[#4a5568]">Đang tải danh sách hội viên...</p>}
      {isError   && <p className="text-[#ef4444]">Không tải được danh sách hội viên.</p>}
      {isFetching && !isLoading && <p className="text-xs text-[#4a5568] mb-2">Đang cập nhật...</p>}

      {/* Mobile cards */}
      <div className="space-y-4 sm:hidden">
        {members.map((member) => (
          <Card key={member._id || member.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#2d3436]">{member.name}</p>
                <p className="truncate text-sm text-[#4a5568]">{member.email || "-"}</p>
              </div>
              <Badge variant={member.status === "active" ? "success" : "warning"}>{member.status || "-"}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[#4a5568]">Phone</p><p>{member.phone || "-"}</p></div>
              <div><p className="text-[#4a5568]">Gói hiện tại</p><p className="truncate">{member.packageName || "-"}</p></div>
              <div>
                <p className="text-[#4a5568]">Ngày hết hạn</p>
                <p>{member.subscriptionEndDate ? format(new Date(member.subscriptionEndDate), "dd/MM/yyyy") : "-"}</p>
              </div>
              <div><p className="text-[#4a5568]">Còn lại</p><p>{member.remainingDays ?? "-"} ngày</p></div>
            </div>
          </Card>
        ))}
        {!isLoading && !isError && members.length === 0 && (
          <p className="text-center text-[#4a5568] py-8">Không có dữ liệu hội viên.</p>
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden p-0 overflow-x-auto sm:block">
        {!isLoading && !isError && (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs uppercase tracking-wider text-[#4a5568]"
              style={{ background: "rgba(209,217,230,0.6)", borderBottom: "1px solid #babecc" }}>
              <tr>
                <th className="p-4">Tên</th>
                <th className="p-4">Email</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Gói hiện tại</th>
                <th className="p-4">Ngày hết hạn</th>
                <th className="p-4">Còn lại</th>
                <th className="p-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id || member.id}
                  className="border-b border-[#d1d9e6] hover:bg-[#d1d9e6]/40 transition-colors">
                  <td className="p-4 font-semibold text-[#2d3436]">{member.name}</td>
                  <td className="p-4 text-[#4a5568]">{member.email || "-"}</td>
                  <td className="p-4 text-[#4a5568]">{member.phone || "-"}</td>
                  <td className="p-4">
                    <div className="text-[#2d3436]">{member.packageName || "-"}</div>
                    <div className="text-xs text-[#4a5568]">{member.currentPackage?.code || member.currentPackage?.id || ""}</div>
                  </td>
                  <td className="p-4 text-[#4a5568]">
                    {member.subscriptionEndDate ? format(new Date(member.subscriptionEndDate), "dd/MM/yyyy") : "-"}
                  </td>
                  <td className="p-4 text-[#4a5568]">{member.remainingDays ?? "-"} ngày</td>
                  <td className="p-4">
                    <Badge variant={member.status === "active" ? "success" : "warning"}>{member.status || "-"}</Badge>
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td className="p-8 text-center text-[#4a5568]" colSpan={7}>Không có dữ liệu.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Pagination meta={pagination} currentPage={currentPage} onPageChange={handlePageChange} />
    </div>
  );
}
