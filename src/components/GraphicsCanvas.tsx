import { forwardRef } from 'react'

type GraphicsCanvasProps = {
  className?: string
}

export const GraphicsCanvas = forwardRef<HTMLCanvasElement, GraphicsCanvasProps>(
  function GraphicsCanvas({ className }, ref) {
    return (
      <canvas
        className={className ? `graphics-canvas ${className}` : 'graphics-canvas'}
        ref={ref}
        aria-hidden="true"
      />
    )
  },
)
