import { useEffect, useState } from 'react';
import { getState, useStore } from './store';
import { ActiveWorkout, SummarySheet, type Summary } from './screens/ActiveWorkout';
import { Exercises } from './screens/Exercises';
import { History } from './screens/History';
import { More } from './screens/More';
import { Stats } from './screens/Stats';
import { TrainingHome } from './screens/Training';
import { fmtClock } from './util';

type Tab = 'training' | 'history' | 'stats' | 'exercises' | 'more';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'training', label: 'Training', icon: '🔥' },
  { id: 'history', label: 'Verlauf', icon: '🗓' },
  { id: 'stats', label: 'Statistik', icon: '📈' },
  { id: 'exercises', label: 'Übungen', icon: '🏋' },
  { id: 'more', label: 'Mehr', icon: '⋯' },
];

export function App() {
  const [tab, setTab] = useState<Tab>('training');
  const hasActive = useStore((s) => !!s.active);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [restUntil, setRestUntil] = useState<number | null>(null);
  const [, tick] = useState(0);

  useEffect(() => {
    if (!restUntil) return;
    const t = setInterval(() => {
      if (Date.now() >= restUntil) {
        setRestUntil(null);
        navigator.vibrate?.([200, 100, 200]);
      } else tick((n) => n + 1);
    }, 250);
    return () => clearInterval(t);
  }, [restUntil]);

  const startRest = () => {
    const sec = getState().settings.restSeconds;
    if (sec > 0) setRestUntil(Date.now() + sec * 1000);
  };

  const restLeft = restUntil ? Math.max(0, Math.ceil((restUntil - Date.now()) / 1000)) : 0;

  let content;
  switch (tab) {
    case 'training':
      content = hasActive ? (
        <ActiveWorkout onRest={startRest} onFinished={(s) => { setRestUntil(null); setSummary(s); }} />
      ) : (
        <TrainingHome />
      );
      break;
    case 'history': content = <History />; break;
    case 'stats': content = <Stats />; break;
    case 'exercises': content = <Exercises />; break;
    case 'more': content = <More />; break;
  }

  return (
    <div className="app">
      <main>{content}</main>

      {hasActive && tab !== 'training' && !restUntil && (
        <button className="active-banner" onClick={() => setTab('training')}>Workout läuft – zurück zum Training ›</button>
      )}

      {restUntil && (
        <div className="rest-bar" role="timer">
          <span>Pause</span>
          <strong className="mono">{fmtClock(restLeft)}</strong>
          <button className="btn ghost small" onClick={() => setRestUntil((u) => (u ? u + 15_000 : u))}>+15 s</button>
          <button className="btn ghost small" onClick={() => setRestUntil(null)}>Überspringen</button>
        </div>
      )}

      <nav className="tabbar">
        {TABS.map((t) => (
          <button key={t.id} className={tab === t.id ? 'on' : ''} onClick={() => setTab(t.id)}>
            <span className="tab-icon" aria-hidden>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>

      {summary && <SummarySheet summary={summary} onClose={() => setSummary(null)} />}
    </div>
  );
}
