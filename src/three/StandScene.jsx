import { Suspense, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor, useProgress } from '@react-three/drei'
import * as THREE from 'three'
import StandModel, { GROUND_Y } from './StandModel'
import { current as C, target as S, refs, pointer } from './story'
import { lowPower, isTouch } from './device'

const BG = '#0a0b0e'

// Eases the rendered state toward the scroll target and flies the camera to the focus point.
function CameraRig() {
  const { camera, size } = useThree()
  const tgt = useMemo(() => new THREE.Vector3(), [])
  const lastSize = useMemo(() => ({ w: 0, h: 0 }), [])
  useFrame((state, dt) => {
    const k = Math.min(1, Math.min(dt, 0.05) * 7)
    for (const key in S) C[key] += (S[key] - C[key]) * k

    if (size.width !== lastSize.w || size.height !== lastSize.h) {
      lastSize.w = size.width; lastSize.h = size.height
      camera.clearViewOffset()
    }
    // the canvas only covers the model's own zone, so fit the stand to that zone's shape
    const aspect = size.width / size.height
    const distMul = aspect < 0.62 ? Math.min(2.4, 0.62 / aspect) : 1
    if (!refs.pivot) return
    tgt.set(C.tx, C.ty, C.tz)
    refs.pivot.localToWorld(tgt)
    const d = C.dist * distMul
    camera.position.set(tgt.x * 0.35, tgt.y + d * 0.12, d)
    camera.lookAt(tgt)
  })
  return null
}

// Soft baked blob under the stand: used instead of real-time shadows on phones.
function BlobShadow() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas'); c.width = c.height = 128
    const g = c.getContext('2d')
    const grd = g.createRadialGradient(64, 64, 4, 64, 64, 64)
    grd.addColorStop(0, 'rgba(0,0,0,0.75)'); grd.addColorStop(1, 'rgba(0,0,0,0)')
    g.fillStyle = grd; g.fillRect(0, 0, 128, 128)
    return new THREE.CanvasTexture(c)
  }, [])
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, GROUND_Y + 0.001, 0.05]} scale={[1.9, 1.3, 1]}>
      <planeGeometry />
      <meshBasicMaterial map={tex} transparent depthWrite={false} />
    </mesh>
  )
}

function ProgressReporter({ onProgress }) {
  const { progress, active } = useProgress()
  useEffect(() => { onProgress?.(active || progress < 100 ? progress : 100) }, [progress, active, onProgress])
  return null
}

export default function StandScene({ onReady, onProgress, onVariant, active = true }) {
  useEffect(() => { onProgress?.(0) }, [onProgress])
  const maxDpr = lowPower ? 1.5 : 1.75
  const [dpr, setDpr] = useState(maxDpr)

  // desktop-only parallax from the mouse (touch would make the model twitch while scrolling)
  useEffect(() => {
    if (isTouch) return
    const onMove = (e) => { pointer.x = e.clientX / window.innerWidth - 0.5; pointer.y = e.clientY / window.innerHeight - 0.5 }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      shadows={lowPower ? false : { type: THREE.PCFSoftShadowMap }}
      dpr={dpr}
      resize={{ scroll: false, debounce: { scroll: 0, resize: 120 } }}
      camera={{ fov: 30, near: 0.05, far: 50, position: [0, 0.5, 4.6] }}
      gl={{ antialias: !lowPower, powerPreference: 'high-performance', toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.3 }}
      style={{ pointerEvents: 'none' }}
      aria-label="3D model Laude stalka koji se okreće dok skrolate"
    >
      <ProgressReporter onProgress={onProgress} />
      <PerformanceMonitor
        bounds={() => [45, 60]}
        onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
        onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
        flipflops={3}
        onFallback={() => setDpr(1)}
      />
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 7, 14]} />
      <hemisphereLight args={['#fff1dd', '#0d1018', 0.7]} />
      <directionalLight
        position={[2.5, 4, 3.5]} intensity={1.6} color="#ffe7c8" castShadow={!lowPower}
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0004} shadow-radius={6}
        shadow-camera-left={-2} shadow-camera-right={2} shadow-camera-top={2} shadow-camera-bottom={-2}
      />
      <directionalLight position={[-3, 2.5, -3]} intensity={1.3} color="#3d8bff" />
      <Environment resolution={lowPower ? 128 : 256} frames={1}>
        <Lightformer intensity={3.4} position={[0, 4, 2]} scale={[6, 2, 1]} rotation-x={Math.PI / 2} color="#fff3e0" />
        <Lightformer intensity={2} position={[-4, 1, 2]} scale={[2, 4, 1]} rotation-y={Math.PI / 2} color="#ffe2b8" />
        <Lightformer intensity={1.3} position={[4, 1, -2]} scale={[2, 4, 1]} rotation-y={-Math.PI / 2} color="#5aa2ff" />
      </Environment>
      {lowPower ? <BlobShadow /> : (
        <mesh rotation-x={-Math.PI / 2} position={[0, GROUND_Y, 0]} receiveShadow>
          <planeGeometry args={[30, 30]} />
          <shadowMaterial opacity={0.45} />
        </mesh>
      )}
      <Suspense fallback={null}>
        <StandModel onReady={onReady} onVariant={onVariant} shadows={!lowPower} />
      </Suspense>
      <CameraRig />
    </Canvas>
  )
}
