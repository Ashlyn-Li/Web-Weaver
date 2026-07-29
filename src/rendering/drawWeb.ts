import { DEBUG } from '../config/debug'
import { drawShootWeb } from './drawShootWeb'
import { drawWeaveWeb } from './drawWeaveWeb'
import { mapNormalizedVideoPoint } from './videoCoordinateTransform'
import type { WebAnchor, WebGraph } from '../types/web'

type DrawWebOptions = {
  context: CanvasRenderingContext2D
  graph: WebGraph | null
  height: number
  mirrored: boolean
  videoHeight: number
  videoWidth: number
  width: number
}

function getAnchorMap(graph: WebGraph) {
  return new Map(graph.anchors.map((anchor) => [anchor.id, anchor]))
}

function mapAnchor(
  anchor: WebAnchor,
  options: Pick<
    DrawWebOptions,
    'height' | 'mirrored' | 'videoHeight' | 'videoWidth' | 'width'
  >,
) {
  return mapNormalizedVideoPoint({
    displayWidth: options.width,
    displayHeight: options.height,
    videoWidth: options.videoWidth,
    videoHeight: options.videoHeight,
    mirrored: options.mirrored,
    x: anchor.x,
    y: anchor.y,
  })
}

export function drawWeb({
  context,
  graph,
  height,
  mirrored,
  videoHeight,
  videoWidth,
  width,
}: DrawWebOptions) {
  if (!graph) {
    return
  }

  if (graph.mode === 'shoot' && graph.shoot) {
    drawShootWeb({
      context,
      height,
      mirrored,
      shoot: graph.shoot,
      videoHeight,
      videoWidth,
      width,
    })
    return
  }

  if (graph.mode === 'weave' && graph.weave) {
    drawWeaveWeb({
      context,
      height,
      mirrored,
      videoHeight,
      videoWidth,
      weave: graph.weave,
      width,
    })
    return
  }

  const anchors = getAnchorMap(graph)

  graph.strands.forEach((strand) => {
    const start = anchors.get(strand.startId)
    const end = anchors.get(strand.endId)

    if (!start || !end) {
      return
    }

    const startPoint = mapAnchor(start, {
      height,
      mirrored,
      videoHeight,
      videoWidth,
      width,
    })
    const endPoint = mapAnchor(end, {
      height,
      mirrored,
      videoHeight,
      videoWidth,
      width,
    })

    context.beginPath()
    context.lineCap = 'round'
    context.lineWidth = strand.thickness
    context.strokeStyle = `rgba(236, 248, 255, ${strand.opacity})`
    context.moveTo(startPoint.x, startPoint.y)
    context.lineTo(endPoint.x, endPoint.y)
    context.stroke()

    if (strand.kind === 'shoot') {
      context.beginPath()
      context.lineWidth = strand.thickness * 0.45
      context.strokeStyle = 'rgba(255, 255, 255, 0.38)'
      context.moveTo(startPoint.x, startPoint.y)
      context.lineTo(endPoint.x, endPoint.y)
      context.stroke()
    }
  })

  if (!DEBUG.enabled || !DEBUG.geometry) {
    return
  }

  graph.anchors.forEach((anchor) => {
    const point = mapAnchor(anchor, {
      height,
      mirrored,
      videoHeight,
      videoWidth,
      width,
    })

    context.beginPath()
    context.fillStyle = 'rgba(186, 255, 221, 0.9)'
    context.arc(point.x, point.y, 3, 0, Math.PI * 2)
    context.fill()
  })
}
