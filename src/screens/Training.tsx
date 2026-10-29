import { useState } from 'react';
import { ExercisePicker } from '../components/ExercisePicker';
import { setState, useStore } from '../store';
import type { Routine, Workout } from '../types';
import { fmtDate, previousSets, uid } from '../util';

export function startWorkout(routine?: Routine) {
  setState((s) => {
    const workout: Workout = {
      id: uid(),
      name: routine?.name ?? 'Freies Training',
      routineId: routine?.id,
      startedAt: Date.now(),
      exercises: (routine?.exerciseIds ?? []).map((exerciseId) => {
        // Pre-fill with what was lifted last time, so logging is mostly tapping ✓.
        const prev = previousSets(s.workouts, exerciseId);
        const sets = prev?.length
          ? prev.map((p) => ({ weight: p.weight, reps: p.reps, done: false }))
          : [0, 1, 2].map(() => ({ weight: 0, reps: 0, done: false }));
        return { exerciseId, sets };
      }),
    };
    return { ...s, active: workout };
  });
}

export function TrainingHome() {
  const routines = useStore((s) => s.routines);
  const workouts = useStore((s) => s.workouts);
  const [editing, setEditing] = useState<Routine | null>(null);

  if (editing) return <RoutineEditor routine={editing} onClose={() => setEditing(null)} />;

  const lastFor = (r: Routine) => workouts.find((w) => w.routineId === r.id);

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Training</h1>
      </header>

      <button className="btn primary block big" onClick={() => startWorkout()}>
        Freies Training starten
      </button>

      <div className="section-head">
        <h2>Meine Routinen</h2>
        <button className="btn ghost accent" onClick={() => setEditing({ id: uid(), name: '', exerciseIds: [] })}>
          + Neu
        </button>
      </div>

      {routines.map((r) => {
        const last = lastFor(r);
        return (
          <div key={r.id} className="card routine">
            <div className="routine-main" onClick={() => setEditing(r)}>
              <strong>{r.name}</strong>
              <span className="muted small">
                {r.exerciseIds.length} Übungen{last ? ` · zuletzt ${fmtDate(last.startedAt)}` : ''}
              </span>
            </div>
            <button className="btn primary" onClick={() => startWorkout(r)}>Start</button>
          </div>
        );
      })}
      {!routines.length && <p className="muted center">Noch keine Routinen. Leg deine erste an!</p>}
    </div>
  );
}

function RoutineEditor({ routine, onClose }: { routine: Routine; onClose: () => void }) {
  const exercises = useStore((s) => s.exercises);
  const exists = useStore((s) => s.routines.some((r) => r.id === routine.id));
  const [name, setName] = useState(routine.name);
  const [ids, setIds] = useState(routine.exerciseIds);
  const [picking, setPicking] = useState(false);
  const nameOf = (id: string) => exercises.find((e) => e.id === id)?.name ?? 'Gelöschte Übung';

  const move = (i: number, d: -1 | 1) => {
    const next = [...ids];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    setIds(next);
  };

  const save = () => {
    const r = { ...routine, name: name.trim() || 'Neue Routine', exerciseIds: ids };
    setState((s) => ({
      ...s,
      routines: exists ? s.routines.map((x) => (x.id === r.id ? r : x)) : [...s.routines, r],
    }));
    onClose();
  };

  const remove = () => {
    if (!confirm(`Routine „${routine.name}“ löschen?`)) return;
    setState((s) => ({ ...s, routines: s.routines.filter((x) => x.id !== routine.id) }));
    onClose();
  };

  return (
    <div className="screen">
      <header className="screen-head row">
        <button className="btn ghost" onClick={onClose}>‹ Zurück</button>
        <button className="btn ghost accent" onClick={save}>Speichern</button>
      </header>
      <input className="title-input" placeholder="Name der Routine" value={name} onChange={(e) => setName(e.target.value)} autoFocus={!exists} />

      {ids.map((id, i) => (
        <div key={id} className="card list-row">
          <span className="num">{i + 1}</span>
          <span className="grow">{nameOf(id)}</span>
          <button className="icon-btn" aria-label="Nach oben" onClick={() => move(i, -1)}>↑</button>
          <button className="icon-btn" aria-label="Nach unten" onClick={() => move(i, 1)}>↓</button>
          <button className="icon-btn danger" aria-label="Entfernen" onClick={() => setIds(ids.filter((x) => x !== id))}>✕</button>
        </div>
      ))}

      <button className="btn outline block" onClick={() => setPicking(true)}>+ Übung hinzufügen</button>
      {exists && <button className="btn ghost danger block" onClick={remove}>Routine löschen</button>}

      {picking && (
        <ExercisePicker
          exclude={ids}
          onClose={() => setPicking(false)}
          onPick={(p) => {
            setIds([...ids, ...p]);
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}
