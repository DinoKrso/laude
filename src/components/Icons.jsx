const common = { width: 28, height: 28, viewBox: '0 0 28 28', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, 'aria-hidden': true }

export function VenueIcon({ name }) {
  switch (name) {
    case 'cup':
      return <svg {...common}><path d="M5 11h15v6a6 6 0 0 1-6 6h-3a6 6 0 0 1-6-6z" /><path d="M20 13h1.5a3 3 0 0 1 0 6H19" /><path d="M10 4c-1 1.5 1 2.5 0 4M14 4c-1 1.5 1 2.5 0 4" /></svg>
    case 'hotel':
      return <svg {...common}><path d="M4 23V9l10-5 10 5v14" /><path d="M9 23v-6h10v6" /><path d="M4 23h20" /><path d="M10 12h2M16 12h2" /></svg>
    case 'scissors':
      return <svg {...common}><circle cx="8" cy="20" r="3.2" /><circle cx="20" cy="20" r="3.2" /><path d="M10.5 18 21 5M17.5 18 7 5" /></svg>
    default:
      return <svg {...common}><rect x="4" y="7" width="20" height="15" rx="2.5" /><path d="M10 7V5h8v2" /><path d="M14 11v7M10.5 14.5h7" /></svg>
  }
}

export function Logo() {
  return (
    <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden="true">
      <rect x="5" y="2" width="16" height="22" rx="3.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <path d="M13 7.2l1.3 2.7 3 .4-2.2 2.1.5 3-2.6-1.4-2.6 1.4.5-3-2.2-2.1 3-.4z" fill="#f2b544" />
    </svg>
  )
}
