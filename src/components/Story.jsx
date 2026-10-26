import { lazy, Suspense, useCallback, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { CHAPTERS } from '../content'
import { isTouch } from '../three/device'
import { target as S, resetStory, wanted } from '../three/story'

gsap.registerPlugin(ScrollTrigger)
const StandScene = lazy(() => import('../three/StandScene'))

function canPin() {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

function Chapter({ c, i, innerRef }) {
  const Title = c.hero ? 'h1' : 'h2'
  return (
    <article className="chapter" data-i={i} ref={innerRef}>
      {c.hero && <div className="stars" aria-hidden="true"><i /><i /><i /><i /><i /></div>}
      {c.eyebrow && <p className="eyebrow">{c.eyebrow}</p>}
      <Title>{c.title.map((l, k) => <span key={k}>{l}{k < c.title.length - 1 && <br />}</span>)}</Title>
      {c.lead && <p className="lead">{c.lead}</p>}
      {c.body && <p className="body">{c.body}</p>}
      {c.chips && (
        <div className="spec">
          {c.chips.map(([k, v]) => <span className="chip" key={k}>{k} <b>{v}</b></span>)}
        </div>
      )}
      {(c.hero || c.cta) && (
        <div className="hero-ctas">
          <a className="btn btn-gold" href="#ponuda">Zatraži ponudu</a>
          {c.hero && <a className="btn btn-ghost" href="#za-koga">Za koga je</a>}
        </div>
      )}
    </article>
  )
}

export default function Story() {
  const [pinned] = useState(canPin)
  const [focus, setFocus] = useState(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const [inView, setInView] = useState(true)
  const root = useRef(null)
  const chapterRefs = useRef([])
  const onReady = useCallback((f) => setFocus(f), [])
  // 3D download counts for 15-95% of the page loader; fonts and app code cover the rest
  const onProgress = useCallback((p) => window.__preloader?.progress(15 + p * 0.8), [])

  // Lift the page loader once fonts are in and, when the 3D story runs, the model is ready.
  useLayoutEffect(() => {
    const pl = window.__preloader
    if (!pl || pl.finished) return
    if (pinned && !focus) { pl.progress(12); return }
    let alive = true
    const fonts = document.fonts?.ready ?? Promise.resolve()
    Promise.race([fonts, new Promise((r) => setTimeout(r, 2500))]).then(() => {
      if (!alive) return
      // two frames so the first 3D frame is on screen before the curtain lifts
      requestAnimationFrame(() => requestAnimationFrame(() => { ScrollTrigger.refresh(); pl.done() }))
    })
    return () => { alive = false }
  }, [pinned, focus])

  // Stop rendering the 3D scene once the story section is off screen.
  useLayoutEffect(() => {
    if (!pinned) return
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin: '200px 0px' })
    io.observe(root.current)
    return () => io.disconnect()
  }, [pinned])

  // Phones: reserve exactly as much room for text as the tallest chapter needs; the model gets the rest.
  useLayoutEffect(() => {
    if (!pinned) return
    const measure = () => {
      const h = Math.max(...chapterRefs.current.map((el) => el?.offsetHeight || 0))
      root.current?.style.setProperty('--text-h', `${Math.ceil(h)}px`)
    }
    measure()
    const ro = new ResizeObserver(measure)
    chapterRefs.current.forEach((el) => el && ro.observe(el))
    document.fonts?.ready.then(measure)
    return () => ro.disconnect()
  }, [pinned])

  useLayoutEffect(() => {
    if (!pinned || !focus) return
    resetStory()
    wanted.variant = 0
    wanted.cycle = true
    const ch = chapterRefs.current
    let cleanupSnap = null
    const ctx = gsap.context(() => {
      ch.forEach((el, i) => i && gsap.set(el, { autoAlpha: 0, y: 40 }))
      // Rest points: where each chapter is fully settled. Scrolling snaps to these.
      const REST = { hero: 0, logo: 1.4, qr: 3.7, nfc: 5.6, base: 8.8, final: 10.6, end: 11.3 }
      const snapPoints = Object.values(REST).map((t) => t / REST.end)
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut', duration: 1 },
        scrollTrigger: {
          trigger: root.current, start: 'top top', end: 'bottom bottom', scrub: 0.5, invalidateOnRefresh: true,
          // phones scroll natively, so GSAP snaps there; desktop snapping goes through Lenis below
          snap: isTouch ? { snapTo: snapPoints, directional: true, duration: { min: 0.35, max: 0.9 }, delay: 0.12, ease: 'power2.inOut', inertia: false } : false,
          onUpdate: (self) => {
            // chapter by where the scroll is (not where the scrub has caught up to)
            const t = self.progress * REST.end
            const i = t < 0.7 ? 0 : t < 2.5 ? 1 : t < 4.7 ? 2 : t < 6.7 ? 3 : t < 9.7 ? 4 : 5
            wanted.cycle = i === 0
            if (i !== activeRef.current) { activeRef.current = i; setActive(i) }
          },
        },
      })
      const at = (v) => ({ tx: v.x, ty: v.y, tz: v.z })
      // cross-fade: the next text starts coming in while the previous one leaves, so there is never an empty frame
      const show = (i, t) => {
        tl.to(ch[i - 1], { autoAlpha: 0, y: -32, duration: 0.45, ease: 'power2.in' }, t)
        tl.to(ch[i], { autoAlpha: 1, y: 0, duration: 0.6, ease: 'power2.out' }, t + 0.3)
      }
      // 1 logo lifts out of the plate
      tl.to(S, { ...at(focus.logo), dist: 2.35, rot: -0.32, idle: 0, logo: 16, text: 6 }, 0.2); show(1, 0.2)
      // 2 QR lifts, scan line sweeps
      tl.to(S, { ...at(focus.qr), dist: 2.45, rot: 0.28, logo: 0, text: 0, qr: 12, duration: 1.2 }, 2.0); show(2, 2.0)
      tl.to(S, { scan: 1, duration: 1, ease: 'none' }, 2.6)
      // 3 NFC: plate turns glassy, chip slides out, tap pulses
      tl.to(S, { ...at(focus.nfc), dist: 2.7, rot: -0.5, qr: 0, scan: 0, plate: 0.22, nfc: 22, pulse: 1, glow: 1, duration: 1.2 }, 4.2); show(3, 4.2)
      // 4 base: side view, plate lifts out of the slot and drops back
      tl.to(S, { ...at(focus.all), dist: 4.7, rot: 1.15, plate: 1, nfc: 0, pulse: 0, glow: 0 }, 6.2); show(4, 6.2)
      tl.to(S, { lift: 38, duration: 0.8, ease: 'power2.out' }, 7.2).to(S, { lift: 0, duration: 0.8, ease: 'power2.in' }, 8.0)
      // 5 final turn
      tl.to(S, { ...at(focus.all), dist: 4.5, rot: Math.PI * 2 - 0.4, duration: 1.3 }, 9.2); show(5, 9.2)
      tl.to({}, { duration: REST.end - 10.5 }, 10.5)

      // Desktop: Lenis owns wheel scrolling, so snap through Lenis once the wheel stops
      const lenis = window.__lenis
      if (lenis && !isTouch) {
        const st = tl.scrollTrigger
        let dir = 1, timer = 0, release = 0, snapping = false
        const snap = () => {
          const p = st.progress
          if (p <= 0.0005 || p >= 0.9995 || snapping) return
          const eps = 0.006
          const target = dir > 0 ? snapPoints.find((x) => x >= p - eps) : [...snapPoints].reverse().find((x) => x <= p + eps)
          if (target == null) return
          const y = st.start + (st.end - st.start) * target
          const dist = Math.abs(y - window.scrollY)
          if (dist < 2) return
          snapping = true
          const dur = Math.min(1.1, 0.45 + dist / 1800)
          clearTimeout(release)
          release = setTimeout(() => { snapping = false }, dur * 1000 + 200) // also frees it if the user takes over mid-snap
          lenis.scrollTo(y, {
            duration: dur,
            easing: (x) => 1 - Math.pow(1 - x, 3),
            onComplete: () => { snapping = false },
          })
        }
        const onScroll = (e) => {
          if (e.direction) dir = e.direction
          clearTimeout(timer)
          if (!snapping) timer = setTimeout(snap, 140)
        }
        const off = lenis.on('scroll', onScroll)
        cleanupSnap = () => { clearTimeout(timer); clearTimeout(release); off?.() }
      }
    }, root)
    return () => { cleanupSnap?.(); ctx.revert() }
  }, [pinned, focus])

  return (
    <div className={`story${pinned ? ' pinned' : ''}`} ref={root} id="story">
      <div className="stage">
        <div className="stage-grid">
          <div className="text-col">
            <div className="wrap chapters">
              {CHAPTERS.map((c, i) => (
                <Chapter key={c.id} c={c} i={i} innerRef={(el) => (chapterRefs.current[i] = el)} />
              ))}
            </div>
          </div>
          {pinned && (
            <div className="canvas-col">
              <Suspense fallback={null}>
                <div className={`canvas-wrap${focus ? ' is-ready' : ''}`}>
                  <StandScene onReady={onReady} onProgress={onProgress} active={inView} />
                </div>
              </Suspense>
            </div>
          )}
        </div>
        {pinned && (
          <>
            <div className="progress" aria-hidden="true">
              {CHAPTERS.map((c, i) => <span key={c.id} className={i === active ? 'on' : ''} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
