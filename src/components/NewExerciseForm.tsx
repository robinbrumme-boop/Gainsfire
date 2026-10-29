import { useState } from 'react';
import { addCustomExercise } from '../store';
import { MUSCLES, type Muscle } from '../types';

interface Props {
  initialName?: string;
  onCreated: (id: string) => void;
  onCancel?: () => void;
}

export function NewExerciseForm({ initialName = '', onCreated, onCancel }: Props) {
  const [name, setName] = useState(initialName);
  const [muscle, setMuscle] = useState<Muscle>('Brust');
  const [error, setError] = useState('');

  const submit = () => {
    const res = addCustomExercise(name, muscle);
    if ('error' in res) setError(res.error);
    else onCreated(res.id);
  };

  return (
    <form className="card form" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <strong>Eigene Übung erstellen</strong>
      <input
        placeholder="Name, z. B. Kabelzug einarmig" value={name} autoFocus
        onChange={(e) => { setName(e.target.value); setError(''); }}
      />
      <div className="chips" role="radiogroup" aria-label="Muskelgruppe">
        {MUSCLES.map((m) => (
          <button type="button" key={m} role="radio" aria-checked={muscle === m} className={`chip ${muscle === m ? 'on' : ''}`} onClick={() => setMuscle(m)}>
            {m}
          </button>
        ))}
      </div>
      {error && <p className="danger small">{error}</p>}
      <div className="row">
        {onCancel && <button type="button" className="btn ghost" onClick={onCancel}>Abbrechen</button>}
        <button type="submit" className="btn primary grow" disabled={!name.trim()}>Übung anlegen</button>
      </div>
    </form>
  );
}
