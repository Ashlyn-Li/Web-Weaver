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

export interface WebGraph {
  anchors: readonly WebAnchor[]
  strands: readonly WebStrand[]
  mode: WebMode
}

export type WebMode = 'none' | 'shoot' | 'weave'
