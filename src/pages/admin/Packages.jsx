import { useEffect, useState } from "react";
import { Edit2, Plus, Trash2 } from "lucide-react";
import { Button, Card, ConfirmModal, Input, Label, Modal, PageHeader, Pagination, SearchFilterBar } from "@/components/ui";
import { formatCurrency } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";
import {
  useAdminCreatePackage,
  useAdminDeletePackage,
  useAdminPermanentDeletePackage,
  useAdminPackages,
  useAdminUpdatePackage,
} from "@/hooks/use-queries";

const INITIAL_FORM = { name: "", description: "", price: 0, durationDays: 30, isActive: true };
const LIMIT = 10;

export default function AdminPackages() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]   = useState("");
  const [isOpen, setIsOpen]   = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [formData, setFormData]       = useState(INITIAL_FORM);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  // UX: reset page khi search thay đổi
  useEffect(() => { setCurrentPage(1); }, [search]);

  const { data: raw, isLoading, isError, isFetching } = useAdminPackages({
    page: currentPage, limit: LIMIT, q: search,
  });

  const packages   = raw?.data ?? (Array.isArray(raw) ? raw : []);
  const pagination = raw?.pagination ?? null;

  const createPackage = useAdminCreatePackage();
  const updatePackage = useAdminUpdatePackage();
  const deletePackage = useAdminDeletePackage();
  const permanentDeletePackage = useAdminPermanentDeletePackage();

  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const onOpenCreate = () => {
    createPackage.reset();
    updatePackage.reset();
    setEditingId(null);
    setFormData(INITIAL_FORM);
    setIsOpen(true);
  };
  const onOpenEdit = (pkg) => {
    createPackage.reset();
    updatePackage.reset();
    setEditingId(pkg.id);
    setFormData({ name: pkg.name, description: pkg.description || "", price: pkg.price, durationDays: pkg.durationDays, isActive: pkg.isActive });
    setIsOpen(true);
  };
  const onSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updatePackage.mutate({ id: editingId, data: formData }, { onSuccess: () => setIsOpen(false) });
    } else {
      createPackage.mutate(formData, { onSuccess: () => setIsOpen(false) });
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTargetId) return;
    permanentDeletePackage.mutate(deleteTargetId, {
      onSuccess: () => {
        setDeleteTargetId(null);
        toast({
          title: "Thành công",
          description: "Đã xóa gói tập vĩnh viễn thành công.",
        });
      },
      onError: (err) => {
        setDeleteTargetId(null);
        toast({
          title: "Lỗi xóa gói tập",
          description: err?.response?.data?.message || "Không thể xóa gói tập vì đã có dữ liệu liên kết.",
          variant: "destructive",
        });
      },
    });
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="Quản lý gói tập"
        description={pagination ? `Tổng cộng ${pagination.total ?? packages.length} gói tập` : undefined}
        action={<Button onClick={onOpenCreate}><Plus className="h-4 w-4 mr-2" />Thêm gói</Button>}
      />

      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên gói..."
        onClear={() => setSearch("")}
      />

      {isLoading && <p className="text-[#4a5568]">Đang tải danh sách gói...</p>}
      {isError   && <p className="text-[#ef4444]">Không tải được danh sách gói.</p>}
      {isFetching && !isLoading && <p className="text-xs text-[#4a5568]">Đang cập nhật...</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="h-full p-4 sm:p-6 flex flex-col">
            <h3 className="text-lg font-bold text-[#2d3436] sm:text-xl">{pkg.name}</h3>
            <p className="text-sm text-[#4a5568] mt-1 flex-1">{pkg.description || "Không có mô tả"}</p>
            <p className="text-[#ff4757] font-bold text-xl mt-3 sm:text-2xl">{formatCurrency(pkg.price)}</p>
            <p className="text-sm text-[#4a5568]">{pkg.durationDays} ngày</p>
            <div className="mt-4 flex gap-2">
              <Button size="icon" variant="outline" onClick={() => onOpenEdit(pkg)}><Edit2 className="h-4 w-4" /></Button>
              <Button size="icon" variant="destructive" onClick={() => setDeleteTargetId(pkg.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}
        {!isLoading && !isError && packages.length === 0 && (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <p className="text-[#4a5568]">Không tìm thấy gói tập nào{search ? ` với từ khóa "${search}"` : ""}.</p>
            </Card>
          </div>
        )}
      </div>

      <Pagination meta={pagination} currentPage={currentPage} onPageChange={handlePageChange} />

      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Xóa gói tập"
        message="Bạn có chắc chắn muốn xóa vĩnh viễn gói tập này khỏi hệ thống?"
        confirmLabel="Xóa"
        isLoading={permanentDeletePackage.isPending}
      />

      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editingId ? "Sửa gói tập" : "Thêm gói tập"}>
        <form className="space-y-4" onSubmit={onSubmit}>
          {(createPackage.error || updatePackage.error) && (
            <div className="text-sm font-semibold text-[#ef4444] bg-[#fee2e2] px-4 py-2.5 rounded-xl border border-[#fca5a5]">
              ⚠️ {createPackage.error?.response?.data?.message || updatePackage.error?.response?.data?.message || "Đã xảy ra lỗi khi lưu gói tập."}
            </div>
          )}
          <div><Label required>Tên gói</Label><Input value={formData.name} onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))} required /></div>
          <div><Label>Mô tả</Label><Input value={formData.description} onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))} /></div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div><Label required>Giá</Label><Input type="number" value={formData.price} onChange={(e) => setFormData((p) => ({ ...p, price: Number(e.target.value) }))} required /></div>
            <div><Label required>Số ngày</Label><Input type="number" value={formData.durationDays} onChange={(e) => setFormData((p) => ({ ...p, durationDays: Number(e.target.value) }))} required /></div>
          </div>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={formData.isActive} onChange={(e) => setFormData((p) => ({ ...p, isActive: e.target.checked }))} className="accent-[#ff4757]" />
            Đang active
          </label>
          <Button type="submit" isLoading={createPackage.isPending || updatePackage.isPending}>Lưu</Button>
        </form>
      </Modal>
    </div>
  );
}
