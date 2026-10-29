export type Muscle = 'Brust' | 'Rücken' | 'Beine' | 'Schultern' | 'Arme' | 'Bauch';

export const MUSCLES: Muscle[] = ['Brust', 'Rücken', 'Beine', 'Schultern', 'Arme', 'Bauch'];

export interface Exercise {
  id: string;
  name: string;
  muscle: Muscle;
  custom?: boolean;
}

export interface Routine {
  id: string;
  name: string;
  exerciseIds: string[];
}

export interface SetEntry {
  weight: number;
  reps: number;
  done: boolean;
}

export interface WorkoutExercise {
  exerciseId: string;
  sets: SetEntry[];
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
  version: 1;
  exercises: Exercise[];
  routines: Routine[];
  /** Finished workouts, newest first. */
  workouts: Workout[];
  active?: Workout;
  settings: Settings;
}
