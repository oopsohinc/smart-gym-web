import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, Shield, Key, Users, Search, SlidersHorizontal } from "lucide-react";
import { Badge, Button, Card, ConfirmModal, Input, Label, Modal, PageHeader, Pagination, SearchFilterBar } from "@/components/ui";
import {
  useAdminRoles,
  useAdminPermissions,
  useAdminCreateRole,
  useAdminUpdateRole,
  useAdminDeleteRole,
  useAdminUsers,
} from "@/hooks/use-queries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INITIAL_ROLE_FORM = { name: "", description: "", permissions: [] };

function groupPermissions(perms = []) {
  return perms.reduce((acc, p) => {
    const key = String(p.name || p).split(".")[0] || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {});
}

const GROUP_COLORS = { member: "success", staff: "warning", admin: "destructive" };
const ROLE_BADGE   = { admin: "destructive", staff: "warning", member: "success" };

function getRoleColor(roleName = "") {
  return ROLE_BADGE[roleName.toLowerCase()] || "default";
}

// ─── Modal chỉnh quyền của một Role ──────────────────────────────────────────

function EditRolePermissionsModal({ role, allPermissions, grouped, onClose }) {
  const updateRole = useAdminUpdateRole();

  const [selectedPerms, setSelectedPerms] = useState(() =>
    (role?.permissions || []).map((p) => p._id || p.id || p)
  );

  // Đồng bộ khi role thay đổi
  useEffect(() => {
    setSelectedPerms((role?.permissions || []).map((p) => p._id || p.id || p));
  }, [role]);

  const toggle = (permId) =>
    setSelectedPerms((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );

  const handleSave = (e) => {
    e.preventDefault();
    const roleId = role._id || role.id;
    updateRole.mutate(
      { id: roleId, data: { name: role.name, description: role.description, permissions: selectedPerms } },
      { onSuccess: () => onClose() }
    );
  };

  // Chỉ hiện nhóm permissions khớp với tên role (staff → staff.*, member → member.*, ...)
  // Nếu không tìm thấy nhóm phù hợp thì hiện tất cả
  const rolePrefix   = (role?.name || "").toLowerCase();
  const filteredGrouped = Object.entries(grouped).filter(([group]) =>
    group.toLowerCase() === rolePrefix
  );
  const displayGrouped = filteredGrouped.length > 0 ? filteredGrouped : Object.entries(grouped);

  // Chỉ đếm permissions trong nhóm đang hiển thị
  const visiblePerms = displayGrouped.flatMap(([, perms]) => perms);
  const totalSelected = visiblePerms.filter((p) => selectedPerms.includes(p._id || p.id || p)).length;
  const totalAll      = visiblePerms.length;

  return (
    <Modal isOpen={!!role} onClose={onClose} title={`Chỉnh quyền: ${role?.name || ""}`}>
      <form onSubmit={handleSave} className="space-y-4">
        {/* Summary badge */}
        <div className="flex items-center gap-2 rounded-xl px-4 py-3"
          style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
          <Shield className="h-4 w-4 text-[#ff4757] shrink-0" />
          <p className="text-sm text-[#2d3436]">
            Đang chọn <strong className="text-[#ff4757]">{totalSelected}</strong> / {totalAll} quyền hạn
          </p>
        </div>

        {/* Permission list grouped */}
        <div
          className="max-h-[55vh] overflow-y-auto rounded-xl p-3 space-y-4"
          style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
        >
          {visiblePerms.length === 0 && (
            <p className="text-xs text-[#4a5568]">Không có quyền hạn nào cho vai trò "{role?.name}".</p>
          )}
          {displayGrouped.map(([group, perms]) => {
            const groupSelected = perms.filter((p) => selectedPerms.includes(p._id || p.id || p)).length;
            return (
              <div key={group}>
                {/* Group header với toggle all */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Badge variant={GROUP_COLORS[group] || "default"}>{group}</Badge>
                    <span className="text-xs text-[#4a5568]">{groupSelected}/{perms.length}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const allIds = perms.map((p) => p._id || p.id || p);
                      const allChecked = allIds.every((id) => selectedPerms.includes(id));
                      setSelectedPerms((prev) =>
                        allChecked
                          ? prev.filter((id) => !allIds.includes(id))
                          : [...new Set([...prev, ...allIds])]
                      );
                    }}
                    className="text-xs text-[#4a5568] hover:text-[#ff4757] transition-colors underline"
                  >
                    {perms.every((p) => selectedPerms.includes(p._id || p.id || p))
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </button>
                </div>

                {/* Permissions */}
                <div className="space-y-1 pl-1">
                  {perms.map((p) => {
                    const id = p._id || p.id || p;
                    const checked = selectedPerms.includes(id);
                    return (
                      <label
                        key={id}
                        className="flex items-center gap-2.5 py-1 cursor-pointer group"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggle(id)}
                          className="accent-[#ff4757] w-4 h-4 shrink-0"
                        />
                        <span className={`font-mono text-xs transition-colors ${checked ? "text-[#2d3436] font-semibold" : "text-[#4a5568]"} group-hover:text-[#ff4757]`}>
                          {p.name || p}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        <Button
          type="submit"
          className="w-full"
          isLoading={updateRole.isPending}
        >
          Lưu quyền hạn
        </Button>
      </form>
    </Modal>
  );
}

// ─── Tab: Người dùng ──────────────────────────────────────────────────────────

const LIMIT = 15;

function UsersTab({ allRoles, allPermissions, grouped }) {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState("");
  const [roleId, setRoleId] = useState("");
  const [editingRole, setEditingRole] = useState(null); // role object đang chỉnh

  useEffect(() => {
    setPage(1);
  }, [search, roleId]);

  const { data: raw, isLoading, isError, isFetching } = useAdminUsers({
    page,
    limit: LIMIT,
    q: search,
    roleId,
  });

  const users      = raw?.data ?? [];
  const pagination = raw?.pagination ?? null;

  // Khi click "Chỉnh quyền": tìm role object đầy đủ từ allRoles
  const openEditRole = (user) => {
    const roleName = user.role?.name || user.roleName || (typeof user.role === "string" ? user.role : "");
    const roleId   = user.role?._id || user.role?.id || "";

    // Tìm role đầy đủ (có permissions) từ danh sách
    const found = allRoles.find(
      (r) => (r._id || r.id) === roleId || r.name === roleName
    );
    if (found) {
      setEditingRole(found);
    }
  };

  const roleOptions = allRoles.map((r) => ({
    label: r.name,
    value: r._id || r.id,
  }));

  const handleClear = () => {
    setSearch("");
    setRoleId("");
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <SearchFilterBar
        search={search}
        onSearch={setSearch}
        placeholder="Tìm theo tên, email, số điện thoại..."
        filters={[
          {
            key: "roleId",
            label: "Vai trò",
            value: roleId,
            onChange: setRoleId,
            options: roleOptions,
            type: "select",
          },
        ]}
        onClear={handleClear}
      />

      {/* States */}
      {isLoading && <p className="text-sm text-[#4a5568]">Đang tải danh sách người dùng...</p>}
      {isError && (
        <div className="rounded-xl p-4 bg-[#ef4444]/10 border border-[#ef4444]/20">
          <p className="text-sm text-[#ef4444]">
            Không tải được danh sách người dùng. Hãy kiểm tra API <code>/admin/users</code>.
          </p>
        </div>
      )}
      {isFetching && !isLoading && <p className="text-xs text-[#4a5568]">Đang cập nhật...</p>}

      {/* Mobile cards */}
      <div className="space-y-4 sm:hidden">
        {users.map((user) => {
          const roleName = user.role?.name || user.roleName || (typeof user.role === "string" ? user.role : "-");
          const hasRole = roleName !== "-";
          const roleId = user.role?._id || user.role?.id || "";
          const roleObj = allRoles.find((r) => (r._id || r.id) === roleId || r.name === roleName);

          return (
            <Card key={user._id || user.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-[#2d3436]">{user.name || user.fullName || "-"}</p>
                  <p className="truncate text-sm text-[#4a5568]">{user.email || "-"}</p>
                </div>
                {hasRole ? (
                  <Badge variant={getRoleColor(roleName)}>{roleName}</Badge>
                ) : (
                  <span className="text-xs text-[#babecc]">Chưa có</span>
                )}
              </div>
              <div className="mt-3 flex justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-9 px-3 text-xs gap-1.5"
                  disabled={!roleObj}
                  title={!roleObj ? "Không tìm thấy thông tin vai trò" : ""}
                  onClick={() => roleObj && setEditingRole(roleObj)}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  Chỉnh quyền
                </Button>
              </div>
            </Card>
          );
        })}
        {!isLoading && !isError && users.length === 0 && (
          <p className="text-center text-[#4a5568] py-8">Không tìm thấy người dùng nào.</p>
        )}
      </div>

      {/* Desktop table */}
      <Card className="hidden p-0 overflow-x-auto sm:block">
        {!isLoading && !isError && (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="text-xs uppercase tracking-wider text-[#4a5568]"
              style={{ background: "rgba(209,217,230,0.6)", borderBottom: "1px solid #babecc" }}>
              <tr>
                <th className="p-4">Người dùng</th>
                <th className="p-4">Email</th>
                <th className="p-4 text-center">Vai trò hiện tại</th>
                <th className="p-4 text-center">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const roleName = user.role?.name || user.roleName || (typeof user.role === "string" ? user.role : "-");
                const hasRole = roleName !== "-";
                const roleId = user.role?._id || user.role?.id || "";
                const roleObj = allRoles.find((r) => (r._id || r.id) === roleId || r.name === roleName);

                return (
                  <tr key={user._id || user.id} className="border-b border-[#d1d9e6] hover:bg-[#d1d9e6]/40 transition-colors">
                    <td className="p-4 font-semibold text-[#2d3436]">{user.name || user.fullName || "-"}</td>
                    <td className="p-4 text-[#4a5568]">{user.email || "-"}</td>
                    <td className="p-4 text-center">
                      {hasRole ? (
                        <Badge variant={getRoleColor(roleName)}>{roleName}</Badge>
                      ) : (
                        <span className="text-xs text-[#babecc]">Chưa có</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 px-3 text-xs gap-1.5"
                          disabled={!roleObj}
                          title={!roleObj ? "Không tìm thấy thông tin vai trò" : ""}
                          onClick={() => roleObj && setEditingRole(roleObj)}
                        >
                          <SlidersHorizontal className="h-3.5 w-3.5" />
                          Chỉnh quyền
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr>
                  <td className="p-8 text-center text-[#4a5568]" colSpan={4}>
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </Card>

      {/* Pagination */}
      {pagination && (
        <Pagination
          meta={pagination}
          currentPage={page}
          onPageChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); }}
        />
      )}

      {/* Modal chỉnh quyền */}
      {editingRole && (
        <EditRolePermissionsModal
          role={editingRole}
          allPermissions={allPermissions}
          grouped={grouped}
          onClose={() => setEditingRole(null)}
        />
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminRoles() {
  const { data: roles = [] } = useAdminRoles();
  const { data: permissions = [] } = useAdminPermissions();

  const allPermissions = Array.isArray(permissions)
    ? permissions
    : permissions?.data ?? permissions?.permissions ?? [];
  const allRoles = Array.isArray(roles) ? roles : roles?.data ?? roles?.roles ?? [];
  const grouped = groupPermissions(allPermissions);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Phân quyền người dùng"
        description="Xem danh sách tài khoản người dùng và điều chỉnh quyền hạn theo vai trò"
      />

      <UsersTab allRoles={allRoles} allPermissions={allPermissions} grouped={grouped} />
    </div>
  );
}
