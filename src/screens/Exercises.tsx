import { useState } from 'react';
import { NewExerciseForm } from '../components/NewExerciseForm';
import { setState, useStore } from '../store';
import { MUSCLES } from '../types';

export function Exercises() {
  const exercises = useStore((s) => s.exercises);
  const [query, setQuery] = useState('');
  const [adding, setAdding] = useState(false);
  const [created, setCreated] = useState('');

  const q = query.trim().toLowerCase();
  const list = exercises.filter((e) => e.name.toLowerCase().includes(q));
  const customCount = exercises.filter((e) => e.custom).length;

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
      <header className="screen-head">
        <h1>Übungen</h1>
      </header>
      <p className="muted small">{exercises.length} Übungen{customCount ? `, davon ${customCount} eigene` : ''}</p>

      {adding ? (
        <NewExerciseForm
          initialName={query}
          onCancel={() => setAdding(false)}
          onCreated={(id) => {
            setAdding(false);
            setQuery('');
            setCreated(id);
          }}
        />
      ) : (
        <button className="btn primary block" onClick={() => setAdding(true)}>+ Eigene Übung erstellen</button>
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
                <div key={e.id} className={`list-row ${e.id === created ? 'flash' : ''}`}>
                  <span className="grow">{e.name}</span>
                  {e.custom && <span className="tag">eigene</span>}
                  {e.custom && <button className="icon-btn danger" aria-label="Löschen" onClick={() => remove(e.id, e.name)}>✕</button>}
                </div>
              ))}
            </div>
          </section>
        );
      })}
      {!list.length && !adding && (
        <div className="empty">
          <p>Keine Übung „{query}“ gefunden.</p>
          <button className="btn outline" onClick={() => setAdding(true)}>„{query.trim()}“ als eigene Übung erstellen</button>
        </div>
      )}
    </div>
  );
}
