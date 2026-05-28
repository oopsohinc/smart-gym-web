/**
 * @file use-queries.js — Barrel re-export (Backward Compatibility)
 *
 * File này giữ lại để tất cả import cũ `from "@/hooks/use-queries"` vẫn hoạt động.
 * Logic thực sự đã được tách theo domain:
 *
 *   Member:  @/hooks/member/use-member-queries.js
 *   Staff:   @/hooks/staff/use-staff-queries.js
 *   Admin:   @/hooks/admin/use-admin-queries.js
 *   Shared:  @/hooks/shared/use-packages.js
 *   RAG:     @/hooks/rag/use-rag-queries.js
 *
 * Khi refactor tiếp, import thẳng vào domain file và xóa file này.
 */

// ─── Shared ───────────────────────────────────────────────────────────────────
export { usePackages } from "@/hooks/shared/use-packages";

// ─── Member ───────────────────────────────────────────────────────────────────
export {
  useProfile,
  useSubscription,
  useActivateSubscription,
  useQrCode,
  useMemberCheckins,
  useUpdateProfile,
  useChangePassword,
  useCreateOrder,
  // Workout Plans
  useWorkoutPlans,
  useActiveWorkoutPlan,
  useCreateWorkoutPlan,
  useActivateWorkoutPlan,
  useGenerateWorkoutPlan,
} from "@/hooks/member/use-member-queries";

// ─── Staff ────────────────────────────────────────────────────────────────────
export {
  useStaffPendingOrders,
  useStaffMembers,
  useStaffApproveOrder,
  useStaffRejectOrder,
  useManualCheckin,
  useQrCheckin,
  useCounterSale,
} from "@/hooks/staff/use-staff-queries";

// ─── Admin ────────────────────────────────────────────────────────────────────
export {
  // Dashboard analytics
  useAdminRevenue,
  useAdminCheckins,
  // Staff
  useAdminStaff,
  useAdminCreateStaff,
  useAdminUpdateStaff,
  useAdminDeleteStaff,
  useAdminPermanentDeleteStaff,
  // Packages
  useAdminPackages,
  useAdminCreatePackage,
  useAdminUpdatePackage,
  useAdminDeletePackage,
  useAdminPermanentDeletePackage,
  // Orders
  useAdminOrders,
  useAdminVoidOrder,
  // Members & Invoices
  useAdminMembers,
  useAdminInvoices,
  // Roles & Permissions
  useAdminRoles,
  useAdminCreateRole,
  useAdminUpdateRole,
  useAdminDeleteRole,
  useAdminPermissions,
  // Users & Role assignment
  useAdminUsers,
  useAdminUpdateUserRole,
  // Knowledge Base
  useAdminKnowledgeBases,
  useAdminKnowledgeBaseDetail,
  useAdminCreateKnowledgeBase,
  useAdminUpdateKnowledgeBase,
  useAdminDeleteKnowledgeBase,
  // Payment
  useCreateVnpayPayment,
  useCreateCashPayment,
} from "@/hooks/admin/use-admin-queries";

// ─── RAG / AI Assistant ───────────────────────────────────────────────────────
export {
  useAskAssistant,
  useAddKnowledge,
} from "@/hooks/rag/use-rag-queries";
