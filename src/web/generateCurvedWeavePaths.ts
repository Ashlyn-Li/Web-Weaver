import {
  add,
  distance,
  dot,
  midpoint,
  normalise,
  scale,
  subtract,
} from '../geometry/vector3'
import type {
  ShootWebControlPoint,
  WebAnchor,
  WeaveWebGeometry,
  WeaveWebPath,
} from '../types/web'

type HandAnchorGroup = {
  anchors: readonly WebAnchor[]
  center: WebAnchor
  handId: string
}

type BridgePathDraft = {
  points: ShootWebControlPoint[]
  path: WeaveWebPath
}

const DOWN = { x: 0, y: 1, z: 0 }

function toControlPoint(
  point: { x: number; y: number; z: number },
  progress: number,
): ShootWebControlPoint {
  return {
    ...point,
    progress,
  }
}

function createCenterAnchor(id: string, anchors: readonly WebAnchor[]): WebAnchor {
  const center = anchors.reduce(
    (sum, anchor) => ({
      x: sum.x + anchor.x,
      y: sum.y + anchor.y,
      z: sum.z + anchor.z,
    }),
    { x: 0, y: 0, z: 0 },
  )
  const count = Math.max(1, anchors.length)

  return {
    id,
    x: center.x / count,
    y: center.y / count,
    z: center.z / count,
    source: 'generated',
  }
}

function groupAnchorsByHand(anchors: readonly WebAnchor[]): HandAnchorGroup[] {
  const byHand = new Map<string, WebAnchor[]>()

  anchors.forEach((anchor) => {
    if (!anchor.handId) {
      return
    }

    byHand.set(anchor.handId, [...(byHand.get(anchor.handId) ?? []), anchor])
  })

  return Array.from(byHand.entries())
    .map(([handId, handAnchors]) => ({
      handId,
      anchors: handAnchors,
      center: createCenterAnchor(`weave:hand-center:${handId}`, handAnchors),
    }))
    .filter((group) => group.anchors.length >= 2)
}

function sortAnchorsAcrossBridge(
  anchors: readonly WebAnchor[],
  center: WebAnchor,
  bridgeNormal: { x: number; y: number; z: number },
) {
  return [...anchors].sort(
    (first, second) =>
      dot(subtract(first, center), bridgeNormal) -
      dot(subtract(second, center), bridgeNormal),
  )
}

function pickDistributedAnchor(anchors: readonly WebAnchor[], index: number, total: number) {
  if (anchors.length === 1 || total === 1) {
    return anchors[0]
  }

  return anchors[Math.round((index / (total - 1)) * (anchors.length - 1))]
}

function createBridgePoint(
  start: WebAnchor,
  end: WebAnchor,
  progress: number,
  sag: number,
  lateralOffset: number,
): ShootWebControlPoint {
  const base = add(start, scale(subtract(end, start), progress))
  const catenarySag = Math.sin(Math.PI * progress) * sag
  const taper = Math.sin(Math.PI * progress)

  return toControlPoint(
    add(base, {
      x: lateralOffset * taper,
      y: catenarySag,
      z: 0,
    }),
    progress,
  )
}

function createBridgeRail(
  start: WebAnchor,
  end: WebAnchor,
  index: number,
  total: number,
): BridgePathDraft {
  const span = distance(start, end)
  const centerBias = total <= 1 ? 0 : Math.abs(index / (total - 1) - 0.5)
  const sag = Math.min(0.12, span * (0.1 + centerBias * 0.11))
  const lateralOffset = (index % 2 === 0 ? -1 : 1) * Math.min(0.018, span * 0.03)
  const points = [0, 0.13, 0.26, 0.4, 0.55, 0.7, 0.84, 1].map((progress) =>
    createBridgePoint(start, end, progress, sag, lateralOffset),
  )

  return {
    points,
    path: {
      id: `weave:bridge-rail:${index}:${start.id}:${end.id}`,
      opacity: 0.62 + centerBias * 0.16,
      points,
      role: 'arc',
      thickness: centerBias > 0.42 ? 1.35 : 1.05,
    },
  }
}

function createRibPath({
  first,
  second,
  index,
  progressIndex,
  diagonalOffset = 0,
}: {
  first: BridgePathDraft,
  second: BridgePathDraft,
  index: number,
  progressIndex: number,
  diagonalOffset?: number,
}): WeaveWebPath {
  const firstPoint = first.points[progressIndex]
  const secondPoint = second.points[progressIndex + diagonalOffset]
  const center = midpoint(firstPoint, secondPoint)
  const sag = Math.min(0.026, distance(firstPoint, secondPoint) * 0.18)
  const points = [
    firstPoint,
    toControlPoint(add(center, scale(DOWN, sag)), firstPoint.progress),
    secondPoint,
  ]

  return {
    id: `weave:bridge-rib:${index}:${progressIndex}:${diagonalOffset}`,
    opacity: diagonalOffset === 0 ? 0.52 : 0.34,
    points,
    role: 'support',
    thickness: diagonalOffset === 0 ? 0.85 : 0.62,
  }
}

function createHandFanPaths(group: HandAnchorGroup): WeaveWebPath[] {
  return group.anchors.map((anchor, index) => ({
    id: `weave:hand-fan:${group.handId}:${anchor.id}`,
    opacity: 0.46,
    points: [
      toControlPoint(group.center, 0),
      toControlPoint(add(midpoint(group.center, anchor), scale(DOWN, 0.018)), 0.5),
      toControlPoint(anchor, 1),
    ],
    role: 'support',
    thickness: index % 2 === 0 ? 0.9 : 0.7,
  }))
}

export function generateCurvedWeavePaths(
  anchors: readonly WebAnchor[],
): WeaveWebGeometry | null {
  const handGroups = groupAnchorsByHand(anchors)

  if (handGroups.length < 2) {
    return null
  }

  const [leftGroup, rightGroup] = [...handGroups].sort(
    (first, second) => first.center.x - second.center.x,
  )
  const bridgeDirection = normalise(subtract(rightGroup.center, leftGroup.center))
  const bridgeNormal = normalise({
    x: -bridgeDirection.y,
    y: bridgeDirection.x,
    z: 0,
  })
  const leftAnchors = sortAnchorsAcrossBridge(
    leftGroup.anchors,
    leftGroup.center,
    bridgeNormal,
  )
  const rightAnchors = sortAnchorsAcrossBridge(
    rightGroup.anchors,
    rightGroup.center,
    bridgeNormal,
  )
  const railCount = Math.max(5, Math.min(10, leftAnchors.length + rightAnchors.length + 1))
  const rails = Array.from({ length: railCount }, (_, index) =>
    createBridgeRail(
      pickDistributedAnchor(leftAnchors, index, railCount),
      pickDistributedAnchor(rightAnchors, index, railCount),
      index,
      railCount,
    ),
  )
  const ribs = rails.slice(0, -1).flatMap((rail, index) =>
    [1, 2, 3, 4, 5, 6].flatMap((progressIndex) => [
      createRibPath({
        first: rail,
        second: rails[index + 1],
        index,
        progressIndex,
      }),
      ...(index % 2 === 0 && progressIndex < 6
        ? [
            createRibPath({
              first: rail,
              second: rails[index + 1],
              index,
              progressIndex,
              diagonalOffset: 1,
            }),
          ]
        : []),
    ]),
  )
  const edgeSupports = [leftGroup, rightGroup].flatMap(createHandFanPaths)

  return {
    center: createCenterAnchor('weave:bridge-center', [leftGroup.center, rightGroup.center]),
    paths: [...rails.map((rail) => rail.path), ...ribs, ...edgeSupports],
  }
}
