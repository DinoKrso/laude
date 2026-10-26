// Decided once at startup: touch phones/tablets get a lighter renderer and native scrolling.
const mq = (q) => typeof window !== 'undefined' && window.matchMedia(q).matches

export const isTouch = mq('(hover: none), (pointer: coarse)')
export const isSmallScreen = typeof window !== 'undefined' && Math.min(window.innerWidth, window.innerHeight) < 700
export const lowPower = isTouch || isSmallScreen
