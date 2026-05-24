import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, BookOpen, Eye } from "lucide-react";
import { format } from "date-fns";
import { Button, Card, ConfirmModal, Input, Label, Modal, PageHeader, Pagination, SearchFilterBar } from "@/components/ui";
import {
  useAdminKnowledgeBases,
  useAdminKnowledgeBaseDetail,
  useAdminCreateKnowledgeBase,
  useAdminUpdateKnowledgeBase,
  useAdminDeleteKnowledgeBase,
} from "@/hooks/use-queries";

const INITIAL_FORM = { title: "", content: "", tags: "" };
const LIMIT = 12; // grid 3 cols × 4 rows

function DetailModal({ id, onClose }) {
  const { data, isLoading } = useAdminKnowledgeBaseDetail(id);
  return (
    <Modal isOpen={!!id} onClose={onClose} title="Nội dung tài liệu">
      {isLoading ? <p className="text-[#4a5568]">Đang tải...</p> : (
        <div className="space-y-3">
          <h3 className="font-bold text-lg text-[#2d3436]">{data?.title}</h3>
          {(data?.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.tags.map((t, i) => (
                <span key={i} className="rounded-full bg-[#d1d9e6] px-2 py-0.5 text-xs text-[#4a5568] font-mono">#{t}</span>
              ))}
            </div>
          )}
          <div className="rounded-xl p-4 text-sm text-[#2d3436] whitespace-pre-wrap max-h-80 overflow-y-auto leading-relaxed"
            style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
            {data?.content || "Không có nội dung."}
          </div>
          {data?.createdAt && (
            <p className="text-xs text-[#4a5568]">Tạo lúc: {format(new Date(data.createdAt), "dd/MM/yyyy HH:mm")}</p>
          )}
        </div>
      )}
    </Modal>
  );
}

export default function KnowledgeBases() {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch]   = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId]     = useState(null);
  const [viewingId, setViewingId]     = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [form, setForm]               = useState(INITIAL_FORM);

  // UX: reset page khi search thay đổi
  useEffect(() => { setCurrentPage(1); }, [search]);

  const { data: raw, isLoading, isError, isFetching } = useAdminKnowledgeBases({
    page: currentPage, limit: LIMIT, q: search,
  });

  const createKB = useAdminCreateKnowledgeBase();
  const updateKB = useAdminUpdateKnowledgeBase();
  const deleteKB = useAdminDeleteKnowledgeBase();

  const items      = raw?.data ?? (Array.isArray(raw) ? raw : []);
  const pagination = raw?.pagination ?? null;

  const getId = (item) => item._id || item.id;
  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const openCreate = () => { setEditingId(null); setForm(INITIAL_FORM); setIsModalOpen(true); };
  const openEdit = (item) => {
    setEditingId(getId(item));
    setForm({ title: item.title || "", content: item.content || "", tags: (item.tags || []).join(", ") });
    setIsModalOpen(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { ...form, tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean) };
    if (editingId) {
      updateKB.mutate({ id: editingId, data: payload }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createKB.mutate(payload, { onSuccess: () => { setIsModalOpen(false); setForm(INITIAL_FORM); } });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Knowledge Base" description="Tài liệu đào tạo AI assistant"
        action={<Button onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Thêm tài liệu</Button>} />

      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tiêu đề tài liệu..."
        onClear={() => setSearch("")}
      />

      {isLoading && <p className="text-[#4a5568]">Đang tải...</p>}
      {isError   && <p className="text-[#ef4444]">Không tải được knowledge base.</p>}
      {isFetching && !isLoading && <p className="text-xs text-[#4a5568]">Đang cập nhật...</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Card key={getId(item)} className="flex flex-col gap-3">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-[#ff4757]">
                <BookOpen className="h-4 w-4 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-[#2d3436] line-clamp-2">{item.title || "Không có tiêu đề"}</h3>
                {item.createdAt && <p className="text-xs text-[#4a5568] mt-0.5">{format(new Date(item.createdAt), "dd/MM/yyyy")}</p>}
              </div>
            </div>
            <p className="text-sm text-[#4a5568] line-clamp-3">{item.content || "Không có nội dung."}</p>
            {(item.tags || []).length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.tags.slice(0, 4).map((tag, i) => (
                  <span key={i} className="rounded-full bg-[#d1d9e6] px-2 py-0.5 text-xs font-mono text-[#4a5568]">#{tag}</span>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-1 mt-auto">
              <Button variant="outline" size="sm" className="flex-1" onClick={() => setViewingId(getId(item))}>
                <Eye className="mr-1.5 h-3.5 w-3.5" />Xem
              </Button>
              <Button size="icon" variant="secondary" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
              <Button size="icon" variant="destructive" onClick={() => setDeleteTargetId(getId(item))}><Trash2 className="h-4 w-4" /></Button>
            </div>
          </Card>
        ))}
        {!isLoading && !isError && items.length === 0 && (
          <div className="col-span-full">
            <Card className="text-center py-12">
              <BookOpen className="h-10 w-10 text-[#babecc] mx-auto mb-3" />
              <p className="text-[#4a5568]">
                {search ? `Không tìm thấy tài liệu nào với từ khóa "${search}".` : "Chưa có tài liệu nào."}
              </p>
              {!search && <Button className="mt-4" onClick={openCreate}><Plus className="mr-2 h-4 w-4" />Thêm ngay</Button>}
            </Card>
          </div>
        )}
      </div>

      <Pagination meta={pagination} currentPage={currentPage} onPageChange={handlePageChange} />

      <DetailModal id={viewingId} onClose={() => setViewingId(null)} />

      <ConfirmModal isOpen={!!deleteTargetId} onClose={() => setDeleteTargetId(null)}
        onConfirm={() => deleteKB.mutate(deleteTargetId, { onSuccess: () => setDeleteTargetId(null), onError: () => setDeleteTargetId(null) })}
        title="Xóa tài liệu" message="Tài liệu sẽ bị xóa khỏi Knowledge Base." confirmLabel="Xóa" isLoading={deleteKB.isPending} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Sửa tài liệu" : "Thêm tài liệu mới"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><Label required>Tiêu đề</Label><Input placeholder="VD: Quy trình check-in" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required /></div>
          <div>
            <Label required>Nội dung</Label>
            <textarea rows={6} placeholder="Nhập nội dung chi tiết..." value={form.content}
              onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))} required
              className="w-full rounded-xl px-4 py-3 text-sm text-[#2d3436] resize-none outline-none placeholder:text-[#a0aec0]"
              style={{ background: "#e0e5ec", boxShadow: "inset 4px 4px 8px #babecc, inset -4px -4px 8px #ffffff" }} />
          </div>
          <div><Label>Tags (cách nhau bởi dấu phẩy)</Label><Input placeholder="check-in, quy-trình" value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} /></div>
          <Button type="submit" className="w-full" isLoading={createKB.isPending || updateKB.isPending}>{editingId ? "Lưu" : "Thêm tài liệu"}</Button>
        </form>
      </Modal>
    </div>
  );
}
