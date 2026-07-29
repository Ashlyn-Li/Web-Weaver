type StatusIndicatorProps = {
  text: string
}

export function StatusIndicator({ text }: StatusIndicatorProps) {
  return (
    <p className="status-indicator" role="status">
      {text}
    </p>
  )
}
