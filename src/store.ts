import { useSyncExternalStore } from 'react';
import { initialState } from './seed';
import type { State } from './types';

const KEY = 'flamelog:v1';

function load(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as State;
      if (parsed.version === 1) return parsed;
    }
  } catch {
    // fall through to a fresh state
  }
  return initialState();
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
  setState(() => next);
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
