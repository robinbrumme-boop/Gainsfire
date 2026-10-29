import { useMemo, useState } from 'react';
import { useStore } from '../store';
import { MUSCLES } from '../types';

interface Props {
  title?: string;
  exclude?: string[];
  onPick: (ids: string[]) => void;
  onClose: () => void;
}

export function ExercisePicker({ title = 'Übungen hinzufügen', exclude = [], onPick, onClose }: Props) {
  const exercises = useStore((s) => s.exercises);
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<string[]>([]);

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = exercises.filter((e) => !exclude.includes(e.id) && e.name.toLowerCase().includes(q));
    return MUSCLES.map((m) => ({ muscle: m, items: list.filter((e) => e.muscle === m) })).filter((g) => g.items.length);
  }, [exercises, exclude, query]);

  const toggle = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={title}>
        <div className="sheet-head">
          <button className="btn ghost" onClick={onClose}>Abbrechen</button>
          <strong>{title}</strong>
          <button className="btn ghost accent" disabled={!picked.length} onClick={() => onPick(picked)}>
            Fertig{picked.length ? ` (${picked.length})` : ''}
          </button>
        </div>
        <input className="search" placeholder="Suchen…" value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
        <div className="sheet-body">
          {groups.map((g) => (
            <section key={g.muscle}>
              <h4 className="group-label">{g.muscle}</h4>
              {g.items.map((e) => (
                <button key={e.id} className={`list-row pick ${picked.includes(e.id) ? 'on' : ''}`} onClick={() => toggle(e.id)}>
                  <span>{e.name}</span>
                  <span className="check">{picked.includes(e.id) ? '✓' : ''}</span>
                </button>
              ))}
            </section>
          ))}
          {!groups.length && <p className="muted center">Keine Übung gefunden. Eigene Übungen legst du im Tab „Übungen“ an.</p>}
        </div>
      </div>
    </div>
  );
}
