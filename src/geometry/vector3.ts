import type { Point3D } from '../types/hand'

export function add(a: Point3D, b: Point3D): Point3D {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z }
}

export function subtract(a: Point3D, b: Point3D): Point3D {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z }
}

export function dot(a: Point3D, b: Point3D) {
  return a.x * b.x + a.y * b.y + a.z * b.z
}

export function cross(a: Point3D, b: Point3D): Point3D {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  }
}

export function magnitude(vector: Point3D) {
  return Math.hypot(vector.x, vector.y, vector.z)
}

export function normalise(vector: Point3D): Point3D {
  const length = magnitude(vector)

  if (length === 0) {
    return { x: 0, y: 0, z: 0 }
  }

  return scale(vector, 1 / length)
}

export function distance(a: Point3D, b: Point3D) {
  return magnitude(subtract(a, b))
}

export function midpoint(a: Point3D, b: Point3D): Point3D {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: (a.z + b.z) / 2,
  }
}

export function angleBetween(a: Point3D, b: Point3D) {
  const aLength = magnitude(a)
  const bLength = magnitude(b)

  if (aLength === 0 || bLength === 0) {
    return 0
  }

  const cosine = dot(a, b) / (aLength * bLength)
  const clampedCosine = Math.min(1, Math.max(-1, cosine))

  return (Math.acos(clampedCosine) * 180) / Math.PI
}

export function scale(vector: Point3D, scalar: number): Point3D {
  return {
    x: vector.x * scalar,
    y: vector.y * scalar,
    z: vector.z * scalar,
  }
}

export function project(vector: Point3D, onto: Point3D): Point3D {
  const denominator = dot(onto, onto)

  if (denominator === 0) {
    return { x: 0, y: 0, z: 0 }
  }

  return scale(onto, dot(vector, onto) / denominator)
}
