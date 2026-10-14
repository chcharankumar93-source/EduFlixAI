export function Ring({ pct, size = 60, stroke = 5, label }: {
  pct: number;
  size?: number;
  stroke?: number;
  label?: 'kg' | '%';
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(100, pct) / 100) * circ;
  const color = pct >= 70 ? '#22c55e' : pct >= 40 ? '#eab308' : '#ef4444';

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} role="img" aria-label={`${Math.round(pct)}${label === 'kg' ? 'kg' : '%'}`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#333" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color}
          strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <span className="absolute text-white font-bold" style={{ fontSize: size * 0.28 }}>
        {Math.round(pct)}{label === 'kg' ? 'kg' : '%'}
      </span>
    </div>
  );
}
