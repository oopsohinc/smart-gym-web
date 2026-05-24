/**
 * use-rag-queries.js
 * RAG (Retrieval-Augmented Generation) — AI Assistant hooks
 *
 * Endpoints:
 *   POST /api/rag/ask         — Public, không cần auth
 *   POST /api/rag/knowledge   — Cần auth (admin/staff thêm kiến thức vào KB)
 */
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

/**
 * useAskAssistant
 * POST /api/rag/ask
 * Gửi câu hỏi tới AI assistant, nhận câu trả lời từ Knowledge Base.
 * Auth: không bắt buộc (public endpoint)
 *
 * mutationFn payload: { question: string, context?: string }
 * response: { answer: string, sources?: string[] }
 */
export const useAskAssistant = () =>
  useMutation({
    mutationFn: async (payload) => (await api.post("/rag/ask", payload)).data,
  });

/**
 * useAddKnowledge
 * POST /api/rag/knowledge
 * Thêm tài liệu / kiến thức vào hệ thống RAG.
 * Auth: bắt buộc
 *
 * mutationFn payload: { content: string, title?: string, tags?: string[] }
 */
export const useAddKnowledge = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => (await api.post("/rag/knowledge", payload)).data,
    onSuccess: () => {
      // Invalidate knowledge base lists nếu admin đang xem
      queryClient.invalidateQueries({ queryKey: ["/admin/knowledge-bases"] });
    },
  });
};
