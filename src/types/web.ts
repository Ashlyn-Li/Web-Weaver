export interface WebPoint {
  id: string
  x: number
  y: number
  z: number
}

export interface WebAnchor extends WebPoint {
  source: 'hand-landmark' | 'palm-centre' | 'screen-target' | 'generated'
  handId?: string
  anchorName?: string
}

export interface WebStrand {
  id: string
  startId: string
  endId: string
  tension: number
  thickness: number
  opacity: number
  kind: 'shoot' | 'cross-hand' | 'support'
}

export interface ShootWebControlPoint {
  x: number
  y: number
  z: number
  progress: number
}

export interface ShootWebPath {
  id: string
  opacity: number
  points: readonly ShootWebControlPoint[]
  role: 'core' | 'outer' | 'cross-link' | 'head'
  thickness: number
}

export interface ShootWebGeometry {
  direction: {
    x: number
    y: number
  }
  length: number
  maximumWidth: number
  origin: WebAnchor
  paths: readonly ShootWebPath[]
  seed: number
  target: WebAnchor
}

export interface WeaveWebPath {
  id: string
  opacity: number
  points: readonly ShootWebControlPoint[]
  role: 'spoke' | 'arc' | 'support'
  thickness: number
}

export interface WeaveWebGeometry {
  center: WebAnchor
  paths: readonly WeaveWebPath[]
}

export interface WebGraph {
  anchors: readonly WebAnchor[]
  shoot?: ShootWebGeometry
  strands: readonly WebStrand[]
  weave?: WeaveWebGeometry
  mode: WebMode
}

export type WebMode = 'none' | 'shoot' | 'weave'
