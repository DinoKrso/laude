// Scroll-driven state. GSAP tweens `target`; the render loop eases `current` toward it.
export const initial = {
  rot: -0.45, idle: 1, dist: 4.6,
  tx: 0, ty: 0.86, tz: 0,
  logo: 0, text: 0, qr: 0, scan: 0,
  nfc: 0, plate: 1, pulse: 0, glow: 0, lift: 0,
}
export const target = { ...initial }
export const current = { ...initial }

export function resetStory() {
  Object.assign(target, initial)
  Object.assign(current, initial)
}

export const refs = { pivot: null }
export const pointer = { x: 0, y: 0 }
// which colour/shape variant the current scroll chapter wants (discrete, not tweened)
export const wanted = { variant: 0, cycle: false } // cycle = auto-rotate through variants (hero only)
