import { useEffect, useState } from "react";
import { Pencil, Plus, RefreshCw, Trash2 } from "lucide-react";
import { Badge, Button, Card, ConfirmModal, Input, Label, Modal, PageHeader, Pagination, SearchFilterBar, Select } from "@/components/ui";
import { toast } from "@/hooks/use-toast";
import {
  useAdminCreateStaff,
  useAdminDeleteStaff,
  useAdminPermanentDeleteStaff,
  useAdminStaff,
  useAdminUpdateStaff,
} from "@/hooks/use-queries";

const LIMIT = 10;
const STATUS_OPTIONS = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

function getInitialForm() {
  return { name: "", email: "", phone: "", password: "staff", role: "staff" };
}

function getEditForm(staff = {}) {
  return {
    fullName: staff?.fullName ?? staff?.name ?? "",
    phone: staff?.phone ?? "",
    status: staff?.status ?? "active",
  };
}

export default function AdminStaff() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]   = useState("");
  const [status, setStatus]   = useState("");
  const [isOpen, setIsOpen]   = useState(false);
  const [formData, setFormData]       = useState(getInitialForm());
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [editForm, setEditForm] = useState(getEditForm());
  const [deleteTarget, setDeleteTarget] = useState(null);

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
  const permanentDeleteStaff = useAdminPermanentDeleteStaff();

  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const handleClear = () => { setSearch(""); setStatus(""); };
  const openCreateModal = () => {
    createStaff.reset();
    setFormData(getInitialForm());
    setIsOpen(true);
  };

  const openEditModal = (staffMember) => {
    setEditingStaff(staffMember);
    setEditForm(getEditForm(staffMember));
    setIsEditOpen(true);
  };

  useEffect(() => {
    if (isOpen && formData.role !== "staff") {
      setFormData((prev) => ({ ...prev, role: "staff" }));
    }
  }, [formData.role, isOpen]);

  useEffect(() => {
    if (!isEditOpen) return;
    setEditForm((prev) => ({
      ...prev,
      status: prev.status || editingStaff?.status || "active",
    }));
  }, [editingStaff, isEditOpen]);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.status === "active") {
      updateStaff.mutate(
        { id: deleteTarget.id, data: { status: "inactive" } },
        {
          onSuccess: () => {
            setDeleteTarget(null);
            toast({
              title: "Thành công",
              description: `Đã vô hiệu hóa nhân viên "${deleteTarget.fullName || deleteTarget.name}". Bây giờ bạn có thể chọn xóa vĩnh viễn nhân viên này.`,
            });
          },
          onError: (err) => {
            setDeleteTarget(null);
            toast({
              title: "Lỗi vô hiệu hóa",
              description: err?.response?.data?.message || "Không thể vô hiệu hóa nhân viên này.",
              variant: "destructive",
            });
          }
        }
      );
    } else {
      permanentDeleteStaff.mutate(deleteTarget.id, {
        onSuccess: () => {
          setDeleteTarget(null);
          toast({
            title: "Thành công",
            description: `Đã xóa vĩnh viễn nhân viên "${deleteTarget.fullName || deleteTarget.name}" khỏi cơ sở dữ liệu.`,
          });
        },
        onError: (err) => {
          setDeleteTarget(null);
          toast({
            title: "Lỗi xóa vĩnh viễn",
            description: err?.response?.data?.message || "Không thể xóa nhân viên do có lịch sử hoạt động liên kết.",
            variant: "destructive",
          });
        }
      });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý staff"
        description={pagination ? `Tổng cộng ${pagination.total ?? staff.length} nhân viên` : undefined}
        action={<Button onClick={openCreateModal}><Plus className="h-4 w-4 mr-2" />Thêm staff</Button>}
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
                <p className="truncate font-semibold text-[#2d3436]">{item.fullName || item.name}</p>
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
                <Button className="flex-1" size="sm" variant="outline" onClick={() => openEditModal(item)}>
                  <Pencil className="mr-2 h-4 w-4" />Sửa
                </Button>
                <Button className="flex-1" size="sm" variant="destructive" onClick={() => setDeleteTarget(item)}>
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
                  <td className="p-4 font-semibold text-[#2d3436]">{item.fullName || item.name}</td>
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
                      <Button size="icon" variant="outline" onClick={() => openEditModal(item)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => setDeleteTarget(item)}>
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

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title={deleteTarget?.status === "active" ? "Vô hiệu hóa nhân viên" : "Xóa vĩnh viễn nhân viên"}
        message={
          deleteTarget?.status === "active"
            ? `Nhân viên "${deleteTarget?.fullName || deleteTarget?.name}" phải được vô hiệu hóa trước khi xóa vĩnh viễn. Bạn có muốn vô hiệu hóa nhân viên này ngay bây giờ?`
            : `Bạn có chắc chắn muốn xóa vĩnh viễn nhân viên "${deleteTarget?.fullName || deleteTarget?.name}"? Hành động này sẽ gỡ tài khoản hoàn toàn khỏi cơ sở dữ liệu và không thể hoàn tác.`
        }
        confirmLabel={deleteTarget?.status === "active" ? "Vô hiệu hóa" : "Xóa vĩnh viễn"}
        isLoading={updateStaff.isPending || permanentDeleteStaff.isPending}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Tạo staff mới">
        <form className="space-y-4" onSubmit={(e) => {
          e.preventDefault();
          const { name, ...rest } = formData;
          createStaff.mutate(
            { fullName: name, ...rest, role: "staff" },
            {
              onSuccess: () => {
                setIsOpen(false);
                setFormData(getInitialForm());
              }
            }
          );
        }}>
          {createStaff.error && (
            <div className="text-sm font-semibold text-[#ef4444] bg-[#fee2e2] px-4 py-2.5 rounded-xl border border-[#fca5a5]">
              ⚠️ {createStaff.error?.response?.data?.message || "Tạo staff thất bại. Vui lòng kiểm tra lại."}
            </div>
          )}
          <div><Label required>Họ tên</Label><Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required /></div>
          <div><Label required>Email</Label><Input type="email" value={formData.email} onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))} required /></div>
          <div><Label required>Password</Label><Input type="password" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))} required /></div>
          <div><Label required>Phone</Label><Input value={formData.phone} onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))} required /></div>
          <div>
            <Label required>Role</Label>
            <Select value="staff" options={[{ label: "staff", value: "staff" }]} disabled />
          </div>
          <Button type="submit" isLoading={createStaff.isPending}>Tạo staff</Button>
        </form>
      </Modal>

      <Modal
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          setEditingStaff(null);
          setEditForm(getEditForm());
        }}
        title="Chỉnh sửa staff"
      >
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            if (!editingStaff?.id) return;

            updateStaff.mutate(
              {
                id: editingStaff.id,
                data: {
                  fullName: editForm.fullName,
                  phone: editForm.phone,
                  status: editForm.status,
                },
              },
              {
                onSuccess: () => {
                  setIsEditOpen(false);
                  setEditingStaff(null);
                  setEditForm(getEditForm());
                },
              },
            );
          }}
        >
          <div>
            <Label required>Họ tên</Label>
            <Input
              value={editForm.fullName}
              onChange={(e) => setEditForm((prev) => ({ ...prev, fullName: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label>Phone</Label>
            <Input
              value={editForm.phone}
              onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
            />
          </div>
          <div>
            <Label required>Trạng thái</Label>
            <Select
              value={editForm.status}
              onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
              options={STATUS_OPTIONS}
            />
          </div>
          <Button type="submit" isLoading={updateStaff.isPending}>
            Lưu thay đổi
          </Button>
        </form>
      </Modal>
    </div>
  );
}
