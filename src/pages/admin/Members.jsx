import { useEffect, useState } from "react";
import { Badge, Card, PageHeader, Pagination, SearchFilterBar } from "@/components/ui";
import { useAdminMembers } from "@/hooks/use-queries";

const LIMIT = 10;

export default function AdminMembers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");

  // UX: reset page khi search thay đổi
  useEffect(() => { setCurrentPage(1); }, [search]);

  const { data: raw, isLoading, isError, isFetching } = useAdminMembers({
    page: currentPage, limit: LIMIT, q: search,
  });

  const members    = raw?.data ?? (Array.isArray(raw) ? raw : []);
  const pagination = raw?.pagination ?? null;

  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Danh sách members"
        description={pagination ? `Tổng cộng ${pagination.total ?? members.length} hội viên` : undefined}
      />

      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên, email, số điện thoại..."
        onClear={() => setSearch("")}
      />

      {isLoading && <p className="text-[#4a5568]">Đang tải members...</p>}
      {isError   && <p className="text-[#ef4444]">Không tải được members.</p>}
      {isFetching && !isLoading && <p className="text-xs text-[#4a5568]">Đang cập nhật...</p>}

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
              <div><p className="text-[#4a5568]">Role</p><p>{member.role || "member"}</p></div>
              <div className="col-span-2">
                <p className="text-[#4a5568]">Lần đăng nhập cuối</p>
                <p>{member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString("vi-VN") : "-"}</p>
              </div>
            </div>
          </Card>
        ))}
        {!isLoading && !isError && members.length === 0 && (
          <p className="text-center text-[#4a5568] py-8">Không tìm thấy hội viên nào.</p>
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
                <th className="p-4">Role</th>
                <th className="p-4">Trạng thái</th>
                <th className="p-4">Lần đăng nhập cuối</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member._id || member.id} className="border-b border-[#d1d9e6] hover:bg-[#d1d9e6]/40 transition-colors">
                  <td className="p-4 font-semibold text-[#2d3436]">{member.name}</td>
                  <td className="p-4 text-[#4a5568]">{member.email || "-"}</td>
                  <td className="p-4 text-[#4a5568]">{member.phone || "-"}</td>
                  <td className="p-4 text-[#4a5568]">{member.role || "member"}</td>
                  <td className="p-4">
                    <Badge variant={member.status === "active" ? "success" : "warning"}>{member.status || "-"}</Badge>
                  </td>
                  <td className="p-4 text-[#4a5568]">
                    {member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString("vi-VN") : "-"}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td className="p-8 text-center text-[#4a5568]" colSpan={6}>Không tìm thấy hội viên nào.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Pagination meta={pagination} currentPage={currentPage} onPageChange={handlePageChange} />
    </div>
  );
}
