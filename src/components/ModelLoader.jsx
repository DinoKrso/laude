// Shown in the model's zone until the 3D stand is ready. A stand outline fills with gold as it loads.
export default function ModelLoader({ progress, done }) {
  const pct = progress == null ? null : Math.round(progress)
  const fill = pct == null ? 0.18 : Math.max(0.06, pct / 100)
  return (
    <div className={`model-loader${done ? ' is-done' : ''}${pct == null ? ' is-waiting' : ''}`} role="status" aria-live="polite">
      <svg viewBox="0 0 120 170" width="96" height="136" aria-hidden="true">
        <defs>
          <clipPath id="ml-plate"><rect x="25" y="8" width="70" height="128" rx="7" transform="rotate(4 60 72)" /></clipPath>
        </defs>
        <g clipPath="url(#ml-plate)">
          <rect className="ml-fill" x="0" y={136 - 128 * fill} width="120" height="170" />
        </g>
        <rect x="25" y="8" width="70" height="128" rx="7" transform="rotate(4 60 72)" className="ml-line" />
        <rect x="12" y="140" width="96" height="16" rx="5" className="ml-line" />
        <path d="M60 46l3.2 6.6 7.2.9-5.3 5 1.4 7.1L60 62.1l-6.5 3.5 1.4-7.1-5.3-5 7.2-.9z" className="ml-star" />
      </svg>
      <p className="ml-text">{pct == null ? 'Pripremam 3D prikaz…' : `Učitavam 3D model · ${pct}%`}</p>
    </div>
  )
}
