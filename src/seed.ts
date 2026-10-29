import type { Exercise, Muscle, Routine, State, Workout } from './types';
import { uid } from './util';

const CATALOG: [string, Muscle][] = [
  ['Bankdrücken', 'Brust'],
  ['Schrägbankdrücken (Kurzhantel)', 'Brust'],
  ['Butterfly am Kabel', 'Brust'],
  ['Dips', 'Brust'],
  ['Klimmzüge', 'Rücken'],
  ['Langhantelrudern', 'Rücken'],
  ['Latzug', 'Rücken'],
  ['Kabelrudern sitzend', 'Rücken'],
  ['Kreuzheben', 'Rücken'],
  ['Kniebeugen', 'Beine'],
  ['Beinpresse', 'Beine'],
  ['Rumänisches Kreuzheben', 'Beine'],
  ['Beinstrecker', 'Beine'],
  ['Beinbeuger', 'Beine'],
  ['Wadenheben', 'Beine'],
  ['Schulterdrücken', 'Schultern'],
  ['Seitheben', 'Schultern'],
  ['Face Pulls', 'Schultern'],
  ['Bizepscurls (Langhantel)', 'Arme'],
  ['Hammercurls', 'Arme'],
  ['Trizepsdrücken am Kabel', 'Arme'],
  ['French Press', 'Arme'],
  ['Crunches am Kabel', 'Bauch'],
  ['Beinheben hängend', 'Bauch'],
];

export function initialState(): State {
  const exercises: Exercise[] = CATALOG.map(([name, muscle], i) => ({ id: `ex${i + 1}`, name, muscle }));
  const byName = (n: string) => exercises.find((e) => e.name === n)!.id;
  const routines: Routine[] = [
    {
      id: uid(),
      name: 'Push',
      exerciseIds: ['Bankdrücken', 'Schulterdrücken', 'Schrägbankdrücken (Kurzhantel)', 'Seitheben', 'Trizepsdrücken am Kabel'].map(byName),
    },
    {
      id: uid(),
      name: 'Pull',
      exerciseIds: ['Klimmzüge', 'Langhantelrudern', 'Latzug', 'Face Pulls', 'Bizepscurls (Langhantel)'].map(byName),
    },
    {
      id: uid(),
      name: 'Beine',
      exerciseIds: ['Kniebeugen', 'Rumänisches Kreuzheben', 'Beinpresse', 'Beinbeuger', 'Wadenheben'].map(byName),
    },
  ];
  return { version: 1, exercises, routines, workouts: [], settings: { restSeconds: 90 } };
}

/** Eight weeks of push/pull/legs with steady progression, so stats have something to show. */
export function demoWorkouts(state: State): Workout[] {
  const start: Record<string, number> = {
    Bankdrücken: 60, Schulterdrücken: 35, 'Schrägbankdrücken (Kurzhantel)': 20, Seitheben: 8,
    'Trizepsdrücken am Kabel': 20, Klimmzüge: 0, Langhantelrudern: 50, Latzug: 45, 'Face Pulls': 15,
    'Bizepscurls (Langhantel)': 25, Kniebeugen: 70, 'Rumänisches Kreuzheben': 60, Beinpresse: 120,
    Beinbeuger: 35, Wadenheben: 60,
  };
  const name = (id: string) => state.exercises.find((e) => e.id === id)?.name ?? '';
  const out: Workout[] = [];
  const day = 86_400_000;
  const now = Date.now();
  let session = 0;
  for (let week = 7; week >= 0; week--) {
    for (const [d, routine] of state.routines.slice(0, 3).entries()) {
      const startedAt = now - (week * 7 + (6 - d * 2)) * day - 18 * 3_600_000;
      if (startedAt > now) continue;
      const progress = 7 - week;
      out.push({
        id: uid(),
        name: routine.name,
        routineId: routine.id,
        startedAt,
        finishedAt: startedAt + (55 + ((session * 7) % 20)) * 60_000,
        exercises: routine.exerciseIds.map((exId) => {
          const base = start[name(exId)] ?? 20;
          const weight = base === 0 ? 0 : Math.round((base * (1 + progress * 0.025)) / 2.5) * 2.5;
          const reps = base === 0 ? 6 + Math.floor(progress / 2) : 8 + (progress % 3);
          return { exerciseId: exId, sets: [0, 1, 2].map((s) => ({ weight, reps: Math.max(5, reps - s), done: true })) };
        }),
      });
      session++;
    }
  }
  return out.sort((a, b) => b.startedAt - a.startedAt);
}
