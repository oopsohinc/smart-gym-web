import { useForm } from "react-hook-form";
import { Button, Card, Input, Label, PageHeader } from "@/components/ui";
import { useChangePassword } from "@/hooks/use-queries";

export default function Password() {
  const changePassword = useChangePassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" } });

  const onSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    changePassword.mutate(
      { currentPassword: data.currentPassword, newPassword: data.newPassword },
      { onSuccess: () => reset() },
    );
  };

  return (
    <div className="max-w-xl">
      <PageHeader title="Đổi mật khẩu" />
      <Card>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <Label required>Mật khẩu hiện tại</Label>
            <Input type="password" error={errors.currentPassword?.message} {...register("currentPassword", { required: "Bắt buộc" })} />
          </div>
          <div>
            <Label required>Mật khẩu mới</Label>
            <Input
              type="password"
              error={errors.newPassword?.message}
              {...register("newPassword", {
                required: "Bắt buộc",
                minLength: { value: 6, message: "Tối thiểu 6 ký tự" },
              })}
            />
          </div>
          <div>
            <Label required>Xác nhận mật khẩu mới</Label>
            <Input type="password" error={errors.confirmPassword?.message} {...register("confirmPassword", { required: "Bắt buộc" })} />
          </div>

          <Button type="submit" isLoading={changePassword.isPending}>
            Cập nhật mật khẩu
          </Button>
        </form>
      </Card>
    </div>
  );
}
