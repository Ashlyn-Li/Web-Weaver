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
  const shootPaths = graph?.shoot?.paths ?? []
  const corePaths = shootPaths.filter((path) => path.role === 'core').length
  const outerPaths = shootPaths.filter((path) => path.role === 'outer').length
  const crossLinks = shootPaths.filter(
    (path) => path.role === 'cross-link',
  ).length
  const weavePaths = graph?.weave?.paths ?? []
  const weaveSpokes = weavePaths.filter(
    (path) => path.role === 'spoke' || path.role === 'support',
  ).length
  const weaveArcs = weavePaths.filter((path) => path.role === 'arc').length

  return (
    <aside className="web-geometry-debug-overlay" aria-label="Web geometry debug">
      <p>Web mode: {(graph?.mode ?? 'none').toUpperCase()}</p>
      <p>Anchors: {graph?.anchors.length ?? 0}</p>
      <p>Strands: {graph?.strands.length ?? 0}</p>
      {graph?.mode === 'shoot' ? (
        <>
          <p>Paths: {shootPaths.length}</p>
          <p>Core strands: {corePaths}</p>
          <p>Outer strands: {outerPaths}</p>
          <p>Cross-links: {crossLinks}</p>
          <p>Projectile length: {graph.shoot?.length.toFixed(2) ?? '0'}</p>
          <p>Maximum width: {graph.shoot?.maximumWidth.toFixed(2) ?? '0'}</p>
          <p>
            Direction: ({graph.shoot?.direction.x.toFixed(2) ?? '0'},{' '}
            {graph.shoot?.direction.y.toFixed(2) ?? '0'})
          </p>
          <p>Seed: {graph.shoot?.seed ?? 0}</p>
        </>
      ) : null}
      {graph?.mode === 'weave' ? (
        <>
          <p>Curved paths: {weavePaths.length}</p>
          <p>Spokes: {weaveSpokes}</p>
          <p>Arcs: {weaveArcs}</p>
          <p>Cross-hand strands: {crossHandStrands}</p>
          <p>Support strands: {supportStrands}</p>
        </>
      ) : null}
    </aside>
  )
}
