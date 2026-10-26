import * as THREE from 'three'

// Colourways and shapes shown while the stand spins. Index 0 is the real printed model.
export const VARIANTS = [
  { plate: 'rect', base: 'block', label: 'Klasik · krem i orah', colors: { plate: '#f6f0e6', ink: '#22170f', base: '#5a4030' } },
  { plate: 'arch', base: 'pill', label: 'Luk · bijela i plava', colors: { plate: '#f7f8fa', ink: '#1f4fff', base: '#e9ecf2' } },
  { plate: 'chamfer', base: 'block', label: 'Kosi uglovi · crna', colors: { plate: '#1a1b20', ink: '#f2f4f8', base: '#0f1013' } },
  { plate: 'arch', base: 'block', label: 'Luk · terakota', colors: { plate: '#ecd3c1', ink: '#6b2c17', base: '#2a2523' } },
  { plate: 'soft', base: 'pill', label: 'Mekani uglovi · kadulja i hrast', colors: { plate: '#cfdcc8', ink: '#1f3b2e', base: '#b88a5c' } },
]


// --- 2D outlines in plate millimetres (x: -45..45, y: 0..165), same frame as the Blender model
function rrectPts(w, h, r, cx, cy, seg = 10) {
  const pts = []
  const corners = [[1, 1, 0], [-1, 1, 90], [-1, -1, 180], [1, -1, 270]]
  for (const [sx, sy, a0] of corners) {
    const ccx = cx + sx * (w / 2 - r), ccy = cy + sy * (h / 2 - r)
    for (let i = 0; i <= seg; i++) {
      const a = THREE.MathUtils.degToRad(a0 + (90 * i) / seg)
      pts.push([ccx + r * Math.cos(a), ccy + r * Math.sin(a)])
    }
  }
  return pts
}
function archPts() {
  const pts = []
  const R = 45, cy = 120
  for (let i = 0; i <= 40; i++) { const a = (Math.PI * i) / 40; pts.push([R * Math.cos(a), cy + R * Math.sin(a)]) } // top arc, right to left
  for (const [cx, a0] of [[-39, 180], [39, 270]]) {
    for (let i = 0; i <= 8; i++) { const a = THREE.MathUtils.degToRad(a0 + (90 * i) / 8); pts.push([cx + 6 * Math.cos(a), 6 + 6 * Math.sin(a)]) }
  }
  return pts
}
function chamferPts() {
  const c = 16
  return [[45 - c, 165], [-45 + c, 165], [-45, 165 - c], [-45, c], [-45 + c, 0], [45 - c, 0], [45, c], [45, 165 - c]]
}
const OUTLINES = {
  rect: () => rrectPts(90, 165, 6, 0, 82.5),
  soft: () => rrectPts(90, 165, 24, 0, 82.5),
  arch: archPts,
  chamfer: chamferPts,
}

function extrude(pts, depth, bevel) {
  const shape = new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y)))
  const g = new THREE.ExtrudeGeometry(shape, {
    depth: depth - bevel * 2, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.5, bevelSegments: 2, curveSegments: 32,
  })
  g.translate(0, 0, bevel)
  g.rotateX(-Math.PI / 2) // shape Y -> -Z (glTF), extrusion -> +Y (plate front normal)
  g.computeVertexNormals()
  return g
}

export function buildPlateGeometries() {
  const out = {}
  for (const k of Object.keys(OUTLINES)) out[k] = extrude(OUTLINES[k](), 6, 0.6)
  return out
}

// Rounded "pill" plinth, same footprint centre as the printed base (model millimetres)
export function buildPillBase() {
  const pts = rrectPts(120, 62, 30, 0, 0, 16)
  const g = extrude(pts, 15, 1.4)
  return g
}
