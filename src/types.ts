export type Muscle = 'Brust' | 'Rücken' | 'Beine' | 'Gesäß' | 'Schultern' | 'Arme' | 'Bauch';

export const MUSCLES: Muscle[] = ['Brust', 'Rücken', 'Beine', 'Gesäß', 'Schultern', 'Arme', 'Bauch'];

export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  custom?: boolean;
}

/** One slot in a routine, e.g. "2–3 Sätze Bauch Variante". */
export interface RoutineItem {
  id: string;
  /** Own name for the slot ("Brust drückend"); falls back to the exercise name. */
  label?: string;
  /** Exercise ids that can fill this slot; the first is the default. */
  options: string[];
  sets: number;
  /** Upper end of a set range ("2–3 Sätze"). */
  setsMax?: number;
}

export interface Routine {
  id: string;
  name: string;
  items: RoutineItem[];
}

/** Weekly rotation: routines are suggested in this order, perWeek times a week in total. */
export interface Plan {
  routineIds: string[];
  perWeek: number;
}

export interface SetEntry {
  weight: number;
  reps: number;
  done: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: SetEntry[];
  /** From the routine slot: label, alternative exercises and target ("2–3"). */
  label?: string;
  options?: string[];
  target?: string;
}

export interface Workout {
  id: string;
  name: string;
  routineId?: string;
  startedAt: number;
  finishedAt?: number;
  exercises: WorkoutExercise[];
}

export interface Settings {
  restSeconds: number;
}

export interface State {
  version: 2;
  exercises: Exercise[];
  routines: Routine[];
  /** Finished workouts, newest first. */
  workouts: Workout[];
  active?: Workout;
  settings: Settings;
  plan: Plan;
}
