export type Vector2 = {
  x: number
  y: number
}

export function distance(a: Vector2, b: Vector2) {
  return magnitude(subtract(a, b))
}

export function subtract(a: Vector2, b: Vector2): Vector2 {
  return {
    x: a.x - b.x,
    y: a.y - b.y,
  }
}

export function dot(a: Vector2, b: Vector2) {
  return a.x * b.x + a.y * b.y
}

export function magnitude(vector: Vector2) {
  return Math.hypot(vector.x, vector.y)
}

export function normalise(vector: Vector2): Vector2 {
  const length = magnitude(vector)

  if (length === 0) {
    return { x: 0, y: 0 }
  }

  return {
    x: vector.x / length,
    y: vector.y / length,
  }
}

export function angleBetween(a: Vector2, b: Vector2) {
  const aLength = magnitude(a)
  const bLength = magnitude(b)

  if (aLength === 0 || bLength === 0) {
    return 0
  }

  const cosine = dot(a, b) / (aLength * bLength)
  const clampedCosine = Math.min(1, Math.max(-1, cosine))

  return (Math.acos(clampedCosine) * 180) / Math.PI
}

export function midpoint(a: Vector2, b: Vector2): Vector2 {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
  }
}
