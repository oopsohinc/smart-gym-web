/**
 * workout.service.js
 * Normalize và transform data từ /api/member/workout-plans
 */

function normalizeAiAnalysis(raw) {
  if (!raw) return "";
  if (typeof raw === "string") return raw;

  return (
    raw.text ||
    raw.summary ||
    raw.note ||
    raw.message ||
    raw.content ||
    ""
  );
}

function normalizePlanExercise(raw = {}) {
  return {
    name: raw.name || raw.exerciseName || raw.title || "",
    sets: Number(raw.sets ?? raw.rounds ?? 0),
    reps: raw.reps ?? raw.repetitions ?? raw.rep ?? null,
    restSec: raw.restSec ?? raw.rest ?? raw.restSeconds ?? null,
    durationMin: raw.durationMin ?? raw.duration ?? null,
    notes: raw.notes || raw.description || "",
  };
}

function normalizePlanDay(raw = {}, index = 0) {
  const exercises = Array.isArray(raw.exercises)
    ? raw.exercises.map(normalizePlanExercise)
    : Array.isArray(raw.items)
      ? raw.items.map(normalizePlanExercise)
      : [];

  return {
    day: raw.day || raw.title || raw.label || raw.name || `Ngày ${index + 1}`,
    focus: raw.focus || raw.focusArea || raw.target || raw.title || "",
    notes: raw.notes || raw.description || "",
    exercises,
  };
}

/**
 * Normalize 1 exercise set item
 */
function normalizeExercise(raw = {}) {
  return {
    name: raw.name || raw.exerciseName || "",
    sets: Number(raw.sets ?? 0),
    reps: raw.reps ?? raw.repetitions ?? null,
    durationSec: raw.durationSec ?? raw.duration ?? null,
    restSec: raw.restSec ?? raw.rest ?? null,
    notes: raw.notes || "",
  };
}

/**
 * Normalize 1 workout plan item
 */
export function normalizeWorkoutPlan(raw = {}) {
  const aiAnalysis = normalizeAiAnalysis(raw.aiAnalysis ?? raw.ai_analysis ?? raw.analysis);
  const planData = Array.isArray(raw.planData)
    ? raw.planData.map(normalizePlanDay)
    : Array.isArray(raw.schedule)
      ? raw.schedule.map(normalizePlanDay)
      : Array.isArray(raw.days)
        ? raw.days.map(normalizePlanDay)
        : [];
  const exercises = Array.isArray(raw.exercises)
    ? raw.exercises.map(normalizeExercise)
    : [];

  return {
    id: raw._id ?? raw.id,
    name: raw.name || "",
    description: raw.description || "",
    goal: raw.goal || "",
    isActive: raw.isActive ?? raw.active ?? false,
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    aiAnalysis,
    aiAnalysisRaw: raw.aiAnalysis ?? raw.ai_analysis ?? raw.analysis ?? null,
    planData,
    exercises: planData.length > 0 ? planData.flatMap((day) => day.exercises) : exercises,
    totalExercises: planData.length > 0
      ? planData.reduce((total, day) => total + (day.exercises?.length || 0), 0)
      : exercises.length,
  };
}

/**
 * Normalize list của workout plans
 */
export function normalizeWorkoutPlansResponse(raw) {
  const list = Array.isArray(raw) ? raw : raw?.data ?? raw?.plans ?? [];
  return list.map(normalizeWorkoutPlan);
}
