import { useEffect, useState } from 'react';
import { ExercisePicker } from '../components/ExercisePicker';
import { getState, setState, useStore } from '../store';
import type { SetEntry, Workout } from '../types';
import { doneSets, e1rm, fmtClock, fmtKg, fmtVolume, pctChange, previousSets, volume } from '../util';

export interface Summary {
  workout: Workout;
  previous?: Workout;
  records: string[];
}

interface Props {
  onRest: () => void;
  onFinished: (s: Summary) => void;
}

export function ActiveWorkout({ onRest, onFinished }: Props) {
  const active = useStore((s) => s.active)!;
  const exercises = useStore((s) => s.exercises);
  const history = useStore((s) => s.workouts);
  const [picking, setPicking] = useState(false);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const update = (fn: (w: Workout) => Workout) => setState((s) => (s.active ? { ...s, active: fn(s.active) } : s));

  const updateSet = (ei: number, si: number, patch: Partial<SetEntry>) =>
    update((w) => ({
      ...w,
      exercises: w.exercises.map((e, i) =>
        i !== ei ? e : { ...e, sets: e.sets.map((st, j) => (j === si ? { ...st, ...patch } : st)) },
      ),
    }));

  const addSet = (ei: number) =>
    update((w) => ({
      ...w,
      exercises: w.exercises.map((e, i) => {
        if (i !== ei) return e;
        const last = e.sets[e.sets.length - 1];
        return { ...e, sets: [...e.sets, { weight: last?.weight ?? 0, reps: last?.reps ?? 0, done: false }] };
      }),
    }));

  const removeSet = (ei: number, si: number) =>
    update((w) => ({
      ...w,
      exercises: w.exercises.map((e, i) => (i !== ei ? e : { ...e, sets: e.sets.filter((_, j) => j !== si) })),
    }));

  const removeExercise = (ei: number) => update((w) => ({ ...w, exercises: w.exercises.filter((_, i) => i !== ei) }));

  const toggleDone = (ei: number, si: number, set: SetEntry) => {
    updateSet(ei, si, { done: !set.done });
    if (!set.done) onRest();
  };

  const finish = () => {
    const s = getState();
    const w = s.active!;
    const cleaned: Workout = {
      ...w,
      finishedAt: Date.now(),
      exercises: w.exercises.map((e) => ({ ...e, sets: e.sets.filter((x) => x.done) })).filter((e) => e.sets.length),
    };
    if (!cleaned.exercises.length) {
      if (confirm('Noch kein Satz abgehakt. Workout verwerfen?')) setState((st) => ({ ...st, active: undefined }));
      return;
    }
    const previous = s.workouts.find((x) => (w.routineId ? x.routineId === w.routineId : !x.routineId));
    const records = cleaned.exercises
      .filter((e) => {
        const best = Math.max(...e.sets.map((x) => e1rm(x.weight, x.reps)));
        const before = s.workouts.flatMap((x) => x.exercises.filter((y) => y.exerciseId === e.exerciseId).flatMap((y) => y.sets));
        return before.length > 0 && best > Math.max(...before.map((x) => e1rm(x.weight, x.reps)));
      })
      .map((e) => s.exercises.find((x) => x.id === e.exerciseId)?.name ?? '');
    setState((st) => ({ ...st, active: undefined, workouts: [cleaned, ...st.workouts] }));
    onFinished({ workout: cleaned, previous, records });
  };

  const cancel = () => {
    if (confirm('Workout abbrechen? Die Eingaben gehen verloren.')) setState((s) => ({ ...s, active: undefined }));
  };

  const elapsed = Math.floor((now - active.startedAt) / 1000);
  const done = doneSets(active).length;

  return (
    <div className="screen">
      <header className="screen-head row sticky">
        <button className="btn ghost danger" onClick={cancel}>Abbrechen</button>
        <div className="center-col">
          <strong>{active.name}</strong>
          <span className="muted small mono">{fmtClock(elapsed)} · {done} Sätze · {fmtVolume(volume(active))}</span>
        </div>
        <button className="btn primary" onClick={finish}>Fertig</button>
      </header>

      {active.exercises.map((e, ei) => {
        const ex = exercises.find((x) => x.id === e.exerciseId);
        const prev = previousSets(history, e.exerciseId);
        return (
          <div key={`${e.exerciseId}-${ei}`} className="card exercise">
            <div className="exercise-head">
              <strong>{ex?.name ?? 'Übung'}</strong>
              <button className="icon-btn danger" aria-label="Übung entfernen" onClick={() => removeExercise(ei)}>✕</button>
            </div>
            <div className="set-grid head">
              <span>Satz</span>
              <span>Letztes Mal</span>
              <span>kg</span>
              <span>Wdh.</span>
              <span />
            </div>
            {e.sets.map((st, si) => (
              <div key={si} className={`set-grid ${st.done ? 'done' : ''}`}>
                <button className="set-no" onClick={() => removeSet(ei, si)} aria-label={`Satz ${si + 1} löschen`}>{si + 1}</button>
                <span className="muted small">{prev?.[si] ? `${fmtKg(prev[si].weight)} × ${prev[si].reps}` : '–'}</span>
                <input
                  type="number" inputMode="decimal" step="0.5" min="0" aria-label="Gewicht"
                  value={st.weight || ''} placeholder="0"
                  onChange={(ev) => updateSet(ei, si, { weight: Math.max(0, Number(ev.target.value) || 0) })}
                />
                <input
                  type="number" inputMode="numeric" step="1" min="0" aria-label="Wiederholungen"
                  value={st.reps || ''} placeholder="0"
                  onChange={(ev) => updateSet(ei, si, { reps: Math.max(0, Math.floor(Number(ev.target.value) || 0)) })}
                />
                <button className={`check-btn ${st.done ? 'on' : ''}`} aria-label="Satz erledigt" onClick={() => toggleDone(ei, si, st)}>✓</button>
              </div>
            ))}
            <button className="btn ghost accent block small" onClick={() => addSet(ei)}>+ Satz</button>
          </div>
        );
      })}

      <button className="btn outline block" onClick={() => setPicking(true)}>+ Übung hinzufügen</button>
      <p className="muted small center">Tipp: Auf die Satznummer tippen, um einen Satz zu löschen.</p>

      {picking && (
        <ExercisePicker
          onClose={() => setPicking(false)}
          onPick={(ids) => {
            const s = getState();
            update((w) => ({
              ...w,
              exercises: [
                ...w.exercises,
                ...ids.map((exerciseId) => {
                  const p = previousSets(s.workouts, exerciseId);
                  return {
                    exerciseId,
                    sets: p?.length
                      ? p.map((x) => ({ weight: x.weight, reps: x.reps, done: false }))
                      : [0, 1, 2].map(() => ({ weight: 0, reps: 0, done: false })),
                  };
                }),
              ],
            }));
            setPicking(false);
          }}
        />
      )}
    </div>
  );
}

export function SummarySheet({ summary, onClose }: { summary: Summary; onClose: () => void }) {
  const { workout, previous, records } = summary;
  const vol = volume(workout);
  const prevVol = previous ? volume(previous) : 0;
  const change = pctChange(vol, prevVol);
  const dur = (workout.finishedAt ?? Date.now()) - workout.startedAt;

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet summary" onClick={(e) => e.stopPropagation()} role="dialog" aria-label="Zusammenfassung">
        <div className="flame-big" aria-hidden>🔥</div>
        <h2 className="center">Stark! {workout.name} erledigt</h2>
        <div className="stat-row">
          <div className="stat"><span className="stat-val">{Math.round(dur / 60_000)}</span><span className="stat-label">Minuten</span></div>
          <div className="stat"><span className="stat-val">{doneSets(workout).length}</span><span className="stat-label">Sätze</span></div>
          <div className="stat"><span className="stat-val">{fmtVolume(vol)}</span><span className="stat-label">Volumen</span></div>
        </div>
        {change !== undefined && (
          <p className={`center delta ${change >= 0 ? 'up' : 'down'}`}>
            {change >= 0 ? '▲' : '▼'} {Math.abs(change).toFixed(0)} % Volumen gegenüber dem letzten Mal
          </p>
        )}
        {records.length > 0 && (
          <div className="records">
            <strong>Neue Bestleistungen</strong>
            {records.map((r) => <div key={r}>🏆 {r}</div>)}
          </div>
        )}
        <button className="btn primary block big" onClick={onClose}>Weiter</button>
      </div>
    </div>
  );
}
