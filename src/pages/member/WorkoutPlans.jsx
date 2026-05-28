import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Activity,
  CalendarDays,
  ChevronRight,
  Dumbbell,
  Loader2,
  Ruler,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";
import { Badge, Button, Card, Input, PageHeader, Select } from "@/components/ui";
import { useActiveWorkoutPlan, useGenerateWorkoutPlan, useProfile, useUpdateProfile } from "@/hooks/use-queries";

const GOAL_OPTIONS = [
  { label: "Giảm cân", value: "weight_loss" },
  { label: "Tăng cơ", value: "muscle_gain" },
  { label: "Duy trì", value: "maintenance" },
];

const LEVEL_OPTIONS = [
  { label: "Cơ bản", value: "beginner" },
  { label: "Trung cấp", value: "intermediate" },
  { label: "Nâng cao", value: "advanced" },
];

function toNumber(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function calculateBmi(heightCm, weightKg) {
  const height = toNumber(heightCm);
  const weight = toNumber(weightKg);

  if (!height || !weight || height <= 0 || weight <= 0) return null;

  const heightMeter = height / 100;
  return Number((weight / (heightMeter * heightMeter)).toFixed(1));
}

function getInitialForm(profile) {
  const healthProfile = profile?.healthProfile || {};

  return {
    height: healthProfile.height ?? profile?.height ?? "",
    weight: healthProfile.weight ?? profile?.weight ?? "",
    fitnessGoal: profile?.fitnessGoal ?? "",
    fitnessLevel: profile?.fitnessLevel ?? "",
  };
}

function getPlanDays(plan) {
  if (!plan) return [];

  if (Array.isArray(plan.planData) && plan.planData.length > 0) {
    return plan.planData;
  }

  if (Array.isArray(plan.exercises) && plan.exercises.length > 0) {
    return [
      {
        day: "Workout plan",
        focus: plan.goal || plan.name || "General training",
        notes: plan.description || "",
        exercises: plan.exercises,
      },
    ];
  }

  return [];
}

function BmiBadge({ bmi }) {
  if (!bmi) return <Badge variant="default">Chưa có BMI</Badge>;

  let variant = "success";
  if (bmi >= 25) variant = "warning";
  if (bmi >= 30) variant = "destructive";

  return <Badge variant={variant}>BMI {bmi}</Badge>;
}

function DayCard({ day, index }) {
  return (
    <Card className="p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a5568]">
            <CalendarDays className="mr-1 inline-block h-3.5 w-3.5 align-[-2px]" />
            Ngày {index + 1}
          </p>
          <h3 className="mt-1 text-lg font-bold text-[#2d3436]">{day.day || `Ngày ${index + 1}`}</h3>
          {day.focus && <p className="mt-1 text-sm text-[#4a5568]">Mục tiêu: {day.focus}</p>}
        </div>
        <ChevronRight className="mt-1 h-4 w-4 text-[#babecc]" />
      </div>

      {day.notes && <p className="mb-4 text-sm text-[#4a5568]">{day.notes}</p>}

      <div className="space-y-3">
        {(day.exercises || []).map((exercise, exerciseIndex) => (
          <div
            key={`${day.day || index}-${exerciseIndex}`}
            className="rounded-xl px-4 py-3"
            style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-[#2d3436]">{exercise.name || `Exercise ${exerciseIndex + 1}`}</p>
                {exercise.notes && <p className="mt-1 text-xs text-[#4a5568]">{exercise.notes}</p>}
              </div>
              <Badge variant="default">{exercise.sets || 0} x {exercise.reps ?? "-"}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm text-[#4a5568]">
              <div>
                <p className="text-xs uppercase tracking-wide">Hiếp</p>
                <p className="font-semibold text-[#2d3436]">{exercise.sets ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Nhắc lại</p>
                <p className="font-semibold text-[#2d3436]">{exercise.reps ?? "-"}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide">Nghỉ</p>
                <p className="font-semibold text-[#2d3436]">{exercise.restSec ?? exercise.rest ?? "-"}s</p>
              </div>
            </div>
          </div>
        ))}
        {(day.exercises || []).length === 0 && (
          <p className="text-sm text-[#4a5568]">Không có bài tập trong ngày này.</p>
        )}
      </div>
    </Card>
  );
}

function ActivePlanSection() {
  const { data: plan, isLoading, isError } = useActiveWorkoutPlan();
  const activeDays = getPlanDays(plan);

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-[#4a5568]">
          <Loader2 className="h-4 w-4 animate-spin text-[#ff4757]" />
          <span>Đang tải kế hoạch hiện tại...</span>
        </div>
      </Card>
    );
  }

  if (isError || !plan?.id) {
    return (
      <Card className="p-6 text-center">
        <Dumbbell className="mx-auto h-10 w-10 text-[#babecc]" />
        <h3 className="mt-3 text-lg font-bold text-[#2d3436]">Chưa có kế hoạch tập</h3>
        <p className="mt-2 text-sm text-[#4a5568]">
          Hãy hoàn tất hồ sơ sức khỏe và bấm Tạo kế hoạch AI để tạo lịch tập cá nhân.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden p-0">
        <div className="bg-gradient-to-r from-[#ff4757] to-[#ff7a85] px-6 py-5 text-white">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                <Activity className="h-3.5 w-3.5" />
                Kế hoạch hiện tại
              </div>
              <h3 className="text-2xl font-bold">{plan.name || "AI Workout Plan"}</h3>
              <p className="mt-2 text-sm text-white/90">
                {plan.goal || plan.description || "Kế hoạch cá nhân của bạn đã sẵn sàng."}
              </p>
            </div>
            <Badge className="border-white/20 bg-white/15 text-white" variant="default">
              Đang hoạt động
            </Badge>
          </div>
        </div>

        <div className="space-y-4 p-6">
          <div className="rounded-2xl border border-[#d1d9e6] bg-[#f7f9fc] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a5568]">Ghi chú của HLV</p>
            <p className="mt-2 text-sm leading-6 text-[#2d3436] whitespace-pre-line">
              {plan.aiAnalysis || plan.description || "Ghi chú AI sẽ xuất hiện ở đây sau khi tạo kế hoạch."}
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl px-4 py-3" style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
              <p className="text-xs uppercase tracking-wide text-[#4a5568]">Bắt đầu</p>
              <p className="mt-1 font-semibold text-[#2d3436]">{plan.createdAt ? format(new Date(plan.createdAt), "dd/MM/yyyy") : "-"}</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
              <p className="text-xs uppercase tracking-wide text-[#4a5568]">Tổng bài tập</p>
              <p className="mt-1 font-semibold text-[#2d3436]">{plan.totalExercises ?? 0}</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
              <p className="text-xs uppercase tracking-wide text-[#4a5568]">Trạng thái</p>
              <div className="mt-1"><Badge variant="success">Đang hoạt động</Badge></div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4">
        {activeDays.length > 0 ? (
          activeDays.map((day, index) => <DayCard key={`${day.day || index}-${index}`} day={day} index={index} />)
        ) : (
          <Card className="p-6 text-center text-[#4a5568]">
            <p>Kế hoạch hiện tại chưa có danh sách ngày tập rõ ràng.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function WorkoutPlans() {
  const { data: profile, isLoading: profileLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const generatePlan = useGenerateWorkoutPlan();
  const [form, setForm] = useState(() => getInitialForm(null));

  useEffect(() => {
    if (profile) {
      setForm(getInitialForm(profile));
    }
  }, [profile]);

  const healthProfile = profile?.healthProfile || {};
  const currentHeight = form.height ?? healthProfile.height ?? profile?.height ?? "";
  const currentWeight = form.weight ?? healthProfile.weight ?? profile?.weight ?? "";
  const bmi = useMemo(() => calculateBmi(currentHeight, currentWeight), [currentHeight, currentWeight]);

  const hasBodyMetrics = Boolean(toNumber(currentHeight) && toNumber(currentWeight));
  const canGenerate = hasBodyMetrics && !generatePlan.isPending;

  const handleSaveProfile = (e) => {
    e.preventDefault();

    updateProfile.mutate({
      fitnessGoal: form.fitnessGoal,
      fitnessLevel: form.fitnessLevel,
      healthProfile: {
        ...(healthProfile || {}),
        height: toNumber(currentHeight),
        weight: toNumber(currentWeight),
        bmi,
      },
    });
  };

  const handleGeneratePlan = () => {
    generatePlan.mutate();
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sức khỏe & Kế hoạch tập"
        description="Quản lý hồ sơ sức khỏe, tạo lịch tập AI và theo dõi kế hoạch hiện tại"
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden p-0">
          <div className="bg-gradient-to-r from-[#2d3436] to-[#4a5568] px-6 py-5 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">Hồ sơ sức khỏe</p>
                <h2 className="mt-2 text-2xl font-bold">Chỉ số cơ thể</h2>
                <p className="mt-2 text-sm text-white/85">
                  Cập nhật chỉ số cơ bản để hệ thống đề xuất lịch tập phù hợp với mục tiêu của bạn.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-3 text-white">
                <Scale className="h-6 w-6" />
              </div>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-5 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm font-semibold text-[#2d3436]">
                  <Ruler className="mr-1 inline-block h-4 w-4 text-[#ff4757]" />
                  Chiều cao (cm)
                </p>
                <Input
                  type="number"
                  min="0"
                  placeholder="VD: 170"
                  value={form.height}
                  onChange={(e) => setForm((prev) => ({ ...prev, height: e.target.value }))}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-[#2d3436]">
                  <Scale className="mr-1 inline-block h-4 w-4 text-[#ff4757]" />
                  Cân nặng (kg)
                </p>
                <Input
                  type="number"
                  min="0"
                  placeholder="VD: 68"
                  value={form.weight}
                  onChange={(e) => setForm((prev) => ({ ...prev, weight: e.target.value }))}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-[#2d3436]">
                  <Target className="mr-1 inline-block h-4 w-4 text-[#ff4757]" />
                  Mục tiêu tập luyện
                </p>
                <Select
                  value={form.fitnessGoal}
                  onChange={(e) => setForm((prev) => ({ ...prev, fitnessGoal: e.target.value }))}
                  options={GOAL_OPTIONS}
                />
              </div>
              <div>
                <p className="mb-2 text-sm font-semibold text-[#2d3436]">
                  <Dumbbell className="mr-1 inline-block h-4 w-4 text-[#ff4757]" />
                  Trình độ tập
                </p>
                <Select
                  value={form.fitnessLevel}
                  onChange={(e) => setForm((prev) => ({ ...prev, fitnessLevel: e.target.value }))}
                  options={LEVEL_OPTIONS}
                />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl bg-[#f7f9fc] p-4" style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a5568]">BMI hiện tại</p>
                <div className="mt-2 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-[#ff4757]" />
                  <BmiBadge bmi={bmi} />
                </div>
                <p className="mt-2 text-sm text-[#4a5568]">BMI được tính tự động từ chiều cao và cân nặng.</p>
              </div>

              <div className="rounded-2xl bg-[#f7f9fc] p-4" style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a5568]">Trạng thái hồ sơ</p>
                <p className="mt-2 text-sm font-semibold text-[#2d3436]">
                  {hasBodyMetrics ? "Sẵn sàng tạo kế hoạch" : "Vui lòng nhập chiều cao và cân nặng trước"}
                </p>
              </div>

              <div className="rounded-2xl bg-[#f7f9fc] p-4" style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a5568]">Cập nhật lúc</p>
                <p className="mt-2 text-sm font-semibold text-[#2d3436]">{profile?.updatedAt ? format(new Date(profile.updatedAt), "dd/MM/yyyy") : "-"}</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" isLoading={updateProfile.isPending} className="sm:flex-1">
                Lưu hồ sơ
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleGeneratePlan}
                isLoading={generatePlan.isPending}
                disabled={!hasBodyMetrics || generatePlan.isPending || profileLoading}
                className="sm:flex-1"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Tạo kế hoạch AI
              </Button>
            </div>

            {!hasBodyMetrics && (
              <p className="text-sm text-[#ef4444]">
                Vui lòng hoàn tất hồ sơ sức khỏe trước.
              </p>
            )}

            {generatePlan.isPending && (
              <div className="rounded-2xl border border-[#d1d9e6] bg-[#f7f9fc] p-4 text-sm text-[#4a5568]">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin text-[#ff4757]" />
                  <span>AI đang phân tích hồ sơ của bạn...</span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#d1d9e6]">
                  <div className="h-full w-3/4 animate-pulse rounded-full bg-[#ff4757]" />
                </div>
              </div>
            )}
          </form>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a5568]">Tóm tắt nhanh</p>
          <h3 className="mt-2 text-xl font-bold text-[#2d3436]">Chỉ số hiện tại</h3>

          <div className="mt-4 space-y-3">
            <div className="rounded-xl px-4 py-3" style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
              <p className="text-xs uppercase tracking-wide text-[#4a5568]">Chiều cao</p>
              <p className="mt-1 font-semibold text-[#2d3436]">{currentHeight || "-"} cm</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
              <p className="text-xs uppercase tracking-wide text-[#4a5568]">Cân nặng</p>
              <p className="mt-1 font-semibold text-[#2d3436]">{currentWeight || "-"} kg</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
              <p className="text-xs uppercase tracking-wide text-[#4a5568]">Mục tiêu</p>
              <p className="mt-1 font-semibold text-[#2d3436]">{form.fitnessGoal || "-"}</p>
            </div>
            <div className="rounded-xl px-4 py-3" style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}>
              <p className="text-xs uppercase tracking-wide text-[#4a5568]">Trình độ</p>
              <p className="mt-1 font-semibold text-[#2d3436]">{form.fitnessLevel || "-"}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-gradient-to-r from-[#ff4757] to-[#ff7a85] p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/75">HLV AI</p>
            <p className="mt-2 text-sm leading-6 text-white/90">
              Hoàn tất hồ sơ và tạo kế hoạch cá nhân. Kế hoạch tập sẽ tự động cập nhật sau khi tạo xong.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <PageHeader title="Kế hoạch tập hiện tại" description="Lịch tuần do AI tạo và ghi chú của HLV" />
          <ActivePlanSection />
        </div>

        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#4a5568]">Cách hoạt động</p>
          <ol className="mt-4 space-y-4 text-sm text-[#2d3436]">
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff4757] text-xs font-bold text-white">1</span>
              <span>Cập nhật chiều cao, cân nặng, mục tiêu và trình độ tập.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff4757] text-xs font-bold text-white">2</span>
              <span>Lưu hồ sơ để đồng bộ dữ liệu sức khỏe với hệ thống.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff4757] text-xs font-bold text-white">3</span>
              <span>Tạo kế hoạch AI. Lịch tập và ghi chú HLV sẽ tự động cập nhật.</span>
            </li>
          </ol>
        </Card>
      </div>
    </div>
  );
}