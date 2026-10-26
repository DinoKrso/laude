import { useEffect, useMemo, useRef, useState, Suspense } from 'react'
import { Canvas, useThree, advance } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import StandModel, { GROUND_Y } from '../three/StandModel'
import { current as C, initial, refs, wanted } from '../three/story'

const BASE = import.meta.env.BASE_URL
export const DURATION = 16

// Variant per moment of the reel (see variants.js order)
function variantAt(t) {
  if (t < 3.4) return 0
  if (t < 5.9) return 1
  if (t < 8.3) return 2
  if (t < 11.0) return 3
  if (t < 12.2) return 4
  if (t < 13.3) return 1
  return 0
}

// Camera follows the same focus logic as the site, but with no extra smoothing: GSAP owns the easing.
function Rig() {
  const { camera, size } = useThree()
  const tgt = useMemo(() => new THREE.Vector3(), [])
  useEffect(() => {
    window.__placeCamera = () => {
      if (!refs.pivot) return
      tgt.set(C.tx, C.ty, C.tz)
      refs.pivot.localToWorld(tgt)
      const aspect = size.width / size.height
      const d = C.dist * (aspect < 0.62 ? 0.62 / aspect : 1)
      camera.position.set(tgt.x * 0.35, tgt.y + d * 0.12, d)
      camera.lookAt(tgt)
      // portrait reel: keep the product in the lower part, under the headline (shift < 0 lifts it for the end card)
      camera.setViewOffset(size.width, size.height, 0, -size.height * (C.shift ?? 0.15), size.width, size.height)
      camera.updateProjectionMatrix()
    }
  }, [camera, size, tgt])
  return null
}

export default function Promo() {
  const [focus, setFocus] = useState(null)
  const root = useRef(null)
  const S = useMemo(() => ({ ...initial, dist: 7, rot: -0.9, idle: 0, shift: 0.15 }), [])

  useEffect(() => {
    if (!focus) return
    const q = (sel) => root.current.querySelectorAll(sel)
    const at = (v) => ({ tx: v.x, ty: v.y, tz: v.z })
    const tl = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut', duration: 1 } })
    Object.assign(S, at(focus.all))

    // 0-1.6 logo intro
    tl.fromTo(q('.intro .word'), { opacity: 0, scale: 0.86, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out' }, 0.1)
    tl.fromTo(q('.intro .line'), { scaleX: 0 }, { scaleX: 1, duration: 0.7, ease: 'power3.inOut' }, 0.5)
    tl.to(q('.intro'), { opacity: 0, duration: 0.5, ease: 'power2.in' }, 1.35)
    // 1.4-3.4 hero
    tl.to(S, { dist: 5.0, rot: -0.3, duration: 1.8, ease: 'power3.out' }, 1.2)
    tl.fromTo(q('.s-hero'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 1.8)
    tl.fromTo(q('.s-hero .stars i'), { scale: 0, rotate: -60 }, { scale: 1, rotate: 0, duration: 0.4, stagger: 0.07, ease: 'back.out(2.2)' }, 1.9)
    tl.to(q('.s-hero'), { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, 3.3)
    // 3.4-5.9 logo
    tl.to(S, { ...at(focus.logo), dist: 2.5, rot: -0.28, logo: 16, text: 6, duration: 1.3 }, 3.3)
    tl.fromTo(q('.s-logo'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 3.9)
    tl.to(q('.s-logo'), { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, 5.75)
    // 5.9-8.3 QR
    tl.to(S, { ...at(focus.qr), dist: 3.4, shift: 0.21, rot: 0.3, logo: 0, text: 0, qr: 12, duration: 1.2 }, 5.8)
    tl.to(S, { scan: 1, duration: 0.4, ease: 'none' }, 6.6)
    tl.fromTo(q('.s-qr'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 6.3)
    tl.to(q('.s-qr'), { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, 8.15)
    // 8.3-11 NFC
    tl.to(S, { ...at(focus.nfc), dist: 3.5, shift: 0.2, rot: -0.5, qr: 0, scan: 0, plate: 0.22, nfc: 22, pulse: 1, glow: 1, duration: 1.2 }, 8.2)
    tl.fromTo(q('.s-nfc'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 8.7)
    tl.to(q('.s-nfc'), { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, 10.85)
    // 11-13.4 variants montage
    tl.to(S, { ...at(focus.all), dist: 5.0, shift: 0.15, rot: -0.35, plate: 1, nfc: 0, pulse: 0, glow: 0, duration: 1.1 }, 10.9)
    tl.fromTo(q('.s-var'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 11.3)
    tl.to(q('.s-var'), { opacity: 0, y: -30, duration: 0.4, ease: 'power2.in' }, 13.35)
    // 13.4-16 end card
    tl.to(S, { dist: 6.0, shift: -0.17, duration: 1.4 }, 13.3)
    tl.to(root.current.querySelector('.layer'), { '--topfade': 0, '--botfade': 1, duration: 1 }, 13.4)
    tl.fromTo(q('.end > *'), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: 'power3.out' }, 13.8)
    tl.to({}, { duration: 0.01 }, DURATION)

    let last = 0
    window.__setTime = (t) => {
      tl.seek(t, false)
      wanted.variant = variantAt(t)
      // step the 3D in fixed 1/30 s slices so springs and turns are identical every render
      const step = 1 / 30
      if (t < last) last = 0
      while (last + step <= t + 1e-6) {
        last += step
        Object.assign(C, S)
        window.__placeCamera?.()
        advance(last)
      }
      Object.assign(C, S)
      window.__placeCamera?.()
      advance(t)
      return t
    }
    window.__duration = DURATION
    window.__setTime(0)
    window.__ready = true
  }, [focus, S])

  return (
    <div className="reel" ref={root}>
      <div className="glow" />
      <Canvas
        frameloop="never"
        shadows={{ type: THREE.PCFSoftShadowMap }}
        dpr={1}
        camera={{ fov: 30, near: 0.05, far: 50, position: [0, 0.5, 6] }}
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
        style={{ width: 1080, height: 1920 }}
      >
        <hemisphereLight args={['#fff1dd', '#0d1018', 0.7]} />
        <directionalLight position={[2.5, 4, 3.5]} intensity={1.6} color="#ffe7c8" castShadow
          shadow-mapSize={[2048, 2048]} shadow-bias={-0.0004} shadow-radius={6}
          shadow-camera-left={-2} shadow-camera-right={2} shadow-camera-top={2} shadow-camera-bottom={-2} />
        <directionalLight position={[-3, 2.5, -3]} intensity={1.3} color="#3d8bff" />
        <Environment resolution={256} frames={1}>
          <Lightformer intensity={3.4} position={[0, 4, 2]} scale={[6, 2, 1]} rotation-x={Math.PI / 2} color="#fff3e0" />
          <Lightformer intensity={2} position={[-4, 1, 2]} scale={[2, 4, 1]} rotation-y={Math.PI / 2} color="#ffe2b8" />
          <Lightformer intensity={1.3} position={[4, 1, -2]} scale={[2, 4, 1]} rotation-y={-Math.PI / 2} color="#5aa2ff" />
        </Environment>
        <mesh rotation-x={-Math.PI / 2} position={[0, GROUND_Y, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.5} />
        </mesh>
        <Suspense fallback={null}>
          <StandModel onReady={setFocus} shadows />
        </Suspense>
        <Rig />
      </Canvas>

      <div className="layer">
        <div className="top s-hero" style={{ opacity: 0 }}>
          <div className="stars"><i /><i /><i /><i /><i /></div>
          <h1 className="title">Jedan dodir.<br /><span className="blue">Pet zvjezdica.</span></h1>
        </div>
        <div className="top s-logo" style={{ opacity: 0 }}>
          <p className="eyebrow">Vaš logo</p>
          <h2 className="title">Vaš brend,<br /><span className="blue">vaše boje.</span></h2>
        </div>
        <div className="top s-qr" style={{ opacity: 0 }}>
          <p className="eyebrow">QR skener</p>
          <h2 className="title">Kamera ga<br /><span className="blue">uhvati iz prve.</span></h2>
        </div>
        <div className="top s-nfc" style={{ opacity: 0 }}>
          <p className="eyebrow">NFC čip</p>
          <h2 className="title">Prisloni telefon.<br /><span className="blue">Gotovo.</span></h2>
          <p className="sub">Bez aplikacije. Bez skeniranja.</p>
        </div>
        <div className="top s-var" style={{ opacity: 0 }}>
          <p className="eyebrow">Po mjeri lokala</p>
          <h2 className="title">Vaš oblik.<br /><span className="blue">Vaše boje.</span></h2>
        </div>
        <div className="end">
          <img src={`${BASE}brand/laude-logo.png`} alt="Laude" style={{ opacity: 0 }} />
          <p className="tag" style={{ opacity: 0 }}>Stalci za Google recenzije</p>
          <div className="cta" style={{ opacity: 0 }}>Zatražite ponudu</div>
          <p className="small" style={{ opacity: 0 }}>Link u biografiji</p>
        </div>
        <div className="intro">
          <img className="word" src={`${BASE}brand/laude-logo.png`} alt="Laude" />
          <div className="line" />
        </div>
      </div>
    </div>
  )
}
