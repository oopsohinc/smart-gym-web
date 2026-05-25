import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Button, Card, Input, Label, PageHeader } from "@/components/ui";
import { useProfile, useUpdateProfile } from "@/hooks/use-queries";

export default function Profile() {
  const { data: profile, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();
  const [formData, setFormData] = useState({ name: "", phone: "", address: "", dateOfBirth: "" });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        address: profile.address || "",
        dateOfBirth: profile.dateOfBirth ? format(new Date(profile.dateOfBirth), "yyyy-MM-dd") : "",
      });
    }
  }, [profile]);

  if (isLoading) return <p className="text-muted-foreground">Đang tải hồ sơ...</p>;
  if (isError) return <p className="text-destructive">Không thể tải hồ sơ.</p>;

  return (
    <div>
      <PageHeader title="Hồ sơ" description="Cập nhật thông tin cá nhân" />
      <Card>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            updateProfile.mutate(formData);
          }}
        >
          <div>
            <Label required>Họ tên</Label>
            <Input value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div>
            <Label>Số điện thoại</Label>
            <Input value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} />
          </div>
          <div>
            <Label>Địa chỉ</Label>
            <Input value={formData.address} onChange={(e) => setFormData((prev) => ({ ...prev, address: e.target.value }))} />
          </div>
          <div>
            <Label>Ngày sinh</Label>
            <Input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData((prev) => ({ ...prev, dateOfBirth: e.target.value }))} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={profile?.email || ""} disabled />
          </div>

          <Button type="submit" isLoading={updateProfile.isPending}>
            Lưu thay đổi
          </Button>
        </form>
      </Card>
    </div>
  );
}
