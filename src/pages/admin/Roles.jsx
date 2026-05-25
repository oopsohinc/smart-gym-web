import { useState } from "react";
import { Plus, Pencil, Trash2, Shield, Key } from "lucide-react";
import { Badge, Button, Card, ConfirmModal, Input, Label, Modal, PageHeader } from "@/components/ui";
import {
  useAdminRoles,
  useAdminPermissions,
  useAdminCreateRole,
  useAdminUpdateRole,
  useAdminDeleteRole,
} from "@/hooks/use-queries";

const INITIAL_FORM = { name: "", description: "", permissions: [] };

/** Nhóm permissions theo prefix (member.*, staff.*, admin.*) */
function groupPermissions(perms = []) {
  return perms.reduce((acc, p) => {
    const key = String(p.name || p).split(".")[0] || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
}

const GROUP_COLORS = {
  member: "success",
  staff:  "warning",
  admin:  "destructive",
};

export default function AdminRoles() {
  const { data: roles = [], isLoading: loadingRoles } = useAdminRoles();
  const { data: permissions = [] } = useAdminPermissions();
  const createRole = useAdminCreateRole();
  const updateRole = useAdminUpdateRole();
  const deleteRole = useAdminDeleteRole();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const allPermissions = Array.isArray(permissions)
    ? permissions
    : permissions?.data ?? permissions?.permissions ?? [];
  const allRoles = Array.isArray(roles) ? roles : roles?.data ?? roles?.roles ?? [];
  const grouped = groupPermissions(allPermissions);

  const openCreate = () => {
    setEditingId(null);
    setForm(INITIAL_FORM);
    setIsModalOpen(true);
  };

  const openEdit = (role) => {
    setEditingId(role._id || role.id);
    setForm({
      name: role.name || "",
      description: role.description || "",
      permissions: (role.permissions || []).map((p) => p._id || p.id || p),
    });
    setIsModalOpen(true);
  };

  const togglePermission = (permId) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permId)
        ? prev.permissions.filter((id) => id !== permId)
        : [...prev.permissions, permId],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateRole.mutate({ id: editingId, data: form }, { onSuccess: () => setIsModalOpen(false) });
    } else {
      createRole.mutate(form, { onSuccess: () => { setIsModalOpen(false); setForm(INITIAL_FORM); } });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phân quyền"
        description="Quản lý vai trò và quyền hạn trong hệ thống"
        action={
          <Button onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo Role
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Cột Roles — 3/5 */}
        <div className="lg:col-span-3 space-y-4">
          <h2 className="text-base font-bold text-[#2d3436] flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#ff4757]" />
            Roles ({allRoles.length})
          </h2>

          {loadingRoles && <p className="text-[#4a5568]">Đang tải roles...</p>}

          {allRoles.map((role) => (
            <Card key={role._id || role.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-[#2d3436]">{role.name}</h3>
                    <Badge>{(role.permissions || []).length} quyền</Badge>
                  </div>
                  {role.description && (
                    <p className="text-sm text-[#4a5568] mt-1">{role.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(role.permissions || []).slice(0, 5).map((p, i) => (
                      <span
                        key={i}
                        className="inline-block rounded-full px-2 py-0.5 text-xs font-mono bg-[#d1d9e6] text-[#4a5568]"
                      >
                        {p.name || p}
                      </span>
                    ))}
                    {(role.permissions || []).length > 5 && (
                      <span className="text-xs text-[#4a5568]">+{(role.permissions || []).length - 5} more</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="icon" variant="outline" onClick={() => openEdit(role)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="icon" variant="destructive" onClick={() => setDeleteTargetId(role._id || role.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {!loadingRoles && allRoles.length === 0 && (
            <Card className="text-center py-8 text-[#4a5568]">Chưa có role nào.</Card>
          )}
        </div>

        {/* Cột Permissions — 2/5 */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-base font-bold text-[#2d3436] flex items-center gap-2">
            <Key className="h-4 w-4 text-[#ff4757]" />
            Permissions ({allPermissions.length})
          </h2>

          {Object.entries(grouped).map(([group, perms]) => (
            <Card key={group} className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant={GROUP_COLORS[group] || "default"}>{group}</Badge>
                <span className="text-xs text-[#4a5568]">{perms.length} quyền</span>
              </div>
              <div className="space-y-1.5">
                {perms.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#ff4757] shrink-0" />
                    <span className="font-mono text-xs text-[#4a5568]">{p.name || p}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={() =>
          deleteRole.mutate(deleteTargetId, {
            onSuccess: () => setDeleteTargetId(null),
            onError:   () => setDeleteTargetId(null),
          })
        }
        title="Xóa Role"
        message="Xóa role sẽ ảnh hưởng đến tất cả người dùng đang được gán role này."
        confirmLabel="Xóa"
        isLoading={deleteRole.isPending}
      />

      {/* Create/Edit modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Sửa Role" : "Tạo Role mới"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label required>Tên Role</Label>
            <Input
              placeholder="VD: trainer"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label>Mô tả</Label>
            <Input
              placeholder="Mô tả vai trò"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>
          <div>
            <Label>Permissions</Label>
            <div
              className="max-h-52 overflow-y-auto rounded-xl p-3 space-y-1"
              style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
            >
              {allPermissions.length === 0 && (
                <p className="text-xs text-[#4a5568]">Không có permissions.</p>
              )}
              {Object.entries(grouped).map(([group, perms]) => (
                <div key={group} className="mb-3">
                  <p className="text-xs font-bold text-[#2d3436] uppercase tracking-wider mb-1">{group}</p>
                  {perms.map((p) => {
                    const id = p._id || p.id || p;
                    const checked = form.permissions.includes(id);
                    return (
                      <label key={id} className="flex items-center gap-2 py-1 cursor-pointer hover:text-[#ff4757] transition-colors">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => togglePermission(id)}
                          className="accent-[#ff4757]"
                        />
                        <span className="font-mono text-xs text-[#4a5568]">{p.name || p}</span>
                      </label>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" className="w-full" isLoading={createRole.isPending || updateRole.isPending}>
            {editingId ? "Lưu thay đổi" : "Tạo Role"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
