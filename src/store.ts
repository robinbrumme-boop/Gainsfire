import { useSyncExternalStore } from 'react';
import { catalogExercises, fbRoutines, initialState } from './seed';
import type { Muscle, Routine, State } from './types';
import { uid } from './util';

const KEY = 'flamelog:v1';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const migrated = migrate(JSON.parse(raw));
      if (migrated) return migrated;
    }
  } catch {
    // fall through to a fresh state
  }
  return initialState();
}

interface StateV1 extends Omit<State, 'version' | 'routines' | 'plan'> {
  version: 1;
  routines: { id: string; name: string; exerciseIds: string[] }[];
}

/** Brings stored data (current or older versions) up to the current shape. Returns null if unusable. */
export function migrate(raw: unknown): State | null {
  const x = raw as State | StateV1 | null;
  if (!x || !Array.isArray(x.exercises) || !Array.isArray(x.routines) || !Array.isArray(x.workouts)) return null;
  let s: State;
  if (x.version === 1) {
    // v2 adds per-slot set targets/variants and the weekly plan. Old routines are kept,
    // and the Push FB / Pull FB split is added and used as the plan.
    const old: Routine[] = x.routines.map((r) => ({
      id: r.id,
      name: r.name,
      items: r.exerciseIds.map((id) => ({ id: uid(), options: [id], sets: 3 })),
    }));
    const exercises = withCatalog({ ...x, version: 2, routines: [], plan: { routineIds: [], perWeek: 6 } }).exercises;
    const fb = fbRoutines(exercises);
    s = { ...x, version: 2, exercises, routines: [...fb.routines, ...old], plan: fb.plan };
  } else if (x.version === 2) {
    s = x;
  } else {
    return null;
  }
  return withCatalog(s);
}

/** Adds catalog exercises introduced after the user's data was first saved. */
function withCatalog(s: State): State {
  const ids = new Set(s.exercises.map((e) => e.id));
  const names = new Set(s.exercises.map((e) => e.name.toLowerCase()));
  // Skip names the user already created as custom exercises.
  const missing = catalogExercises().filter((e) => !ids.has(e.id) && !names.has(e.name.toLowerCase()));
  return missing.length ? { ...s, exercises: [...s.exercises, ...missing] } : s;
}

let state: State = load();
// Persist right away so migrated data (and its new routine ids) stay stable across reloads.
try {
  localStorage.setItem(KEY, JSON.stringify(state));
} catch {
  // storage unavailable: keep working in memory
}
const listeners = new Set<() => void>();

export function getState() {
  return state;
}

export function setState(update: (s: State) => State) {
  state = update(state);
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage full or unavailable: keep working in memory
  }
  listeners.forEach((l) => l());
}

export function replaceState(next: State) {
  setState(() => next);
}

/** Creates a custom exercise. Returns its id, or an error message for the user. */
export function addCustomExercise(name: string, muscle: Muscle): { id: string } | { error: string } {
  const n = name.trim();
  if (!n) return { error: 'Bitte einen Namen eingeben.' };
  if (state.exercises.some((e) => e.name.toLowerCase() === n.toLowerCase())) return { error: 'Diese Übung gibt es schon.' };
  const id = uid();
  setState((s) => ({ ...s, exercises: [...s.exercises, { id, name: n, muscle, custom: true }] }));
  return { id };
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(select: (s: State) => T): T {
  return useSyncExternalStore(subscribe, () => select(state));
}
