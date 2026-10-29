import { useSyncExternalStore } from 'react';
import { catalogExercises, initialState } from './seed';
import type { Muscle, State } from './types';
import { uid } from './util';

const KEY = 'flamelog:v1';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed.version === 1) return withCatalog(parsed);
    }
  } catch {
    // fall through to a fresh state
  }
  return initialState();
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
  setState(() => withCatalog(next));
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

export function isValidState(x: unknown): x is State {
  const s = x as State;
  return !!s && s.version === 1 && Array.isArray(s.exercises) && Array.isArray(s.routines) && Array.isArray(s.workouts);
}
