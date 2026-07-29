import { add, scale } from '../geometry/vector3'
import type { ProcessedHand } from '../types/hand'
import type {
  ShootWebControlPoint,
  ShootWebGeometry,
  ShootWebPath,
  WebGraph,
} from '../types/web'
import { createSeededRandom } from '../utils/seededRandom'
import { createShootCoordinateFrame } from './createShootCoordinateFrame'
import { getWebShootOrigin } from './getWebShootOrigin'
import { ShootWebState } from './ShootWebState'

function toPoint(
  apex: ShootWebControlPoint,
  direction: ReturnType<typeof createShootCoordinateFrame>['direction'],
  normal: ReturnType<typeof createShootCoordinateFrame>['normal'],
  length: number,
  width: number,
  progress: number,
  lateral: number,
): ShootWebControlPoint {
  const point = add(
    add(apex, scale(direction, length * progress)),
    scale(normal, width * progress * lateral),
  )

  return {
    ...point,
    progress,
  }
}

function createRadialPaths(
  projectile: NonNullable<ReturnType<ShootWebState['update']>>,
  frame: ReturnType<typeof createShootCoordinateFrame>,
): ShootWebPath[] {
  const laterals = [-0.72, -0.45, -0.22, 0, 0.22, 0.45, 0.72]
  const apex = {
    ...add(projectile.head, scale(frame.direction, -projectile.length)),
    progress: 0,
  }

  return laterals.map((lateral, index) => ({
    id: `shoot:${projectile.seed}:rib:${index}`,
    opacity: index === 3 ? 0.92 : 0.72,
    points: [
      apex,
      toPoint(
        apex,
        frame.direction,
        frame.normal,
        projectile.length,
        projectile.width,
        0.42,
        lateral * 0.48,
      ),
      toPoint(
        apex,
        frame.direction,
        frame.normal,
        projectile.length,
        projectile.width,
        1,
        lateral,
      ),
    ],
    role: index === 3 ? 'core' : 'outer',
    thickness: index === 3 ? 2.4 : 1.45,
  }))
}

function createArcPath(
  projectile: NonNullable<ReturnType<ShootWebState['update']>>,
  frame: ReturnType<typeof createShootCoordinateFrame>,
  progress: number,
  index: number,
): ShootWebPath {
  const random = createSeededRandom(projectile.seed + index * 997)
  const apex = {
    ...add(projectile.head, scale(frame.direction, -projectile.length)),
    progress: 0,
  }
  const width = projectile.width * progress
  const points = [-0.72, -0.45, -0.2, 0.04, 0.25, 0.48, 0.72].map((lateral) => {
    const sag = 0.045 + random() * 0.04
    const curveProgress = progress + Math.sin((lateral + 1) * Math.PI) * sag

    return toPoint(
      apex,
      frame.direction,
      frame.normal,
      projectile.length,
      width,
      curveProgress,
      lateral,
    )
  })

  return {
    id: `shoot:${projectile.seed}:arc:${index}`,
    opacity: 0.58,
    points,
    role: 'head',
    thickness: 1.25,
  }
}

export function generateShootWeb(
  hand: ProcessedHand,
  shootState: ShootWebState,
): WebGraph | null {
  const origin = getWebShootOrigin(hand)

  if (!origin) {
    return null
  }

  const projectile = shootState.update(hand, origin)

  if (!projectile) {
    return null
  }

  const frame = createShootCoordinateFrame(projectile.direction)
  const head = {
    id: `shoot:${projectile.seed}:head`,
    ...projectile.head,
    source: 'generated',
  } as const
  const tail = {
    id: `shoot:${projectile.seed}:tail`,
    ...add(projectile.head, scale(frame.direction, -projectile.length)),
    source: 'generated',
  } as const
  const paths = [
    ...createRadialPaths(projectile, frame),
    ...[0.25, 0.42, 0.6, 0.78, 0.95].map((progress, index) =>
      createArcPath(projectile, frame, progress, index),
    ),
  ]
  const shoot: ShootWebGeometry = {
    direction: {
      x: frame.direction.x,
      y: frame.direction.y,
    },
    length: projectile.length,
    maximumWidth: projectile.width,
    origin,
    paths,
    seed: projectile.seed,
    target: head,
  }

  return {
    mode: 'shoot',
    anchors: [head, tail],
    shoot,
    strands: [],
  }
}
