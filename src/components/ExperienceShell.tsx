import { LandingView } from './LandingView'
import { StatusIndicator } from './StatusIndicator'
import type { ApplicationPhase } from '../types/application'

type ExperienceShellProps = {
  phase: ApplicationPhase
  statusText: string
}

export function ExperienceShell({ phase, statusText }: ExperienceShellProps) {
  return (
    <main className="experience-shell" data-phase={phase}>
      <div className="experience-layer experience-layer--camera" aria-hidden="true" />
      <div className="experience-layer experience-layer--graphics" aria-hidden="true" />
      <div className="experience-layer experience-layer--interface">
        <LandingView statusText={statusText} />
      </div>
      <div className="experience-layer experience-layer--status">
        <StatusIndicator text={statusText} />
      </div>
    </main>
  )
}
