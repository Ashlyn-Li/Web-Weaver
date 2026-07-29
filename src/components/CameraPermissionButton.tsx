type CameraPermissionButtonProps = {
  label: string
  disabled?: boolean
  onClick: () => void
}

export function CameraPermissionButton({
  label,
  disabled = false,
  onClick,
}: CameraPermissionButtonProps) {
  return (
    <button
      type="button"
      className="camera-button"
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  )
}
