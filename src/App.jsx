import { useEffect } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Story from './components/Story'
import LeadForm from './components/LeadForm'
import { Nav, Venues, Steps, Footer } from './components/Sections'
import { isTouch } from './three/device'

gsap.registerPlugin(ScrollTrigger)
// mobile address bar show/hide must not re-measure the whole scroll story
ScrollTrigger.config({ ignoreMobileResize: true })

export default function App() {
  useEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual'
    window.scrollTo(0, 0)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // Lenis smooths wheel scrolling on desktop; phones keep their native, momentum touch scroll.
    let lenis = null, raf = null
    if (!reduce && !isTouch) {
      lenis = new Lenis({ duration: 1.1, smoothWheel: true })
      // keep the page still behind the loader
      if (!window.__preloader?.finished) { lenis.stop(); window.addEventListener('preloader:done', () => lenis?.start(), { once: true }) }
      lenis.on('scroll', ScrollTrigger.update)
      window.__lenis = lenis // the 3D story snaps to its chapters through Lenis
      raf = (time) => lenis.raf(time * 1000)
      gsap.ticker.add(raf)
      gsap.ticker.lagSmoothing(0)
    }
    const onClick = (e) => {
      const a = e.target.closest('a[href^="#"]')
      if (!a) return
      const id = a.getAttribute('href')
      const el = id === '#top' ? document.body : document.querySelector(id)
      if (!el) return
      e.preventDefault()
      if (lenis) lenis.scrollTo(id === '#top' ? 0 : el, { offset: -24 })
      else window.scrollTo({ top: id === '#top' ? 0 : el.getBoundingClientRect().top + window.scrollY - 24, behavior: reduce ? 'auto' : 'smooth' })
    }
    document.addEventListener('click', onClick)
    if (reduce) return () => document.removeEventListener('click', onClick)

    // sections rise in as they enter
    const ctx = gsap.context(() => {
      gsap.utils.toArray('.reveal').forEach((el) => {
        gsap.from(el, { y: 36, opacity: 0, duration: 0.9, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 88%', once: true } })
      })
    })
    return () => { document.removeEventListener('click', onClick); if (raf) gsap.ticker.remove(raf); lenis?.destroy(); window.__lenis = null; ctx.revert() }
  }, [])

  return (
    <>
      <Nav />
      <main id="top">
        <Story />
        <Venues />
        <Steps />
        <LeadForm />
      </main>
      <Footer />
    </>
  )
}
