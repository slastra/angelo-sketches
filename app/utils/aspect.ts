// Aspect-ratio helpers for sizing SketchFrame from a sketch's natural dims.

export interface Dims { w: number, h: number }

const FALLBACK: Dims = { w: 540, h: 700 }

function read(width: number | null, height: number | null): Dims {
  if (width && height && width > 0 && height > 0) return { w: width, h: height }
  return FALLBACK
}

/** Scale natural dims so width = targetW, preserving aspect. */
export function sizeWidth(width: number | null, height: number | null, targetW: number): Dims {
  const { w, h } = read(width, height)
  return { w: targetW, h: Math.round(targetW * h / w) }
}

/** Cap natural dims to fit inside a box, preserving aspect. */
export function sizeWithin(
  width: number | null,
  height: number | null,
  maxW: number,
  maxH: number,
): Dims {
  const { w, h } = read(width, height)
  const ratio = Math.min(maxW / w, maxH / h, 1)
  return { w: Math.round(w * ratio), h: Math.round(h * ratio) }
}
