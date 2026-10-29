import { useState } from 'react';
import { ExercisePicker } from '../components/ExercisePicker';
import { setState, useStore } from '../store';
import type { Routine, RoutineItem, State, Workout } from '../types';
import { fmtDate, prefillSets, preferredOption, setRange, uid, weekStart } from '../util';

export function startWorkout(routine?: Routine) {
  setState((s) => {
    const own = s.workouts.filter((w) => w.routineId === routine?.id);
    const workout: Workout = {
      id: uid(),
      name: routine?.name ?? 'Freies Training',
      routineId: routine?.id,
      startedAt: Date.now(),
      // Pre-fill with what was lifted last time, so logging is mostly tapping ✓.
      exercises: (routine?.items ?? []).map((it) => {
        const exerciseId = preferredOption(own, it.options);
        return {
          exerciseId,
          label: it.label,
          options: it.options.length > 1 ? it.options : undefined,
          target: setRange(it.sets, it.setsMax),
          sets: prefillSets(s.workouts, exerciseId, it.sets),
        };
      }),
    };
    return { ...s, active: workout };
  });
}

export function totalSets(r: Routine) {
  const min = r.items.reduce((n, it) => n + it.sets, 0);
  const max = r.items.reduce((n, it) => n + Math.max(it.sets, it.setsMax ?? 0), 0);
  return setRange(min, max);
}

/** The routine that is due next in the weekly rotation. */
export function nextInPlan(s: Pick<State, 'plan' | 'routines' | 'workouts'>): Routine | undefined {
  const ids = s.plan.routineIds.filter((id) => s.routines.some((r) => r.id === id));
  if (!ids.length) return undefined;
  const last = s.workouts.find((w) => w.routineId && ids.includes(w.routineId));
  const next = last ? ids[(ids.indexOf(last.routineId!) + 1) % ids.length] : ids[0];
  return s.routines.find((r) => r.id === next);
}

export function TrainingHome() {
  const routines = useStore((s) => s.routines);
  const workouts = useStore((s) => s.workouts);
  const plan = useStore((s) => s.plan);
  const [editing, setEditing] = useState<Routine | null>(null);

  if (editing) return <RoutineEditor routine={editing} onClose={() => setEditing(null)} />;

  const lastFor = (r: Routine) => workouts.find((w) => w.routineId === r.id);
  const planRoutines = plan.routineIds.map((id) => routines.find((r) => r.id === id)).filter((r): r is Routine => !!r);
  const next = nextInPlan({ plan, routines, workouts });
  const thisWeek = workouts.filter((w) => w.startedAt >= weekStart(Date.now()));
  const perRoutine = planRoutines.length ? Math.ceil(plan.perWeek / planRoutines.length) : 0;

  return (
    <div className="screen">
      <header className="screen-head">
        <h1>Training</h1>
      </header>

      {planRoutines.length > 0 && (
        <div className="card week">
          <div className="row">
            <strong>Diese Woche</strong>
            <span className="muted small">{thisWeek.length} von {plan.perWeek} Trainings</span>
          </div>
          <div className="week-dots" aria-hidden>
            {Array.from({ length: Math.max(plan.perWeek, thisWeek.length) }, (_, i) => (
              <span key={i} className={i < thisWeek.length ? 'on' : ''} />
            ))}
          </div>
          <div className="muted small">
            {planRoutines.map((r) => `${r.name} ${thisWeek.filter((w) => w.routineId === r.id).length}/${perRoutine}`).join(' · ')}
          </div>
        </div>
      )}

      {next ? (
        <button className="btn primary block big next-btn" onClick={() => startWorkout(next)}>
          <span className="next-label">Als Nächstes</span>
          <span>{next.name} starten</span>
          <span className="next-sub">{next.items.length} Übungen · {totalSets(next)} Sätze</span>
        </button>
      ) : null}
      <button className={`btn block ${next ? 'outline' : 'primary big'}`} onClick={() => startWorkout()}>
        Freies Training starten
      </button>

      <div className="section-head">
        <h2>Meine Routinen</h2>
        <button className="btn ghost accent" onClick={() => setEditing({ id: uid(), name: '', items: [] })}>
          + Neu
        </button>
      </div>

      {routines.map((r) => {
        const last = lastFor(r);
        return (
          <div key={r.id} className="card routine">
            <div className="routine-main" onClick={() => setEditing(r)}>
              <strong>
                {r.name} {plan.routineIds.includes(r.id) && <span className="tag">Wochenplan</span>}
              </strong>
              <span className="muted small">
                {r.items.length} Übungen · {totalSets(r)} Sätze{last ? ` · zuletzt ${fmtDate(last.startedAt)}` : ''}
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

function Stepper({ value, min, onChange, label }: { value: number; min: number; onChange: (n: number) => void; label: string }) {
  return (
    <span className="stepper" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label={`${label} weniger`}>−</button>
      <span className="mono">{value}</span>
      <button type="button" onClick={() => onChange(Math.min(20, value + 1))} aria-label={`${label} mehr`}>+</button>
    </span>
  );
}

function RoutineEditor({ routine, onClose }: { routine: Routine; onClose: () => void }) {
  const exercises = useStore((s) => s.exercises);
  const exists = useStore((s) => s.routines.some((r) => r.id === routine.id));
  const inPlanNow = useStore((s) => s.plan.routineIds.includes(routine.id));
  const [name, setName] = useState(routine.name);
  const [items, setItems] = useState<RoutineItem[]>(routine.items);
  const [inPlan, setInPlan] = useState(inPlanNow);
  // null: closed; 'new': add slots; otherwise the slot id getting another variant.
  const [picking, setPicking] = useState<string | null>(null);
  const nameOf = (id: string) => exercises.find((e) => e.id === id)?.name ?? 'Gelöschte Übung';

  const patch = (id: string, p: Partial<RoutineItem>) => setItems(items.map((it) => (it.id === id ? { ...it, ...p } : it)));

  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    setItems(next);
  };

  const save = () => {
    const r: Routine = { ...routine, name: name.trim() || 'Neue Routine', items };
    setState((s) => {
      const ids = s.plan.routineIds.filter((id) => id !== r.id);
      const at = s.plan.routineIds.indexOf(r.id);
      if (inPlan) ids.splice(at >= 0 ? at : ids.length, 0, r.id);
      return {
        ...s,
        routines: exists ? s.routines.map((x) => (x.id === r.id ? r : x)) : [...s.routines, r],
        plan: { ...s.plan, routineIds: ids },
      };
    });
    onClose();
  };

  const remove = () => {
    if (!confirm(`Routine „${routine.name}“ löschen?`)) return;
    setState((s) => ({
      ...s,
      routines: s.routines.filter((x) => x.id !== routine.id),
      plan: { ...s.plan, routineIds: s.plan.routineIds.filter((id) => id !== routine.id) },
    }));
    onClose();
  };

  const slot = items.find((it) => it.id === picking);

  return (
    <div className="screen">
      <header className="screen-head row">
        <button className="btn ghost" onClick={onClose}>‹ Zurück</button>
        <button className="btn ghost accent" onClick={save}>Speichern</button>
      </header>
      <input className="title-input" placeholder="Name der Routine" value={name} onChange={(e) => setName(e.target.value)} autoFocus={!exists} />
      <label className="row toggle-row">
        <span>Im Wochenplan (wird abwechselnd vorgeschlagen)</span>
        <input type="checkbox" checked={inPlan} onChange={(e) => setInPlan(e.target.checked)} />
      </label>
      <p className="muted small">{items.length} Übungen · {totalSets({ ...routine, items })} Sätze</p>

      {items.map((it, i) => (
        <div key={it.id} className="card slot">
          <div className="row">
            <span className="num">{i + 1}</span>
            <input
              className="slot-label grow" value={it.label ?? ''} placeholder={nameOf(it.options[0])}
              onChange={(e) => patch(it.id, { label: e.target.value || undefined })} aria-label="Bezeichnung"
            />
            <button className="icon-btn" aria-label="Nach oben" onClick={() => move(i, -1)}>↑</button>
            <button className="icon-btn" aria-label="Nach unten" onClick={() => move(i, 1)}>↓</button>
            <button className="icon-btn danger" aria-label="Entfernen" onClick={() => setItems(items.filter((x) => x.id !== it.id))}>✕</button>
          </div>
          <div className="row slot-sets">
            <span className="muted small">Sätze</span>
            <Stepper label="Sätze" value={it.sets} min={1} onChange={(n) => patch(it.id, { sets: n, setsMax: it.setsMax && it.setsMax > n ? it.setsMax : undefined })} />
            <span className="muted small">bis</span>
            <Stepper label="Maximal" value={Math.max(it.sets, it.setsMax ?? 0)} min={it.sets} onChange={(n) => patch(it.id, { setsMax: n > it.sets ? n : undefined })} />
          </div>
          <div className="chips">
            {it.options.map((id, k) => (
              <span key={id} className={`chip ${k === 0 ? 'on' : ''}`}>
                <button type="button" onClick={() => patch(it.id, { options: [id, ...it.options.filter((x) => x !== id)] })} title="Als Standard setzen">
                  {nameOf(id)}
                </button>
                {it.options.length > 1 && (
                  <button type="button" className="chip-x" aria-label={`${nameOf(id)} entfernen`} onClick={() => patch(it.id, { options: it.options.filter((x) => x !== id) })}>✕</button>
                )}
              </span>
            ))}
            <button type="button" className="chip add" onClick={() => setPicking(it.id)}>+ Variante</button>
          </div>
        </div>
      ))}
      {items.some((it) => it.options.length > 1) && (
        <p className="muted small">Die markierte Variante ist Standard. Im Training kannst du jederzeit wechseln; die App merkt sich deine letzte Wahl.</p>
      )}

      <button className="btn outline block" onClick={() => setPicking('new')}>+ Übung hinzufügen</button>
      {exists && <button className="btn ghost danger block" onClick={remove}>Routine löschen</button>}

      {picking && (
        <ExercisePicker
          title={slot ? 'Varianten hinzufügen' : 'Übungen hinzufügen'}
          exclude={slot ? slot.options : []}
          onClose={() => setPicking(null)}
          onPick={(ids) => {
            if (slot) patch(slot.id, { options: [...slot.options, ...ids] });
            else setItems([...items, ...ids.map((id) => ({ id: uid(), options: [id], sets: 3 }))]);
            setPicking(null);
          }}
        />
      )}
    </div>
  );
}
