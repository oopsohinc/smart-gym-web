import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Badge, Button, Card, PageHeader, Pagination, SearchFilterBar } from "@/components/ui";
import { useStaffMembers, usePackages } from "@/hooks/use-queries";

const LIMIT = 10;

export default function StaffMembers() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [packageFilter, setPackageFilter] = useState("");

  const { data: rawPackages } = usePackages();
  const packages = rawPackages || [];

  // UX: reset về trang 1 khi đổi bất kỳ bộ lọc nào
  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, packageFilter]);

  const { data: raw, isLoading, isError, isFetching } = useStaffMembers({
    page: currentPage,
    limit: LIMIT,
    q: search,
    status: statusFilter,
    packageId: packageFilter,
  });

  const members    = raw?.data ?? (Array.isArray(raw) ? raw : []);
  const pagination = raw?.pagination ?? null;

  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const packageOptions = [
    { label: "Tất cả gói tập", value: "" },
    ...packages.map((pkg) => ({
      label: pkg.name || pkg.title || pkg.code || "",
      value: pkg._id || pkg.id || "",
    })),
  ];

  const statusOptions = [
    { label: "Tất cả trạng thái", value: "" },
    { label: "Đang hoạt động", value: "active" },
    { label: "Không hoạt động", value: "inactive" },
    { label: "Bị khóa", value: "blocked" },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Danh sách hội viên"
        description={pagination ? `Tổng ${pagination.total ?? pagination.totalRecords ?? members.length} hội viên` : "Quản lý và tra cứu thông tin hội viên"}
      />

      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm kiếm hội viên theo tên, email, sđt..."
        filters={[
          {
            key: "status",
            label: "Trạng thái",
            value: statusFilter,
            onChange: setStatusFilter,
            options: statusOptions,
            type: "select",
          },
          {
            key: "packageId",
            label: "Gói tập",
            value: packageFilter,
            onChange: setPackageFilter,
            options: packageOptions,
            type: "select",
          },
        ]}
        onClear={() => {
          setSearch("");
          setStatusFilter("");
          setPackageFilter("");
        }}
      />

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
