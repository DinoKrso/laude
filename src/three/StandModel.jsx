import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { current as C, refs, pointer, wanted } from './story'
import { VARIANTS, buildPlateGeometries, buildPillBase } from './variants'

const MODEL_URL = `${import.meta.env.BASE_URL}stand.glb`
const GROUND_Y = -0.86

function makeMaterials() {
  return {
    plate: new THREE.MeshStandardMaterial({ color: '#f6f0e6', roughness: 0.55, transparent: true }),
    ink: new THREE.MeshStandardMaterial({ color: '#22170f', roughness: 0.42 }),
    gold: new THREE.MeshStandardMaterial({ color: '#f2b544', roughness: 0.35, metalness: 0.35 }),
    base: new THREE.MeshStandardMaterial({ color: '#5a4030', roughness: 0.62 }),
    tag: new THREE.MeshStandardMaterial({ color: '#f4f4f2', roughness: 0.4 }),
    coil: new THREE.MeshStandardMaterial({ color: '#d0874a', roughness: 0.28, metalness: 0.85, emissive: '#d0874a', emissiveIntensity: 0 }),
    scan: new THREE.MeshBasicMaterial({ color: '#19b4ff', transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }),
  }
}

export default function StandModel({ onReady, onVariant, shadows = true }) {
  const { scene } = useGLTF(MODEL_URL)
  const pivot = useRef()
  const M = useMemo(makeMaterials, [])
  const parts = useRef({})
  const { gl, scene: rootScene, camera } = useThree()

  // Prepare the model once: materials, part handles, helper meshes, camera focus points.
  const setup = useMemo(() => {
    if (scene.userData.setup) return scene.userData.setup // StrictMode / remount safe
    const matFor = {
      plate_body: M.plate, logo: M.ink, tagline: M.ink, qr: M.ink, nfc_icon: M.ink,
      stars: M.gold, base: M.base, nfc_tag: M.tag, nfc_coil: M.coil,
    }
    const P = {}
    let rig = null
    scene.scale.setScalar(0.01)
    scene.traverse((o) => {
      if (o.isMesh) {
        o.material = matFor[o.name] || M.ink
        o.castShadow = shadows
        o.receiveShadow = shadows && o.name === 'base'
        o.frustumCulled = false
        P[o.name] = { obj: o, home: o.position.clone() }
      }
      if (o.name === 'PlateRig') rig = o
    })
    const box = new THREE.Box3().setFromObject(scene)
    const ctr = box.getCenter(new THREE.Vector3())
    scene.position.set(-ctr.x, -box.min.y, -ctr.z)

    // gold scan bar over the QR, NFC pulse rings (plate space, millimetres)
    const scan = new THREE.Mesh(new THREE.PlaneGeometry(50, 1.4), M.scan)
    scan.rotation.x = -Math.PI / 2
    scan.position.set(0, 7.4, -69)
    rig.add(scan)
    const rings = [0, 1, 2].map(() => {
      const m = new THREE.Mesh(
        new THREE.RingGeometry(14, 15.2, 64),
        new THREE.MeshBasicMaterial({ color: '#19b4ff', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
      )
      m.rotation.x = -Math.PI / 2
      m.position.set(0, 9, -28)
      rig.add(m)
      return m
    })
    // alternative plates (plate space, mm) and a pill plinth (model space, mm) for the variant showcase
    const plateGeos = buildPlateGeometries()
    const altPlates = {}
    for (const k of Object.keys(plateGeos)) {
      const m = new THREE.Mesh(plateGeos[k], M.plate)
      m.visible = false
      m.castShadow = shadows
      rig.add(m)
      altPlates[k] = m
    }
    const pill = new THREE.Mesh(buildPillBase(), M.base)
    pill.visible = false
    pill.castShadow = shadows
    scene.add(pill)
    const rigHome = rig.position.clone()
    const slotDir = new THREE.Vector3(0, 0, -1).applyQuaternion(rig.quaternion)
    scene.userData.setup = { P, rig, rigHome, slotDir, scan, rings, altPlates, pill }
    return scene.userData.setup
  }, [scene, M, shadows])

  useEffect(() => {
    parts.current = setup
    const g = pivot.current
    refs.pivot = g
    g.updateMatrixWorld(true)
    const focus = (name) => {
      const b = new THREE.Box3().setFromObject(setup.P[name].obj)
      return g.worldToLocal(b.getCenter(new THREE.Vector3()))
    }
    // warm up every material variant now, including the see-through plate used in the NFC chapter
    M.plate.depthWrite = false
    gl.compile(rootScene, camera)
    M.plate.depthWrite = true
    onReady?.({
      all: new THREE.Vector3(0, 0.86, 0),
      logo: focus('logo'),
      qr: focus('qr'),
      nfc: focus('nfc_icon'),
    })
  }, [setup, onReady, gl, rootScene, camera, M])

  const up = useMemo(() => new THREE.Vector3(), [])
  const spin = useRef(0)
  // variant showcase: cycles in the hero, real model everywhere else
  const vs = useRef({ index: 0, next: 0, t: -1, angle: 0, timer: 0 })
  const tgtColors = useMemo(() => ({ plate: new THREE.Color(), ink: new THREE.Color(), base: new THREE.Color() }), [])
  const applyVariant = (i) => {
    const { P, altPlates, pill } = parts.current
    const v = VARIANTS[i]
    const original = i === 0
    P.plate_body.obj.visible = original
    for (const k in altPlates) altPlates[k].visible = !original && k === v.plate
    P.base.obj.visible = v.base === 'block'
    pill.visible = v.base === 'pill'
    tgtColors.plate.set(v.colors.plate); tgtColors.ink.set(v.colors.ink); tgtColors.base.set(v.colors.base)
    onVariant?.(i)
  }
  useEffect(() => { tgtColors.plate.set(VARIANTS[0].colors.plate); tgtColors.ink.set(VARIANTS[0].colors.ink); tgtColors.base.set(VARIANTS[0].colors.base) }, [tgtColors])

  useFrame((state, dt) => {
    const { P, rig, rigHome, slotDir, scan, rings } = parts.current
    if (!rig) return
    const t = state.clock.elapsedTime
    const v = vs.current
    const fdt = Math.min(dt, 0.05)
    // scroll picked a different variant: quick full turn, swap shape + colours while the plate is edge-on
    if (v.t < 0) {
      if (wanted.cycle) {
        // hero: every few seconds turn into the next colour/shape
        v.timer += Math.min(dt, 0.2)
        if (v.timer > 3.2) { v.timer = 0; v.t = 0; v.dur = 0.95; v.next = (v.index + 1) % VARIANTS.length }
      } else if (wanted.variant !== v.index) {
        v.timer = 0; v.t = 0; v.dur = 1.3; v.next = wanted.variant // scrolled on: calmer turn back to the real model
      }
    }
    if (v.t >= 0) {
      const prev = v.t
      v.t = Math.min(1, v.t + Math.min(dt, 0.2) / (v.dur || 0.95)) // real time, so slow devices don't drag the turn out
      if (prev < 0.25 && v.t >= 0.25) { v.index = v.next; applyVariant(v.index) }
      const e = v.dur > 1 ? 0.5 - Math.cos(Math.PI * v.t) / 2 : v.t < 0.5 ? 4 * v.t ** 3 : 1 - (-2 * v.t + 2) ** 3 / 2
      v.angle = e * Math.PI * 2
      if (v.t >= 1) { v.t = -1; v.angle = 0 }
    }
    const ck = Math.min(1, fdt * 5)
    M.plate.color.lerp(tgtColors.plate, ck); M.ink.color.lerp(tgtColors.ink, ck); M.base.color.lerp(tgtColors.base, ck)
    spin.current += Math.min(dt, 0.05) * 0.35 * C.idle
    const g = pivot.current
    g.rotation.y = C.rot + Math.sin(spin.current) * 0.55 * C.idle + v.angle + pointer.x * 0.12
    g.rotation.x = pointer.y * 0.05

    // explode along the plate's own front normal (+Y in plate space)
    const lift = (n, v) => { const p = P[n]; if (p) p.obj.position.copy(p.home).add(up.set(0, v, 0)) }
    lift('logo', C.logo)
    lift('tagline', C.text)
    lift('stars', C.text * 1.3)
    lift('qr', C.qr)
    lift('nfc_tag', C.nfc)
    lift('nfc_coil', C.nfc + 0.4)
    lift('nfc_icon', C.nfc * 0.15)

    M.plate.opacity = C.plate
    M.plate.depthWrite = C.plate > 0.95
    M.coil.emissiveIntensity = C.glow * (0.35 + 0.25 * Math.sin(t * 4))
    scan.position.z = -91.5 + ((t * 0.55) % 1) * 45
    M.scan.opacity = C.scan * 0.85
    rings.forEach((r, i) => {
      const ph = (t * 0.6 + i / 3) % 1
      r.scale.setScalar(0.6 + ph * 1.8)
      r.position.y = 8 + C.nfc
      r.material.opacity = C.pulse * (1 - ph) * 0.6
    })
    rig.position.copy(rigHome).addScaledVector(slotDir, C.lift)
  })

  return (
    <group ref={pivot} position={[0, GROUND_Y, 0]}>
      <primitive object={scene} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
export { GROUND_Y }
