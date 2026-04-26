// Ported verbatim from the design prototype's sketch-frame.jsx (FNV-1a + xorshift).
// Deterministic so a given seed always renders the same jitter.

export function seededRandom(seed: string): () => number {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return function () {
    h += 0x6D2B79F5
    let t = h
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Pt = readonly [number, number]

function buildPath(pts: Pt[], close: boolean): string {
  if (pts.length === 0) return ''
  const first = pts[0]!
  let d = `M ${first[0].toFixed(2)} ${first[1].toFixed(2)}`
  for (let i = 1; i < pts.length; i++) {
    const p = pts[i]!
    d += ` L ${p[0].toFixed(2)} ${p[1].toFixed(2)}`
  }
  return close ? d + ' Z' : d
}

export function jitteredRectPath(w: number, h: number, rand: () => number, jitter = 1.2, segs = 28): string {
  const pts: Pt[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    pts.push([t * w + (rand() - 0.5) * jitter, (rand() - 0.5) * jitter])
  }
  for (let i = 1; i <= segs; i++) {
    const t = i / segs
    pts.push([w + (rand() - 0.5) * jitter, t * h + (rand() - 0.5) * jitter])
  }
  for (let i = 1; i <= segs; i++) {
    const t = i / segs
    pts.push([w - t * w + (rand() - 0.5) * jitter, h + (rand() - 0.5) * jitter])
  }
  for (let i = 1; i < segs; i++) {
    const t = i / segs
    pts.push([(rand() - 0.5) * jitter, h - t * h + (rand() - 0.5) * jitter])
  }
  return buildPath(pts, true)
}

export function jitteredLine(x1: number, y1: number, x2: number, y2: number, rand: () => number, jitter = 0.6, segs = 12): string {
  const pts: Pt[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    pts.push([
      x1 + (x2 - x1) * t + (rand() - 0.5) * jitter,
      y1 + (y2 - y1) * t + (rand() - 0.5) * jitter,
    ])
  }
  return buildPath(pts, false)
}

export function jitteredCircle(cx: number, cy: number, r: number, rand: () => number, jitter = 0.7, segs = 36): string {
  const pts: Pt[] = []
  for (let i = 0; i <= segs; i++) {
    const t = (i / segs) * Math.PI * 2
    const rr = r + (rand() - 0.5) * jitter * 2
    pts.push([cx + Math.cos(t) * rr, cy + Math.sin(t) * rr])
  }
  return buildPath(pts, true)
}

export function jitteredArcEllipse(cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, rand: () => number, jitter = 0.5, segs = 32): string {
  const pts: Pt[] = []
  for (let i = 0; i <= segs; i++) {
    const t = a0 + (a1 - a0) * (i / segs)
    pts.push([cx + Math.cos(t) * rx + (rand() - 0.5) * jitter, cy + Math.sin(t) * ry + (rand() - 0.5) * jitter])
  }
  return buildPath(pts, false)
}

export function jitteredRectPathAt(x: number, y: number, w: number, h: number, rand: () => number, jitter = 1.0, segs = 14): string {
  const pts: Pt[] = []
  for (let i = 0; i <= segs; i++) {
    const t = i / segs
    pts.push([x + t * w + (rand() - 0.5) * jitter, y + (rand() - 0.5) * jitter])
  }
  for (let i = 1; i <= segs; i++) {
    const t = i / segs
    pts.push([x + w + (rand() - 0.5) * jitter, y + t * h + (rand() - 0.5) * jitter])
  }
  for (let i = 1; i <= segs; i++) {
    const t = i / segs
    pts.push([x + w - t * w + (rand() - 0.5) * jitter, y + h + (rand() - 0.5) * jitter])
  }
  for (let i = 1; i < segs; i++) {
    const t = i / segs
    pts.push([x + (rand() - 0.5) * jitter, y + h - t * h + (rand() - 0.5) * jitter])
  }
  return buildPath(pts, true)
}
