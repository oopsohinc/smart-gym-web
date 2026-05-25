/**
 * workout.service.js
 * Normalize và transform data từ /api/member/workout-plans
 */

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
  return {
    id: raw._id ?? raw.id,
    name: raw.name || "",
    description: raw.description || "",
    goal: raw.goal || "",
    isActive: raw.isActive ?? raw.active ?? false,
    createdAt: raw.createdAt || null,
    updatedAt: raw.updatedAt || null,
    exercises: Array.isArray(raw.exercises)
      ? raw.exercises.map(normalizeExercise)
      : [],
    totalExercises: Array.isArray(raw.exercises) ? raw.exercises.length : 0,
  };
}

/**
 * Normalize list của workout plans
 */
export function normalizeWorkoutPlansResponse(raw) {
  const list = Array.isArray(raw) ? raw : raw?.data ?? raw?.plans ?? [];
  return list.map(normalizeWorkoutPlan);
}
