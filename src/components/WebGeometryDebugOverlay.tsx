import { DEBUG } from '../config/debug'
import type { WebGraph } from '../types/web'

type WebGeometryDebugOverlayProps = {
  graph: WebGraph | null
}

export function WebGeometryDebugOverlay({ graph }: WebGeometryDebugOverlayProps) {
  if (!DEBUG.enabled || !DEBUG.geometry) {
    return null
  }

  const crossHandStrands =
    graph?.strands.filter((strand) => strand.kind === 'cross-hand').length ?? 0
  const supportStrands =
    graph?.strands.filter((strand) => strand.kind === 'support').length ?? 0

  return (
    <aside className="web-geometry-debug-overlay" aria-label="Web geometry debug">
      <p>Web mode: {(graph?.mode ?? 'none').toUpperCase()}</p>
      <p>Anchors: {graph?.anchors.length ?? 0}</p>
      <p>Strands: {graph?.strands.length ?? 0}</p>
      {graph?.mode === 'shoot' ? (
        <>
          <p>Origin: {graph.strands[0]?.startId ?? 'none'}</p>
          <p>Target: {graph.strands[0]?.endId ?? 'none'}</p>
        </>
      ) : null}
      {graph?.mode === 'weave' ? (
        <>
          <p>Cross-hand strands: {crossHandStrands}</p>
          <p>Support strands: {supportStrands}</p>
        </>
      ) : null}
    </aside>
  )
}
