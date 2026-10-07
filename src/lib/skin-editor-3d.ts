import { Mesh, Vector2, Vector3, type Intersection } from 'three'
import {
  regions,
  type Model,
  type Part,
  type Layer,
  type Region,
} from './skin-maker.ts'
import type { Point } from './skin-editor.ts'

export type SkinSurface = {
  mesh: Mesh
  region: Region
  triangle: [number, number, number]
}
export type SkinHit = SkinSurface & { point: Point }

const uvCenter = (mesh: Mesh, triangle: SkinSurface['triangle']) => {
  const uv = mesh.geometry.getAttribute('uv')
  return new Vector2(
    triangle.reduce((n, i) => n + uv.getX(i), 0) / 3,
    triangle.reduce((n, i) => n + uv.getY(i), 0) / 3,
  )
}
const contains = (r: Region, uv: Vector2) =>
  uv.x * 64 > r.x &&
  uv.x * 64 < r.x + r.w &&
  (1 - uv.y) * 64 > r.y &&
  (1 - uv.y) * 64 < r.y + r.h

// Resolve the face from its triangle, then clamp the hit UV to that face.
// A hit exactly on a seam must never spill into an adjacent face or Slim padding.
export function skinHit(
  model: Model,
  part: Part,
  layer: Layer,
  hit: Intersection,
): SkinHit | undefined {
  if (!(hit.object instanceof Mesh) || !hit.face || !hit.uv) return
  const triangle: SkinSurface['triangle'] = [hit.face.a, hit.face.b, hit.face.c]
  const center = uvCenter(hit.object, triangle)
  const region = regions(model).find(
    (r) => r.part === part && r.layer === layer && contains(r, center),
  )
  if (!region) return
  return {
    mesh: hit.object,
    triangle,
    region,
    point: {
      x: Math.max(
        0,
        Math.min(region.w - 1, Math.floor(hit.uv.x * 64 - region.x)),
      ),
      y: Math.max(
        0,
        Math.min(region.h - 1, Math.floor((1 - hit.uv.y) * 64 - region.y)),
      ),
    },
  }
}

export function faceSurface(
  mesh: Mesh,
  region: Region,
): SkinSurface | undefined {
  const index = mesh.geometry.index
  if (!index) return
  for (let i = 0; i < index.count; i += 3) {
    const triangle: SkinSurface['triangle'] = [
      index.getX(i),
      index.getX(i + 1),
      index.getX(i + 2),
    ]
    if (contains(region, uvCenter(mesh, triangle)))
      return { mesh, region, triangle }
  }
}

// Invert the triangle's UV transform so the outline follows the actual
// geometry, including mirrored bottom faces and the narrower Slim arms.
export function surfaceOutline(
  surface: SkinSurface,
  box: { x: number; y: number; w: number; h: number },
): Vector3[] {
  const {
    mesh,
    region,
    triangle: [a, b, c],
  } = surface
  const uv = mesh.geometry.getAttribute('uv'),
    position = mesh.geometry.getAttribute('position')
  const origin = new Vector3().fromBufferAttribute(position, a),
    ab = new Vector3().fromBufferAttribute(position, b).sub(origin),
    ac = new Vector3().fromBufferAttribute(position, c).sub(origin)
  const normal = new Vector3()
    .crossVectors(ab, ac)
    .normalize()
    .multiplyScalar(0.02)
  const u0 = uv.getX(a),
    v0 = uv.getY(a),
    ub = uv.getX(b) - u0,
    vb = uv.getY(b) - v0,
    uc = uv.getX(c) - u0,
    vc = uv.getY(c) - v0,
    det = ub * vc - uc * vb
  return [
    [box.x, box.y],
    [box.x + box.w, box.y],
    [box.x + box.w, box.y + box.h],
    [box.x, box.y + box.h],
  ].map(([x, y]) => {
    const u = (region.x + x) / 64 - u0,
      v = 1 - (region.y + y) / 64 - v0
    return origin
      .clone()
      .addScaledVector(ab, (u * vc - v * uc) / det)
      .addScaledVector(ac, (v * ub - u * vb) / det)
      .add(normal)
  })
}
