import type { Exercise, Muscle, Plan, Routine, RoutineItem, State, Workout } from './types';
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
  // Appended later: keep this order, ids are derived from the position.
  ['Kurzhantel-Bankdrücken', 'Brust'],
  ['Schrägbankdrücken (Langhantel)', 'Brust'],
  ['Negativ-Bankdrücken', 'Brust'],
  ['Brustpresse an der Maschine', 'Brust'],
  ['Butterfly an der Maschine', 'Brust'],
  ['Kurzhantel-Fliegende', 'Brust'],
  ['Cable Crossover', 'Brust'],
  ['Liegestütze', 'Brust'],
  ['Kurzhantel-Pullover', 'Brust'],
  ['Klimmzüge (Untergriff)', 'Rücken'],
  ['Klimmzüge mit Unterstützung', 'Rücken'],
  ['Latzug eng', 'Rücken'],
  ['Kurzhantelrudern einarmig', 'Rücken'],
  ['T-Bar-Rudern', 'Rücken'],
  ['Rudern an der Maschine', 'Rücken'],
  ['Pendlay-Rudern', 'Rücken'],
  ['Überzüge am Kabel', 'Rücken'],
  ['Rückenstrecker (Hyperextensions)', 'Rücken'],
  ['Shrugs', 'Rücken'],
  ['Rack Pulls', 'Rücken'],
  ['Frontkniebeugen', 'Beine'],
  ['Hackenschmidt-Kniebeugen', 'Beine'],
  ['Bulgarische Split Squats', 'Beine'],
  ['Ausfallschritte', 'Beine'],
  ['Goblet Squats', 'Beine'],
  ['Kreuzheben mit gestreckten Beinen', 'Beine'],
  ['Beinbeuger sitzend', 'Beine'],
  ['Adduktoren-Maschine', 'Beine'],
  ['Wadenheben sitzend', 'Beine'],
  ['Step-ups', 'Beine'],
  ['Hip Thrusts', 'Gesäß'],
  ['Glute Bridge', 'Gesäß'],
  ['Abduktoren-Maschine', 'Gesäß'],
  ['Kickbacks am Kabel', 'Gesäß'],
  ['Sumo-Kreuzheben', 'Gesäß'],
  ['Kurzhantel-Schulterdrücken', 'Schultern'],
  ['Arnold Press', 'Schultern'],
  ['Schulterpresse an der Maschine', 'Schultern'],
  ['Seitheben am Kabel', 'Schultern'],
  ['Frontheben', 'Schultern'],
  ['Reverse Butterfly', 'Schultern'],
  ['Vorgebeugtes Seitheben', 'Schultern'],
  ['Aufrechtes Rudern', 'Schultern'],
  ['Bizepscurls (Kurzhantel)', 'Arme'],
  ['SZ-Curls', 'Arme'],
  ['Scottcurls', 'Arme'],
  ['Konzentrationscurls', 'Arme'],
  ['Bizepscurls am Kabel', 'Arme'],
  ['Schrägbank-Curls', 'Arme'],
  ['Trizepsdrücken mit Seil', 'Arme'],
  ['Trizepsdrücken über Kopf', 'Arme'],
  ['Enges Bankdrücken', 'Arme'],
  ['Dips an der Bank', 'Arme'],
  ['Kickbacks (Trizeps)', 'Arme'],
  ['Unterarmcurls', 'Arme'],
  ['Reverse Curls', 'Arme'],
  ['Crunches', 'Bauch'],
  ['Plank', 'Bauch'],
  ['Russian Twists', 'Bauch'],
  ['Ab Roller', 'Bauch'],
  ['Beinheben liegend', 'Bauch'],
  ['Woodchopper am Kabel', 'Bauch'],
  ['Seitstütz', 'Bauch'],
  ['Bauchmaschine', 'Bauch'],
  ['Unterarm-Extension (Handgelenk)', 'Arme'],
];

/** The built-in catalog with stable ids (`ex1`, `ex2`, …). */
export function catalogExercises(): Exercise[] {
  return CATALOG.map(([name, muscle], i) => ({ id: `ex${i + 1}`, name, muscle }));
}

type Slot = [sets: number | [number, number], options: string[], label?: string];

const PUSH_FB: Slot[] = [
  [3, ['Seitheben', 'Seitheben am Kabel', 'Kurzhantel-Schulterdrücken']],
  [2, ['Bankdrücken', 'Kurzhantel-Bankdrücken', 'Schrägbankdrücken (Kurzhantel)', 'Schrägbankdrücken (Langhantel)', 'Brustpresse an der Maschine', 'Dips'], 'Brust drückend'],
  [2, ['Butterfly an der Maschine', 'Butterfly am Kabel', 'Cable Crossover', 'Kurzhantel-Fliegende'], 'Brust Fly'],
  [2, ['Trizepsdrücken am Kabel', 'Trizepsdrücken mit Seil', 'Trizepsdrücken über Kopf', 'French Press', 'Enges Bankdrücken'], 'Trizeps'],
  [2, ['Beinpresse', 'Hackenschmidt-Kniebeugen', 'Kniebeugen', 'Goblet Squats'], 'Beinpresse'],
  [2, ['Beinstrecker'], 'Beinstrecken'],
  [[2, 3], ['Crunches am Kabel', 'Bauchmaschine', 'Beinheben hängend', 'Ab Roller', 'Crunches'], 'Bauch'],
];

const PULL_FB: Slot[] = [
  [2, ['Latzug eng', 'Kabelrudern sitzend', 'Klimmzüge (Untergriff)'], 'Zug eng'],
  [2, ['Latzug', 'Klimmzüge', 'Rudern an der Maschine'], 'Zug breit'],
  [3, ['Reverse Butterfly', 'Face Pulls', 'T-Bar-Rudern', 'Rudern an der Maschine'], 'Mittlerer Trapez'],
  [2, ['Bizepscurls (Kurzhantel)', 'SZ-Curls', 'Bizepscurls am Kabel', 'Scottcurls', 'Hammercurls'], 'Bizeps'],
  [2, ['Unterarm-Extension (Handgelenk)', 'Reverse Curls'], 'Unterarm Extension'],
  [2, ['Unterarmcurls'], 'Unterarm Flexion'],
  [3, ['Beinbeuger', 'Beinbeuger sitzend'], 'Beinbeugen'],
];

/** The user's own Push/Pull full-body split, trained 3× each per week. */
export function fbRoutines(exercises: Exercise[]): { routines: Routine[]; plan: Plan } {
  const idOf = (n: string) => exercises.find((e) => e.name.toLowerCase() === n.toLowerCase())?.id;
  const build = (name: string, slots: Slot[]): Routine => ({
    id: uid(),
    name,
    items: slots
      .map(([sets, names, label]): RoutineItem => ({
        id: uid(),
        label,
        options: names.map(idOf).filter((x): x is string => !!x),
        sets: Array.isArray(sets) ? sets[0] : sets,
        setsMax: Array.isArray(sets) ? sets[1] : undefined,
      }))
      .filter((it) => it.options.length),
  });
  const push = build('Push FB', PUSH_FB);
  const pull = build('Pull FB', PULL_FB);
  return { routines: [push, pull], plan: { routineIds: [push.id, pull.id], perWeek: 6 } };
}

export function initialState(): State {
  const exercises = catalogExercises();
  const { routines, plan } = fbRoutines(exercises);
  return { version: 2, exercises, routines, workouts: [], settings: { restSeconds: 90 }, plan };
}

/** Eight weeks of the weekly plan with steady progression, so stats have something to show. */
export function demoWorkouts(state: State): Workout[] {
  const start: Record<string, number> = {
    Seitheben: 8, Bankdrücken: 60, 'Butterfly an der Maschine': 40, 'Trizepsdrücken am Kabel': 20,
    Beinpresse: 120, Beinstrecker: 40, 'Crunches am Kabel': 30, 'Latzug eng': 50, Latzug: 45,
    'Reverse Butterfly': 30, 'Bizepscurls (Kurzhantel)': 12, 'Unterarm-Extension (Handgelenk)': 10,
    Unterarmcurls: 14, Beinbeuger: 35,
  };
  const name = (id: string) => state.exercises.find((e) => e.id === id)?.name ?? '';
  const out: Workout[] = [];
  const day = 86_400_000;
  const now = Date.now();
  let session = 0;
  const plan = state.plan.routineIds.map((id) => state.routines.find((r) => r.id === id)).filter((r) => !!r);
  const rotation = plan.length ? plan : state.routines.slice(0, 2);
  if (!rotation.length) return [];
  const perWeek = Math.min(7, Math.max(1, state.plan.perWeek));
  for (let week = 7; week >= 0; week--) {
    for (let d = 0; d < perWeek; d++) {
      const routine = rotation[session % rotation.length];
      const startedAt = now - (week * 7 + (7 - d)) * day - 18 * 3_600_000;
      if (startedAt > now) continue;
      const progress = 7 - week;
      out.push({
        id: uid(),
        name: routine.name,
        routineId: routine.id,
        startedAt,
        finishedAt: startedAt + (55 + ((session * 7) % 20)) * 60_000,
        exercises: routine.items.map((it) => {
          const exId = it.options[0];
          const base = start[name(exId)] ?? 20;
          const weight = Math.round((base * (1 + progress * 0.025)) / 2.5) * 2.5;
          const reps = 8 + (progress % 3);
          const sets = Array.from({ length: it.sets }, (_, s) => ({ weight, reps: Math.max(5, reps - s), done: true }));
          return { exerciseId: exId, label: it.label, options: it.options, sets };
        }),
      });
      session++;
    }
  }
  return out.sort((a, b) => b.startedAt - a.startedAt);
}
