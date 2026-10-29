import { useState } from 'react';
import { setState, useStore } from '../store';
import type { Workout } from '../types';
import { doneSets, fmtDate, fmtDuration, fmtKg, fmtVolume, volume } from '../util';

export function History() {
  const workouts = useStore((s) => s.workouts);
  const [open, setOpen] = useState<Workout | null>(null);

  if (open) return <WorkoutDetail workout={open} onClose={() => setOpen(null)} />;

  // Group by month for scannability.
  const groups: { label: string; items: Workout[] }[] = [];
  for (const w of workouts) {
    const label = fmtDate(w.startedAt, { month: 'long', year: 'numeric' });
    const g = groups[groups.length - 1];
    if (g?.label === label) g.items.push(w);
    else groups.push({ label, items: [w] });
  }

  return (
    <div className="screen">
      <header className="screen-head"><h1>Verlauf</h1></header>
      {groups.map((g) => (
        <section key={g.label}>
          <h4 className="group-label">{g.label} · {g.items.length} Workouts</h4>
          {g.items.map((w) => (
            <button key={w.id} className="card history-item" onClick={() => setOpen(w)}>
              <div className="row">
                <strong>{w.name}</strong>
                <span className="muted small">{fmtDate(w.startedAt)}</span>
              </div>
              <div className="muted small">
                {fmtDuration((w.finishedAt ?? w.startedAt) - w.startedAt)} · {doneSets(w).length} Sätze · {fmtVolume(volume(w))}
              </div>
            </button>
          ))}
        </section>
      ))}
      {!workouts.length && (
        <div className="empty">
          <div className="flame-big" aria-hidden>🔥</div>
          <p>Noch keine Workouts. Starte dein erstes Training im Tab „Training“.</p>
        </div>
      )}
    </div>
  );
}

function WorkoutDetail({ workout, onClose }: { workout: Workout; onClose: () => void }) {
  const exercises = useStore((s) => s.exercises);
  const remove = () => {
    if (!confirm('Dieses Workout löschen?')) return;
    setState((s) => ({ ...s, workouts: s.workouts.filter((w) => w.id !== workout.id) }));
    onClose();
  };
  return (
    <div className="screen">
      <header className="screen-head row">
        <button className="btn ghost" onClick={onClose}>‹ Verlauf</button>
        <button className="btn ghost danger" onClick={remove}>Löschen</button>
      </header>
      <h1>{workout.name}</h1>
      <p className="muted">
        {fmtDate(workout.startedAt, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} ·{' '}
        {fmtDuration((workout.finishedAt ?? workout.startedAt) - workout.startedAt)} · {fmtVolume(volume(workout))}
      </p>
      {workout.exercises.map((e, i) => (
        <div key={i} className="card">
          <strong>{exercises.find((x) => x.id === e.exerciseId)?.name ?? 'Gelöschte Übung'}</strong>
          {e.sets.map((s, j) => (
            <div key={j} className="row small detail-set">
              <span className="muted">Satz {j + 1}</span>
              <span className="mono">{fmtKg(s.weight)} kg × {s.reps}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
