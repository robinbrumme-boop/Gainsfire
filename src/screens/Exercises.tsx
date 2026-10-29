import { useState } from 'react';
import { setState, useStore } from '../store';
import { MUSCLES, type Muscle } from '../types';
import { uid } from '../util';

export function Exercises() {
  const exercises = useStore((s) => s.exercises);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [muscle, setMuscle] = useState<Muscle>('Brust');

  const q = query.trim().toLowerCase();
  const list = exercises.filter((e) => e.name.toLowerCase().includes(q));

  const add = () => {
    const n = name.trim();
    if (!n) return;
    if (exercises.some((e) => e.name.toLowerCase() === n.toLowerCase())) {
      alert('Diese Übung gibt es schon.');
      return;
    }
    setState((s) => ({ ...s, exercises: [...s.exercises, { id: uid(), name: n, muscle, custom: true }] }));
    setName('');
    setAdding(false);
  };

  const remove = (id: string, n: string) => {
    if (!confirm(`„${n}“ löschen? Sie wird auch aus Routinen entfernt.`)) return;
    setState((s) => ({
      ...s,
      exercises: s.exercises.filter((e) => e.id !== id),
      routines: s.routines.map((r) => ({ ...r, exerciseIds: r.exerciseIds.filter((x) => x !== id) })),
    }));
  };

  return (
    <div className="screen">
      <header className="screen-head row">
        <h1>Übungen</h1>
        <button className="btn ghost accent" onClick={() => setAdding(!adding)}>{adding ? 'Schließen' : '+ Eigene'}</button>
      </header>

      {adding && (
        <div className="card form">
          <input placeholder="Name der Übung" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
          <select className="select" value={muscle} onChange={(e) => setMuscle(e.target.value as Muscle)}>
            {MUSCLES.map((m) => <option key={m}>{m}</option>)}
          </select>
          <button className="btn primary block" onClick={add} disabled={!name.trim()}>Übung anlegen</button>
        </div>
      )}

      <input className="search" placeholder="Suchen…" value={query} onChange={(e) => setQuery(e.target.value)} />

      {MUSCLES.map((m) => {
        const items = list.filter((e) => e.muscle === m);
        if (!items.length) return null;
        return (
          <section key={m}>
            <h4 className="group-label">{m}</h4>
            <div className="card flush">
              {items.map((e) => (
                <div key={e.id} className="list-row">
                  <span className="grow">{e.name}</span>
                  {e.custom && <span className="tag">eigene</span>}
                  {e.custom && <button className="icon-btn danger" aria-label="Löschen" onClick={() => remove(e.id, e.name)}>✕</button>}
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
