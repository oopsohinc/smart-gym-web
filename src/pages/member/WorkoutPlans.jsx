import { useState } from "react";
import { Plus, Zap, Dumbbell, ChevronDown, ChevronUp, Trash2 } from "lucide-react";
import { Badge, Button, Card, ConfirmModal, Input, Label, Modal, PageHeader } from "@/components/ui";
import {
  useWorkoutPlans,
  useActiveWorkoutPlan,
  useCreateWorkoutPlan,
  useActivateWorkoutPlan,
} from "@/hooks/use-queries";

const EMPTY_EXERCISE = { name: "", sets: 3, reps: 10, restSec: 60, notes: "" };
const INITIAL_FORM = { name: "", description: "", goal: "", exercises: [{ ...EMPTY_EXERCISE }] };

function ExerciseAccordion({ exercise, index }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ boxShadow: "3px 3px 6px #babecc, -3px -3px 6px #ffffff" }}
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-[#d1d9e6] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-[#ff4757] flex items-center justify-center text-white text-xs font-bold shrink-0">
            {index + 1}
          </div>
          <span className="font-semibold text-[#2d3436]">{exercise.name || "Bài tập"}</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-[#4a5568]">
          <span>{exercise.sets} sets × {exercise.reps} reps</span>
          {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </button>
      {open && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-4 pb-4 pt-1 text-sm">
          <div>
            <p className="text-[#4a5568] font-medium">Sets</p>
            <p className="font-semibold text-[#2d3436]">{exercise.sets}</p>
          </div>
          <div>
            <p className="text-[#4a5568] font-medium">Reps</p>
            <p className="font-semibold text-[#2d3436]">{exercise.reps ?? "-"}</p>
          </div>
          <div>
            <p className="text-[#4a5568] font-medium">Nghỉ</p>
            <p className="font-semibold text-[#2d3436]">{exercise.restSec ?? exercise.rest ?? "-"}s</p>
          </div>
          {exercise.notes && (
            <div className="col-span-2 sm:col-span-3">
              <p className="text-[#4a5568] font-medium">Ghi chú</p>
              <p className="text-[#2d3436]">{exercise.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ActivePlanView() {
  const { data: plan, isLoading, isError } = useActiveWorkoutPlan();

  if (isLoading) return <p className="text-[#4a5568]">Đang tải kế hoạch...</p>;
  if (isError || !plan?.id) return (
    <Card className="text-center py-12">
      <Dumbbell className="h-10 w-10 text-[#babecc] mx-auto mb-3" />
      <p className="text-[#4a5568]">Chưa có kế hoạch tập đang hoạt động.</p>
      <p className="text-sm text-[#4a5568] mt-1">Hãy kích hoạt một kế hoạch từ tab "Kế hoạch của tôi".</p>
    </Card>
  );

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-bold text-[#2d3436]">{plan.name}</h2>
            {plan.goal && <p className="text-sm text-[#4a5568] mt-1">🎯 Mục tiêu: {plan.goal}</p>}
            {plan.description && <p className="text-sm text-[#4a5568] mt-1">{plan.description}</p>}
          </div>
          <Badge variant="success">
            <Zap className="mr-1 h-3 w-3" />
            Đang hoạt động
          </Badge>
        </div>
        <p className="text-sm text-[#4a5568] mt-3">{plan.totalExercises} bài tập</p>
      </Card>

      <div className="space-y-3">
        {plan.exercises.map((ex, i) => (
          <ExerciseAccordion key={i} exercise={ex} index={i} />
        ))}
      </div>
    </div>
  );
}

export default function WorkoutPlans() {
  const [tab, setTab] = useState("list");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activateTargetId, setActivateTargetId] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  const { data, isLoading } = useWorkoutPlans();
  const createPlan = useCreateWorkoutPlan();
  const activatePlan = useActivateWorkoutPlan();

  const plans = Array.isArray(data) ? data : [];

  const handleExerciseChange = (idx, field, value) => {
    setForm((prev) => {
      const exercises = [...prev.exercises];
      exercises[idx] = { ...exercises[idx], [field]: value };
      return { ...prev, exercises };
    });
  };

  const addExercise = () =>
    setForm((prev) => ({ ...prev, exercises: [...prev.exercises, { ...EMPTY_EXERCISE }] }));

  const removeExercise = (idx) =>
    setForm((prev) => ({
      ...prev,
      exercises: prev.exercises.filter((_, i) => i !== idx),
    }));

  const handleSubmit = (e) => {
    e.preventDefault();
    createPlan.mutate(
      { ...form, exercises: form.exercises.filter((ex) => ex.name.trim()) },
      { onSuccess: () => { setIsModalOpen(false); setForm(INITIAL_FORM); } },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kế hoạch tập luyện"
        description="Quản lý và theo dõi chương trình tập của bạn"
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Tạo kế hoạch
          </Button>
        }
      />

      {/* Tabs */}
      <div
        className="flex gap-1 p-1 rounded-xl w-fit"
        style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
      >
        {[
          { key: "list", label: "Kế hoạch của tôi" },
          { key: "active", label: "Đang hoạt động" },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t.key
                ? "bg-[#ff4757] text-white shadow-[3px_3px_6px_rgba(166,50,60,0.3)]"
                : "text-[#4a5568] hover:text-[#2d3436]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Danh sách */}
      {tab === "list" && (
        <div>
          {isLoading && <p className="text-[#4a5568]">Đang tải...</p>}
          {!isLoading && plans.length === 0 && (
            <Card className="text-center py-12">
              <Dumbbell className="h-10 w-10 text-[#babecc] mx-auto mb-3" />
              <p className="text-[#4a5568]">Bạn chưa có kế hoạch tập nào.</p>
              <Button className="mt-4" onClick={() => setIsModalOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Tạo kế hoạch đầu tiên
              </Button>
            </Card>
          )}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {plans.map((plan) => (
              <Card key={plan.id} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-lg text-[#2d3436] leading-tight">{plan.name}</h3>
                  {plan.isActive ? (
                    <Badge variant="success"><Zap className="mr-1 h-3 w-3" />Active</Badge>
                  ) : (
                    <Badge variant="default">Chờ kích hoạt</Badge>
                  )}
                </div>
                {plan.goal && (
                  <p className="text-sm text-[#4a5568]">🎯 {plan.goal}</p>
                )}
                {plan.description && (
                  <p className="text-sm text-[#4a5568] line-clamp-2">{plan.description}</p>
                )}
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[#4a5568]"
                  style={{ boxShadow: "inset 2px 2px 4px #babecc, inset -2px -2px 4px #ffffff" }}
                >
                  <Dumbbell className="h-4 w-4 text-[#ff4757]" />
                  {plan.totalExercises} bài tập
                </div>
                {!plan.isActive && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setActivateTargetId(plan.id)}
                  >
                    <Zap className="mr-2 h-3.5 w-3.5" />
                    Kích hoạt
                  </Button>
                )}
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Active plan */}
      {tab === "active" && <ActivePlanView />}

      {/* Confirm activate */}
      <ConfirmModal
        isOpen={!!activateTargetId}
        onClose={() => setActivateTargetId(null)}
        onConfirm={() => {
          activatePlan.mutate(activateTargetId, {
            onSuccess: () => { setActivateTargetId(null); setTab("active"); },
            onError:   () => setActivateTargetId(null),
          });
        }}
        title="Kích hoạt kế hoạch tập"
        message="Kế hoạch này sẽ trở thành kế hoạch đang hoạt động của bạn."
        confirmLabel="Kích hoạt"
        confirmVariant="primary"
        isLoading={activatePlan.isPending}
      />

      {/* Modal tạo kế hoạch */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tạo kế hoạch tập">
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <Label required>Tên kế hoạch</Label>
            <Input
              placeholder="VD: Tăng cơ tháng 6"
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label>Mục tiêu</Label>
            <Input
              placeholder="VD: Tăng 3kg cơ bắp"
              value={form.goal}
              onChange={(e) => setForm((p) => ({ ...p, goal: e.target.value }))}
            />
          </div>
          <div>
            <Label>Mô tả</Label>
            <Input
              placeholder="Mô tả ngắn về kế hoạch"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <Label className="mb-0">Danh sách bài tập</Label>
              <button
                type="button"
                onClick={addExercise}
                className="text-xs text-[#ff4757] font-semibold flex items-center gap-1 hover:opacity-80"
              >
                <Plus className="h-3 w-3" /> Thêm bài
              </button>
            </div>
            <div className="space-y-3">
              {form.exercises.map((ex, idx) => (
                <div
                  key={idx}
                  className="rounded-xl p-3 space-y-2"
                  style={{ boxShadow: "inset 3px 3px 6px #babecc, inset -3px -3px 6px #ffffff" }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#ff4757] text-white text-xs flex items-center justify-center font-bold shrink-0">
                      {idx + 1}
                    </span>
                    <Input
                      placeholder="Tên bài tập*"
                      value={ex.name}
                      onChange={(e) => handleExerciseChange(idx, "name", e.target.value)}
                      className="flex-1"
                    />
                    {form.exercises.length > 1 && (
                      <button type="button" onClick={() => removeExercise(idx)} className="text-[#ef4444] hover:opacity-70 shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-xs text-[#4a5568] mb-1">Sets</p>
                      <Input
                        type="number"
                        min={1}
                        value={ex.sets}
                        onChange={(e) => handleExerciseChange(idx, "sets", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-[#4a5568] mb-1">Reps</p>
                      <Input
                        type="number"
                        min={1}
                        value={ex.reps}
                        onChange={(e) => handleExerciseChange(idx, "reps", Number(e.target.value))}
                      />
                    </div>
                    <div>
                      <p className="text-xs text-[#4a5568] mb-1">Nghỉ (s)</p>
                      <Input
                        type="number"
                        min={0}
                        value={ex.restSec}
                        onChange={(e) => handleExerciseChange(idx, "restSec", Number(e.target.value))}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button type="submit" className="w-full" isLoading={createPlan.isPending}>
            Tạo kế hoạch
          </Button>
        </form>
      </Modal>
    </div>
  );
}
