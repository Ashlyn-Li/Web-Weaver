import { mapNormalizedVideoPoint } from './videoCoordinateTransform'
import type { ShootWebControlPoint, ShootWebGeometry } from '../types/web'

type DrawShootWebOptions = {
  context: CanvasRenderingContext2D
  height: number
  mirrored: boolean
  shoot: ShootWebGeometry
  videoHeight: number
  videoWidth: number
  width: number
}

function mapPoint(
  point: ShootWebControlPoint,
  options: Omit<DrawShootWebOptions, 'context' | 'shoot'>,
) {
  return mapNormalizedVideoPoint({
    displayWidth: options.width,
    displayHeight: options.height,
    videoWidth: options.videoWidth,
    videoHeight: options.videoHeight,
    mirrored: options.mirrored,
    x: point.x,
    y: point.y,
  })
}

function drawSmoothPath(
  context: CanvasRenderingContext2D,
  points: readonly ReturnType<typeof mapPoint>[],
) {
  if (points.length < 2) {
    return
  }

  context.moveTo(points[0].x, points[0].y)

  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index]
    const next = points[index + 1]
    const midX = (current.x + next.x) / 2
    const midY = (current.y + next.y) / 2

    context.quadraticCurveTo(current.x, current.y, midX, midY)
  }

  const lastPoint = points[points.length - 1]
  context.lineTo(lastPoint.x, lastPoint.y)
}

export function drawShootWeb({
  context,
  height,
  mirrored,
  shoot,
  videoHeight,
  videoWidth,
  width,
}: DrawShootWebOptions) {
  shoot.paths.forEach((path) => {
    const points = path.points.map((point) =>
      mapPoint(point, {
        height,
        mirrored,
        videoHeight,
        videoWidth,
        width,
      }),
    )

    if (path.role === 'core') {
      context.beginPath()
      context.lineCap = 'round'
      context.lineJoin = 'round'
      context.lineWidth = path.thickness * 2.2
      context.strokeStyle = 'rgba(236, 248, 255, 0.22)'
      drawSmoothPath(context, points)
      context.stroke()
    }

    context.beginPath()
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.lineWidth = path.thickness
    context.strokeStyle = `rgba(245, 252, 255, ${path.opacity})`
    drawSmoothPath(context, points)
    context.stroke()
  })

}
