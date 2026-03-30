import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Line, Rect, Ellipse, Arrow } from 'react-konva'
import Konva from 'konva'
import { useCanvasStore } from '../../store/canvasStore'
import type {
  CanvasElement,
  PenElement,
  RectElement,
  EllipseElement,
  ArrowElement,
} from '../../types'

// ─── Constants ────────────────────────────────────────────────────────────────

const DOT_SIZE = 1.5
const DOT_SPACING = 24
const STORAGE_KEY = 'chalk_elements'
const DRAWING_TOOLS = new Set(['pen', 'rect', 'ellipse', 'arrow'])

// ─── Helpers ──────────────────────────────────────────────────────────────────

function genId(): string {
  return crypto.randomUUID()
}

function snapCoord(v: number, snap: boolean): number {
  return snap ? Math.round(v / DOT_SPACING) * DOT_SPACING : v
}

function normalizeRect(x: number, y: number, w: number, h: number) {
  return {
    x: w < 0 ? x + w : x,
    y: h < 0 ? y + h : y,
    width: Math.abs(w),
    height: Math.abs(h),
  }
}

function isTooSmall(el: CanvasElement): boolean {
  switch (el.type) {
    case 'pen':    return el.points.length < 4
    case 'rect':   return el.width < 2 || el.height < 2
    case 'ellipse': return el.radiusX < 1 || el.radiusY < 1
    case 'arrow': {
      const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = el.points
      return Math.hypot(x2 - x1, y2 - y1) < 5
    }
    default: return false
  }
}

// ─── Element renderer ─────────────────────────────────────────────────────────

function renderElement(el: CanvasElement, key?: string): React.ReactNode {
  const shared = { key: key ?? el.id, opacity: el.opacity, listening: false }

  switch (el.type) {
    case 'pen':
      return (
        <Line
          {...shared}
          x={el.x}
          y={el.y}
          points={el.points}
          stroke={el.strokeColor}
          strokeWidth={el.strokeWidth}
          tension={el.tension}
          lineCap="round"
          lineJoin="round"
        />
      )
    case 'rect':
      return (
        <Rect
          {...shared}
          x={el.x}
          y={el.y}
          width={el.width}
          height={el.height}
          cornerRadius={el.cornerRadius}
          fill={el.fillColor}
          stroke={el.strokeColor}
          strokeWidth={el.strokeWidth}
        />
      )
    case 'ellipse':
      return (
        <Ellipse
          {...shared}
          // x,y stored as top-left; Konva expects center
          x={el.x + el.radiusX}
          y={el.y + el.radiusY}
          radiusX={el.radiusX}
          radiusY={el.radiusY}
          fill={el.fillColor}
          stroke={el.strokeColor}
          strokeWidth={el.strokeWidth}
        />
      )
    case 'arrow':
      return (
        <Arrow
          {...shared}
          x={el.x}
          y={el.y}
          points={el.points}
          fill={el.strokeColor}
          stroke={el.strokeColor}
          strokeWidth={el.strokeWidth}
          pointerAtBeginning={el.startArrow}
          pointerAtEnding={el.endArrow}
          pointerLength={10}
          pointerWidth={8}
        />
      )
    default:
      return null
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WhiteboardCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [inProgress, setInProgress] = useState<CanvasElement | null>(null)

  const isDrawing = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })

  const {
    elements,
    viewport,
    snapToGrid,
    activeTool,
    drawingDefaults,
    addElement,
    pushHistory,
  } = useCanvasStore()

  // ── Resize observer ────────────────────────────────────────────────────────
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setStageSize({ width: el.offsetWidth, height: el.offsetHeight })
    })
    ro.observe(el)
    setStageSize({ width: el.offsetWidth, height: el.offsetHeight })
    return () => ro.disconnect()
  }, [])

  // ── Persist to localStorage ────────────────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements))
  }, [elements])

  // ── Coordinate helpers ─────────────────────────────────────────────────────
  const getCanvasPos = (): { x: number; y: number } | null => {
    const pos = stageRef.current?.getPointerPosition()
    if (!pos) return null
    return {
      x: snapCoord((pos.x - viewport.x) / viewport.scale, snapToGrid),
      y: snapCoord((pos.y - viewport.y) / viewport.scale, snapToGrid),
    }
  }

  // ── Mouse handlers ─────────────────────────────────────────────────────────
  const handleMouseDown = () => {
    if (!DRAWING_TOOLS.has(activeTool)) return
    const pos = getCanvasPos()
    if (!pos) return

    isDrawing.current = true
    startPos.current = pos

    const base = {
      id: genId(),
      x: 0,
      y: 0,
      rotation: 0,
      opacity: drawingDefaults.opacity,
      locked: false,
      visible: true,
      fillColor: drawingDefaults.fillColor,
      strokeColor: drawingDefaults.strokeColor,
      strokeWidth: drawingDefaults.strokeWidth,
    }

    let el: CanvasElement | null = null

    if (activeTool === 'pen') {
      el = {
        ...base,
        type: 'pen',
        points: [pos.x, pos.y],
        tension: 0.5,
      } satisfies PenElement
    } else if (activeTool === 'rect') {
      el = {
        ...base,
        type: 'rect',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        cornerRadius: 4,
      } satisfies RectElement
    } else if (activeTool === 'ellipse') {
      el = {
        ...base,
        type: 'ellipse',
        x: pos.x,
        y: pos.y,
        radiusX: 0,
        radiusY: 0,
      } satisfies EllipseElement
    } else if (activeTool === 'arrow') {
      el = {
        ...base,
        type: 'arrow',
        points: [pos.x, pos.y, pos.x, pos.y],
        startArrow: false,
        endArrow: true,
      } satisfies ArrowElement
    }

    if (el) setInProgress(el)
  }

  const handleMouseMove = () => {
    if (!isDrawing.current || !inProgress) return
    const pos = getCanvasPos()
    if (!pos) return

    if (inProgress.type === 'pen') {
      setInProgress({
        ...inProgress,
        points: [...inProgress.points, pos.x, pos.y],
      })
    } else if (inProgress.type === 'rect') {
      const norm = normalizeRect(
        startPos.current.x,
        startPos.current.y,
        pos.x - startPos.current.x,
        pos.y - startPos.current.y,
      )
      setInProgress({ ...inProgress, ...norm })
    } else if (inProgress.type === 'ellipse') {
      const radiusX = Math.abs(pos.x - startPos.current.x) / 2
      const radiusY = Math.abs(pos.y - startPos.current.y) / 2
      setInProgress({
        ...inProgress,
        x: Math.min(pos.x, startPos.current.x),
        y: Math.min(pos.y, startPos.current.y),
        radiusX,
        radiusY,
      })
    } else if (inProgress.type === 'arrow') {
      setInProgress({
        ...inProgress,
        points: [startPos.current.x, startPos.current.y, pos.x, pos.y],
      })
    }
  }

  const commitDrawing = () => {
    if (!isDrawing.current) return
    isDrawing.current = false
    if (inProgress && !isTooSmall(inProgress)) {
      addElement(inProgress)
      pushHistory()
    }
    setInProgress(null)
  }

  // ── Dot grid offsets follow viewport pan ───────────────────────────────────
  const dotOffsetX = ((viewport.x % DOT_SPACING) + DOT_SPACING) % DOT_SPACING
  const dotOffsetY = ((viewport.y % DOT_SPACING) + DOT_SPACING) % DOT_SPACING

  const isDrawingTool = DRAWING_TOOLS.has(activeTool)

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1a1c',
        cursor: isDrawingTool ? 'crosshair' : 'default',
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

      {/* Snap grid overlay */}
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

      {/* Konva Stage */}
      {stageSize.width > 0 && (
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          style={{ position: 'absolute', top: 0, left: 0 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={commitDrawing}
          onMouseLeave={commitDrawing}
        >
          <Layer
            x={viewport.x}
            y={viewport.y}
            scaleX={viewport.scale}
            scaleY={viewport.scale}
          >
            {elements.map((el) => renderElement(el))}
            {inProgress && renderElement(inProgress, '__inprogress__')}
          </Layer>
        </Stage>
      )}
    </div>
  )
}
