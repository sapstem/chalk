import { useRef } from 'react'
import { useCanvasStore } from '../../store/canvasStore'

const DOT_SIZE = 1.5
const DOT_SPACING = 24

export default function WhiteboardCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { viewport, snapToGrid } = useCanvasStore()

  // Offset the dot grid to follow viewport pan
  const dotOffsetX = ((viewport.x % DOT_SPACING) + DOT_SPACING) % DOT_SPACING
  const dotOffsetY = ((viewport.y % DOT_SPACING) + DOT_SPACING) % DOT_SPACING

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1a1c',
        cursor: 'crosshair',
      }}
    >
      {/* Dot grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: -DOT_SPACING,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.18) ${DOT_SIZE}px, transparent ${DOT_SIZE}px)`,
          backgroundSize: `${DOT_SPACING}px ${DOT_SPACING}px`,
          backgroundPosition: `${dotOffsetX}px ${dotOffsetY}px`,
          pointerEvents: 'none',
        }}
      />

      {/* Snap grid overlay (only visible when snap is on) */}
      {snapToGrid && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: -DOT_SPACING,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: `${DOT_SPACING}px ${DOT_SPACING}px`,
            backgroundPosition: `${dotOffsetX}px ${dotOffsetY}px`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Canvas stage placeholder — Konva Stage mounts here later */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 'var(--font-size-sm)',
            color: 'rgba(255,255,255,0.12)',
            userSelect: 'none',
          }}
        >
          Canvas renders here
        </p>
      </div>
    </div>
  )
}
