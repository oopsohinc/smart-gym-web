import { useState } from "react";
import { format } from "date-fns";
import { Badge, Card, PageHeader, Pagination } from "@/components/ui";
import { useMemberCheckins } from "@/hooks/use-queries";

const LIMIT = 20;

export default function Checkins() {
  const [currentPage, setCurrentPage] = useState(1);
  const { data: raw, isLoading, isError, isFetching } = useMemberCheckins(currentPage, LIMIT);

  // Support both paginated { data, pagination } and legacy flat array
  const items      = raw?.data ?? raw?.checkins ?? (Array.isArray(raw) ? raw : []);
  const pagination = raw?.pagination ?? null;

  const handlePageChange = (page) => { setCurrentPage(page); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div>
      <PageHeader
        title="Lịch sử check-in"
        description={pagination ? `Tổng cộng ${pagination.totalRecords ?? items.length} lần check-in` : "Phân trang theo trang"}
      />

      {isLoading && <p className="text-[#4a5568]">Đang tải lịch sử check-in...</p>}
      {isError   && <p className="text-[#ef4444]">Không tải được lịch sử check-in.</p>}
      {isFetching && !isLoading && <p className="text-xs text-[#4a5568] mb-2">Đang cập nhật...</p>}

      <Card className="p-0 overflow-hidden">
        {!isLoading && !isError && items.length === 0 && (
          <div className="p-8 text-center text-[#4a5568]">Chưa có lịch sử check-in.</div>
        )}
        {!isLoading && !isError && items.length > 0 && (
          <div>
            {items.map((record, idx) => (
              <div
                key={record._id || record.id || idx}
                className="flex items-center justify-between p-4 border-b border-[#d1d9e6] hover:bg-[#d1d9e6]/40 transition-colors last:border-0"
              >
                <div>
                  <p className="font-semibold text-[#2d3436]">
                    {record.checkinAt
                      ? format(new Date(record.checkinAt), "dd/MM/yyyy HH:mm")
                      : record.createdAt
                      ? format(new Date(record.createdAt), "dd/MM/yyyy HH:mm")
                      : "-"}
                  </p>
                  <p className="text-sm text-[#4a5568]">
                    Nhân viên: {record.staffName || record.staff?.name || "-"}
                  </p>
                </div>
                <Badge variant={record.method === "qr" ? "success" : "default"}>
                  {record.method || "manual"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Pagination meta={pagination} currentPage={currentPage} onPageChange={handlePageChange} />
    </div>
  );
}
