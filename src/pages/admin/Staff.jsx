import { useEffect, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import { Badge, Button, Card, ConfirmModal, Input, Label, Modal, PageHeader, Pagination, SearchFilterBar, Select } from "@/components/ui";
import {
  useAdminCreateStaff,
  useAdminDeleteStaff,
  useAdminStaff,
  useAdminUpdateStaff,
} from "@/hooks/use-queries";

const INITIAL_FORM = { name: "", email: "", phone: "", password: "", role: "staff" };
const LIMIT = 10;
const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export default function AdminStaff() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [isOpen, setIsOpen]   = useState(false);
  const [formData, setFormData]       = useState(INITIAL_FORM);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // UX: reset page khi filter thay đổi
  useEffect(() => { setCurrentPage(1); }, [search, status]);

  const { data: raw, isLoading, isError, isFetching } = useAdminStaff({
    page: currentPage, limit: LIMIT, q: search, status,
  });

  const staff      = raw?.data ?? (Array.isArray(raw) ? raw : []);
  const pagination = raw?.pagination ?? null;

  const createStaff = useAdminCreateStaff();
  const updateStaff = useAdminUpdateStaff();
  const deleteStaff = useAdminDeleteStaff();

  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleClear = () => { setSearch(""); setStatus(""); };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    deleteStaff.mutate(deleteTargetId, {
      onSuccess: () => setDeleteTargetId(null),
      onError:   () => setDeleteTargetId(null),
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý staff"
        description={pagination ? `Tổng cộng ${pagination.total ?? staff.length} nhân viên` : undefined}
        action={<Button onClick={() => setIsOpen(true)}><Plus className="h-4 w-4 mr-2" />Thêm staff</Button>}
      />

      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên, email, số điện thoại..."
        filters={[
          { key: "status", label: "Trạng thái", value: status, onChange: setStatus, options: STATUS_OPTIONS, type: "select" },
        ]}
        onClear={handleClear}
      />

      {isLoading && <p className="text-[#4a5568]">Đang tải danh sách staff...</p>}
      {isError   && <p className="text-[#ef4444]">Không tải được danh sách staff.</p>}
      {isFetching && !isLoading && <p className="text-xs text-[#4a5568]">Đang cập nhật...</p>}

      {/* Mobile cards */}
      <div className="space-y-4 sm:hidden">
        {staff.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-[#2d3436]">{item.name}</p>
                <p className="truncate text-sm text-[#4a5568]">{item.email}</p>
              </div>
              <Badge variant={item.status === "active" ? "success" : "warning"}>{item.status || "-"}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-[#4a5568]">Phone</p><p>{item.phone || "-"}</p></div>
              <div><p className="text-[#4a5568]">Role</p><Badge>{item.role || "staff"}</Badge></div>
              <div className="col-span-2 flex gap-2">
                <Button className="flex-1" size="sm" variant="outline"
                  onClick={() => updateStaff.mutate({ id: item.id, data: { status: item.status === "active" ? "inactive" : "active" } })}>
                  <RefreshCw className="mr-2 h-4 w-4" />Đổi trạng thái
                </Button>
                <Button className="flex-1" size="sm" variant="destructive" onClick={() => setDeleteTargetId(item.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />Xóa
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {!isLoading && !isError && staff.length === 0 && (
          <p className="text-center text-[#4a5568] py-8">Không tìm thấy nhân viên nào.</p>
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
                <th className="p-4">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((item) => (
                <tr key={item.id} className="border-b border-[#d1d9e6] hover:bg-[#d1d9e6]/40 transition-colors">
                  <td className="p-4 font-semibold text-[#2d3436]">{item.name}</td>
                  <td className="p-4 text-[#4a5568]">{item.email}</td>
                  <td className="p-4 text-[#4a5568]">{item.phone || "-"}</td>
                  <td className="p-4"><Badge>{item.role || "staff"}</Badge></td>
                  <td className="p-4">
                    <Badge variant={item.status === "active" ? "success" : "warning"}>{item.status || "-"}</Badge>
                  </td>
                  <td className="p-4 text-[#4a5568]">
                    {item.lastLoginAt ? new Date(item.lastLoginAt).toLocaleString("vi-VN") : "-"}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <Button size="icon" variant="outline"
                        onClick={() => updateStaff.mutate({ id: item.id, data: { status: item.status === "active" ? "inactive" : "active" } })}>
                        <RefreshCw className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => setDeleteTargetId(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-[#4a5568]">Không tìm thấy nhân viên nào.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      <Pagination meta={pagination} currentPage={currentPage} onPageChange={handlePageChange} />

      <ConfirmModal isOpen={!!deleteTargetId} onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete} title="Xóa staff"
        message="Bạn có chắc chắn muốn xóa staff này?" confirmLabel="Xóa" isLoading={deleteStaff.isPending} />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Tạo staff mới">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          createStaff.mutate(formData, { onSuccess: () => { setIsOpen(false); setFormData(INITIAL_FORM); } });
        }}>
          <div><Label required>Họ tên</Label><Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required /></div>
          <div><Label required>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} required /></div>
          <div><Label required>Password</Label><Input type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} required /></div>
          <div><Label>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} /></div>
          <div>
            <Label required>Role</Label>
            <Select value={formData.role} onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
              options={[{ label: "staff", value: "staff" }, { label: "admin", value: "admin" }]} />
          </div>
          <Button type="submit" isLoading={createStaff.isPending}>Tạo staff</Button>
        </form>
      </Modal>
    </div>
  );
}
