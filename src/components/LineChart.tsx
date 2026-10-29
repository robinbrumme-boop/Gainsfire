import { fmtDate, fmtKg } from '../util';

interface Props {
  points: { x: number; y: number }[];
  unit?: string;
}

const W = 340;
const H = 160;
const PAD = { l: 8, r: 8, t: 16, b: 22 };

export function LineChart({ points, unit = 'kg' }: Props) {
  if (points.length < 2) {
    return <p className="muted center chart-empty">Mindestens zwei Workouts nötig, um einen Verlauf zu zeigen.</p>;
  }
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)];
  let [y0, y1] = [Math.min(...ys), Math.max(...ys)];
  if (y0 === y1) [y0, y1] = [y0 - 1, y1 + 1];
  const px = (x: number) => PAD.l + ((x - x0) / (x1 - x0 || 1)) * (W - PAD.l - PAD.r);
  const py = (y: number) => PAD.t + (1 - (y - y0) / (y1 - y0)) * (H - PAD.t - PAD.b);
  const path = points.map((p, i) => `${i ? 'L' : 'M'}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');
  const area = `${path} L${px(x1)},${H - PAD.b} L${px(x0)},${H - PAD.b} Z`;
  const last = points[points.length - 1];

  return (
    <svg className="chart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Verlauf">
      <defs>
        <linearGradient id="fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line x1={PAD.l} x2={W - PAD.r} y1={py(y1)} y2={py(y1)} className="grid" />
      <line x1={PAD.l} x2={W - PAD.r} y1={py(y0)} y2={py(y0)} className="grid" />
      <text x={W - PAD.r} y={py(y1) - 4} textAnchor="end" className="axis">{fmtKg(y1)} {unit}</text>
      <text x={W - PAD.r} y={py(y0) - 4} textAnchor="end" className="axis">{fmtKg(y0)} {unit}</text>
      <path d={area} fill="url(#fill)" />
      <path d={path} fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {points.map((p, i) => (
        <circle key={i} cx={px(p.x)} cy={py(p.y)} r={i === points.length - 1 ? 4.5 : 2.5} fill="var(--accent)" />
      ))}
      <text x={PAD.l} y={H - 6} className="axis">{fmtDate(x0, { day: 'numeric', month: 'short' })}</text>
      <text x={px(last.x)} y={H - 6} textAnchor="end" className="axis">{fmtDate(x1, { day: 'numeric', month: 'short' })}</text>
    </svg>
  );
}
