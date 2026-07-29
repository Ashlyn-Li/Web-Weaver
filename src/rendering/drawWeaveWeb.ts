import { DEBUG } from '../config/debug'
import { mapNormalizedVideoPoint } from './videoCoordinateTransform'
import type { ShootWebControlPoint, WeaveWebGeometry } from '../types/web'

type DrawWeaveWebOptions = {
  context: CanvasRenderingContext2D
  height: number
  mirrored: boolean
  videoHeight: number
  videoWidth: number
  weave: WeaveWebGeometry
  width: number
}

function mapPoint(
  point: ShootWebControlPoint,
  options: Omit<DrawWeaveWebOptions, 'context' | 'weave'>,
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

    context.quadraticCurveTo(
      current.x,
      current.y,
      (current.x + next.x) / 2,
      (current.y + next.y) / 2,
    )
  }

  const lastPoint = points[points.length - 1]
  context.lineTo(lastPoint.x, lastPoint.y)
}

export function drawWeaveWeb({
  context,
  height,
  mirrored,
  videoHeight,
  videoWidth,
  weave,
  width,
}: DrawWeaveWebOptions) {
  weave.paths.forEach((path) => {
    const points = path.points.map((point) =>
      mapPoint(point, {
        height,
        mirrored,
        videoHeight,
        videoWidth,
        width,
      }),
    )

    context.beginPath()
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.lineWidth = path.thickness
    context.strokeStyle = `rgba(238, 248, 255, ${path.opacity})`
    drawSmoothPath(context, points)
    context.stroke()
  })

  if (!DEBUG.enabled || !DEBUG.geometry) {
    return
  }

  const center = mapPoint(
    {
      ...weave.center,
      progress: 0,
    },
    {
      height,
      mirrored,
      videoHeight,
      videoWidth,
      width,
    },
  )

  context.beginPath()
  context.fillStyle = 'rgba(255, 229, 146, 0.9)'
  context.arc(center.x, center.y, 4, 0, Math.PI * 2)
  context.fill()
}
