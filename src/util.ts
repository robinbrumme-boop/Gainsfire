import type { SetEntry, Workout } from './types';

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/** Estimated one-rep max (Epley). */
export const e1rm = (weight: number, reps: number) => (reps <= 1 ? weight : weight * (1 + reps / 30));

export const doneSets = (w: Workout): SetEntry[] => w.exercises.flatMap((e) => e.sets.filter((s) => s.done));

export const volume = (w: Workout) => doneSets(w).reduce((sum, s) => sum + s.weight * s.reps, 0);

export function fmtKg(n: number) {
  return n.toLocaleString('de-DE', { maximumFractionDigits: 1 });
}

export function fmtVolume(n: number) {
  if (n >= 1000) return `${(n / 1000).toLocaleString('de-DE', { maximumFractionDigits: n >= 10_000 ? 1 : 2 })} t`;
  return `${Math.round(n)} kg`;
}

export function fmtDuration(ms: number) {
  const min = Math.round(ms / 60_000);
  return min < 60 ? `${min} min` : `${Math.floor(min / 60)} h ${min % 60} min`;
}

export function fmtClock(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function fmtDate(ts: number, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return new Date(ts).toLocaleDateString('de-DE', opts);
}

/** Sets of the most recent finished workout that contained this exercise. */
export function previousSets(workouts: Workout[], exerciseId: string): SetEntry[] | undefined {
  for (const w of workouts) {
    const ex = w.exercises.find((e) => e.exerciseId === exerciseId);
    const sets = ex?.sets.filter((s) => s.done);
    if (sets && sets.length) return sets;
  }
  return undefined;
}

export interface ExercisePoint {
  date: number;
  best: number;
  maxWeight: number;
  volume: number;
}

/** One point per workout for an exercise, oldest first. */
export function exerciseHistory(workouts: Workout[], exerciseId: string): ExercisePoint[] {
  const pts: ExercisePoint[] = [];
  for (const w of workouts) {
    const sets = w.exercises.find((e) => e.exerciseId === exerciseId)?.sets.filter((s) => s.done) ?? [];
    if (!sets.length) continue;
    pts.push({
      date: w.startedAt,
      best: Math.max(...sets.map((s) => e1rm(s.weight, s.reps))),
      maxWeight: Math.max(...sets.map((s) => s.weight)),
      volume: sets.reduce((sum, s) => sum + s.weight * s.reps, 0),
    });
  }
  return pts.reverse();
}

export function pctChange(now: number, before: number) {
  if (!before) return undefined;
  return ((now - before) / before) * 100;
}
