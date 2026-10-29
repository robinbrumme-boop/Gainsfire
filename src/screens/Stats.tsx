import { useMemo, useState } from 'react';
import { LineChart } from '../components/LineChart';
import { useStore } from '../store';
import { exerciseHistory, fmtKg, fmtVolume, pctChange, volume } from '../util';
import { loadDemo } from './More';

type Metric = 'best' | 'maxWeight' | 'volume';
const METRICS: { id: Metric; label: string }[] = [
  { id: 'best', label: 'Geschätztes 1RM' },
  { id: 'maxWeight', label: 'Max. Gewicht' },
  { id: 'volume', label: 'Volumen' },
];

const WEEK = 7 * 86_400_000;

export function Stats() {
  const workouts = useStore((s) => s.workouts);
  const exercises = useStore((s) => s.exercises);
  const [metric, setMetric] = useState<Metric>('best');

  const used = useMemo(() => {
    const counts = new Map<string, number>();
    workouts.forEach((w) => w.exercises.forEach((e) => counts.set(e.exerciseId, (counts.get(e.exerciseId) ?? 0) + 1)));
    return exercises.filter((e) => counts.has(e.id)).sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0));
  }, [workouts, exercises]);

  const [exId, setExId] = useState<string>('');
  const selected = exId || used[0]?.id || '';
  const hist = useMemo(() => exerciseHistory(workouts, selected), [workouts, selected]);

  if (!workouts.length) {
    return (
      <div className="screen">
        <header className="screen-head"><h1>Statistik</h1></header>
        <div className="empty">
          <div className="flame-big" aria-hidden>📈</div>
          <p>Sobald du Workouts eingetragen hast, siehst du hier deinen Fortschritt.</p>
          <button className="btn outline" onClick={loadDemo}>Beispieldaten ansehen</button>
        </div>
      </div>
    );
  }

  const now = Date.now();
  const thisWeek = workouts.filter((w) => w.startedAt > now - WEEK);
  const lastWeek = workouts.filter((w) => w.startedAt <= now - WEEK && w.startedAt > now - 2 * WEEK);
  const volThis = thisWeek.reduce((s, w) => s + volume(w), 0);
  const volLast = lastWeek.reduce((s, w) => s + volume(w), 0);
  const change = pctChange(volThis, volLast);

  const first = hist[0];
  const last = hist[hist.length - 1];
  const gain = first && last ? last[metric] - first[metric] : 0;

  return (
    <div className="screen">
      <header className="screen-head"><h1>Statistik</h1></header>

      <div className="stat-row">
        <div className="stat card"><span className="stat-val">{workouts.length}</span><span className="stat-label">Workouts gesamt</span></div>
        <div className="stat card"><span className="stat-val">{thisWeek.length}</span><span className="stat-label">letzte 7 Tage</span></div>
        <div className="stat card">
          <span className="stat-val">{fmtVolume(volThis)}</span>
          <span className="stat-label">
            Volumen 7 Tage
            {change !== undefined && <em className={change >= 0 ? 'up' : 'down'}> {change >= 0 ? '+' : ''}{change.toFixed(0)} %</em>}
          </span>
        </div>
      </div>

      <div className="card">
        <select className="select" value={selected} onChange={(e) => setExId(e.target.value)} aria-label="Übung">
          {used.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
        <div className="seg">
          {METRICS.map((m) => (
            <button key={m.id} className={metric === m.id ? 'on' : ''} onClick={() => setMetric(m.id)}>{m.label}</button>
          ))}
        </div>
        <LineChart points={hist.map((p) => ({ x: p.date, y: p[metric] }))} />
        {hist.length >= 2 && (
          <p className={`center delta ${gain >= 0 ? 'up' : 'down'}`}>
            {gain >= 0 ? '▲' : '▼'} {fmtKg(Math.abs(gain))} kg seit dem ersten Eintrag ({hist.length} Workouts)
          </p>
        )}
      </div>

      <h2>Bestleistungen</h2>
      <div className="card">
        {used.map((e) => {
          const h = exerciseHistory(workouts, e.id);
          const best = Math.max(...h.map((p) => p.best));
          const maxW = Math.max(...h.map((p) => p.maxWeight));
          return (
            <button key={e.id} className="row record-row" onClick={() => setExId(e.id)}>
              <span className="grow left">{e.name}</span>
              <span className="mono small">{fmtKg(maxW)} kg</span>
              <span className="mono small muted">1RM ≈ {fmtKg(Math.round(best))}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
