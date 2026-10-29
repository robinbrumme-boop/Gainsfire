import { useRef } from 'react';
import { demoWorkouts, initialState } from '../seed';
import { getState, isValidState, replaceState, setState, useStore } from '../store';

export function loadDemo() {
  const s = getState();
  if (s.workouts.length && !confirm('Beispieldaten zu deinen Workouts hinzufügen?')) return;
  setState((st) => ({ ...st, workouts: [...demoWorkouts(st), ...st.workouts].sort((a, b) => b.startedAt - a.startedAt) }));
}

export function More() {
  const rest = useStore((s) => s.settings.restSeconds);
  const count = useStore((s) => s.workouts.length);
  const fileRef = useRef<HTMLInputElement>(null);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(getState(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `flamelog-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const importData = async (file: File) => {
    try {
      const data = JSON.parse(await file.text());
      if (!isValidState(data)) throw new Error('invalid');
      if (confirm(`Backup mit ${data.workouts.length} Workouts laden? Aktuelle Daten werden ersetzt.`)) replaceState(data);
    } catch {
      alert('Die Datei ist kein gültiges FlameLog-Backup.');
    }
  };

  return (
    <div className="screen">
      <header className="screen-head"><h1>Mehr</h1></header>

      <h4 className="group-label">Training</h4>
      <div className="card">
        <label className="row">
          <span>Pausentimer</span>
          <select
            className="select inline"
            value={rest}
            onChange={(e) => setState((s) => ({ ...s, settings: { ...s.settings, restSeconds: Number(e.target.value) } }))}
          >
            {[0, 30, 60, 90, 120, 150, 180, 240].map((n) => (
              <option key={n} value={n}>{n ? `${n} s` : 'aus'}</option>
            ))}
          </select>
        </label>
      </div>

      <h4 className="group-label">Daten ({count} Workouts, nur auf diesem Gerät gespeichert)</h4>
      <div className="card flush">
        <button className="list-row" onClick={exportData}>Backup exportieren (JSON)</button>
        <button className="list-row" onClick={() => fileRef.current?.click()}>Backup importieren</button>
        <button className="list-row" onClick={loadDemo}>Beispieldaten laden</button>
        <button
          className="list-row danger"
          onClick={() => confirm('Wirklich alle Daten löschen?') && replaceState(initialState())}
        >
          Alle Daten zurücksetzen
        </button>
      </div>
      <input
        ref={fileRef} type="file" accept="application/json,.json" hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) importData(f);
          e.target.value = '';
        }}
      />

      <h4 className="group-label">Auf dem Handy installieren</h4>
      <div className="card small">
        <p><strong>iPhone:</strong> In Safari auf „Teilen“ tippen → „Zum Home-Bildschirm“.</p>
        <p><strong>Android:</strong> In Chrome auf ⋮ tippen → „App installieren“ bzw. „Zum Startbildschirm hinzufügen“.</p>
      </div>
      <p className="muted small center">FlameLog 0.1 · funktioniert auch offline</p>
    </div>
  );
}
