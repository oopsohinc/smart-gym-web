import { Link } from "react-router-dom";
import { Button, Card } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full text-center">
        <h1 className="text-2xl font-bold">404 - Không tìm thấy trang</h1>
        <p className="text-muted-foreground mt-2 mb-6">Vui lòng kiểm tra lại đường dẫn.</p>
        <Link to="/">
          <Button className="w-full">Về trang gói tập</Button>
        </Link>
      </Card>
    </div>
  );
}
