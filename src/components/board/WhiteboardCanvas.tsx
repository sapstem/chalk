import { useState, useRef, useEffect } from 'react'
import { Stage, Layer, Line, Rect, Ellipse, Arrow, Transformer, Text } from 'react-konva'
import Konva from 'konva'
import type { KonvaEventObject } from 'konva/lib/Node'
import { motion, useMotionValue } from 'framer-motion'
import { useCanvasStore } from '../../store/canvasStore'
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts'
import type {
  CanvasElement,
  PenElement,
  RectElement,
  EllipseElement,
  ArrowElement,
  TextElement,
  StickyElement,
  Viewport,
} from '../../types'
import StickyNote, { randomStickyColor, randomRotation } from './StickyNote'
import {
  generateId,
  snapCoord,
  GRID_SIZE,
  screenToCanvas,
  canvasToScreen,
} from '../../utils/canvasHelpers'

// ─── Constants ────────────────────────────────────────────────────────────────

const DOT_SIZE = 1.5
const STORAGE_KEY = 'chalk_elements'
const DRAWING_TOOLS = new Set(['pen', 'rect', 'ellipse', 'arrow'])
const DEFAULT_FONT_SIZE = 16

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
    case 'pen':     return el.points.length < 4
    case 'rect':    return el.width < 2 || el.height < 2
    case 'ellipse': return el.radiusX < 1 || el.radiusY < 1
    case 'arrow': {
      const [x1 = 0, y1 = 0, x2 = 0, y2 = 0] = el.points
      return Math.hypot(x2 - x1, y2 - y1) < 5
    }
    default: return false
  }
}

// ─── Active text editor state ─────────────────────────────────────────────────

interface ActiveTextEditor {
  id: string
  x: number   // canvas coords
  y: number   // canvas coords
  text: string
}

// ─── Element renderer ─────────────────────────────────────────────────────────

interface RenderOpts {
  selectable: boolean
  selected: boolean
  onSelect: () => void
  onDragEnd: (node: Konva.Node) => void
}

function renderElement(
  el: CanvasElement,
  opts: RenderOpts,
  key?: string,
): React.ReactNode {
  const shared = {
    key: key ?? el.id,
    id: el.id,
    opacity: el.opacity,
    listening: opts.selectable,
    draggable: opts.selectable && opts.selected,
    onClick: opts.onSelect,
    onDragEnd: (e: KonvaEventObject<MouseEvent>) => opts.onDragEnd(e.target as Konva.Node),
  }

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
          hitStrokeWidth={Math.max(el.strokeWidth, 12)}
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
          x={el.x}
          y={el.y}
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
          hitStrokeWidth={Math.max(el.strokeWidth, 12)}
        />
      )
    case 'text': {
      const fontStyle = [
        el.fontWeight === 'bold' ? 'bold' : '',
        el.fontStyle === 'italic' ? 'italic' : '',
      ].filter(Boolean).join(' ') || 'normal'
      return (
        <Text
          {...shared}
          x={el.x}
          y={el.y}
          text={el.text}
          fontSize={el.fontSize}
          fontFamily={el.fontFamily}
          fontStyle={fontStyle}
          align={el.align}
          fill={el.strokeColor}
          width={el.width > 0 ? el.width : undefined}
        />
      )
    }
    default:
      return null
  }
}

// ─── Drag-end position update ─────────────────────────────────────────────────

function applyDrag(
  el: CanvasElement,
  node: Konva.Node,
  update: (id: string, changes: Partial<CanvasElement>) => void,
) {
  if (el.type === 'rect' || el.type === 'ellipse' || el.type === 'text') {
    update(el.id, { x: node.x(), y: node.y() })
  } else if (el.type === 'pen' || el.type === 'arrow') {
    const dx = node.x()
    const dy = node.y()
    const newPoints = el.points.map((v, i) => (i % 2 === 0 ? v + dx : v + dy))
    update(el.id, { points: newPoints } as Partial<CanvasElement>)
    node.position({ x: 0, y: 0 })
  }
}

// ─── Sticky note canvas item ──────────────────────────────────────────────────

interface StickyNoteItemProps {
  el: StickyElement
  viewport: Viewport
  interactive: boolean
  onUpdate: (x: number, y: number) => void
  onTextCommit: (text: string) => void
}

function StickyNoteItem({ el, viewport, interactive, onUpdate, onTextCommit }: StickyNoteItemProps) {
  const { x: initX, y: initY } = canvasToScreen(el.x, el.y, viewport)
  const motionX = useMotionValue(initX)
  const motionY = useMotionValue(initY)
  const isDragging = useRef(false)

  // Sync screen position when store coords or viewport changes (skip during drag)
  useEffect(() => {
    if (isDragging.current) return
    const { x: sx, y: sy } = canvasToScreen(el.x, el.y, viewport)
    motionX.set(sx)
    motionY.set(sy)
  }, [el.x, el.y, viewport.x, viewport.y, viewport.scale, motionX, motionY])

  return (
    <motion.div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        x: motionX,
        y: motionY,
        scale: viewport.scale,
        transformOrigin: 'top left',
        zIndex: 5,
        // Block pointer events when a non-sticky/select tool is active
        pointerEvents: interactive ? 'auto' : 'none',
        cursor: 'grab',
      }}
      drag
      dragMomentum
      dragTransition={{ power: 0.25, timeConstant: 180 }}
      whileDrag={{ cursor: 'grabbing', zIndex: 50 }}
      onDragStart={() => { isDragging.current = true }}
      // Update store once inertia settles so stored coords match final resting position
      onDragTransitionEnd={() => {
        isDragging.current = false
        const { x: newX, y: newY } = screenToCanvas(motionX.get(), motionY.get(), viewport)
        onUpdate(newX, newY)
      }}
    >
      <StickyNote
        initialText={el.text}
        color={el.color}
        rotation={el.rotation}
        width={el.width}
        height={el.height}
        onCommit={onTextCommit}
      />
    </motion.div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function WhiteboardCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const [stageSize, setStageSize] = useState({ width: 0, height: 0 })
  const [inProgress, setInProgress] = useState<CanvasElement | null>(null)
  const [activeText, setActiveText] = useState<ActiveTextEditor | null>(null)

  const isDrawing = useRef(false)
  const startPos = useRef({ x: 0, y: 0 })

  const {
    elements,
    viewport,
    snapToGrid,
    activeTool,
    drawingDefaults,
    selectedId,
    setSelectedId,
    addElement,
    updateElement,
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

  // ── Persist elements to localStorage ──────────────────────────────────────
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(elements))
  }, [elements])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useKeyboardShortcuts()

  // ── Sync Transformer with selected node ────────────────────────────────────
  useEffect(() => {
    const tr = transformerRef.current
    if (!tr) return
    if (selectedId) {
      const node = stageRef.current?.findOne(`#${selectedId}`)
      if (node) {
        tr.nodes([node as Konva.Shape])
      } else {
        tr.nodes([])
      }
    } else {
      tr.nodes([])
    }
    tr.getLayer()?.batchDraw()
  }, [selectedId, elements])

  // ── Coordinate helpers ─────────────────────────────────────────────────────
  const getCanvasPos = (): { x: number; y: number } | null => {
    const pos = stageRef.current?.getPointerPosition()
    if (!pos) return null
    const raw = screenToCanvas(pos.x, pos.y, viewport)
    return {
      x: snapCoord(raw.x, snapToGrid),
      y: snapCoord(raw.y, snapToGrid),
    }
  }

  // ── Text tool ──────────────────────────────────────────────────────────────
  const commitText = () => {
    if (!activeText || !activeText.text.trim()) {
      setActiveText(null)
      return
    }
    const el: TextElement = {
      id: activeText.id,
      type: 'text',
      x: activeText.x,
      y: activeText.y,
      rotation: 0,
      opacity: drawingDefaults.opacity,
      locked: false,
      visible: true,
      fillColor: 'transparent',
      strokeColor: drawingDefaults.strokeColor,
      strokeWidth: 0,
      text: activeText.text,
      fontSize: DEFAULT_FONT_SIZE,
      fontFamily: 'Inter, system-ui, sans-serif',
      fontStyle: 'normal',
      fontWeight: 'normal',
      align: 'left',
      width: 0,
    }
    addElement(el)
    pushHistory()
    setActiveText(null)
  }

  // ── Mouse handlers ─────────────────────────────────────────────────────────
  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    // Sticky tool: place a new sticky note on background click
    if (activeTool === 'sticky') {
      if (e.target === stageRef.current) {
        const pos = getCanvasPos()
        if (!pos) return
        const el: StickyElement = {
          id: generateId(),
          type: 'sticky',
          x: pos.x,
          y: pos.y,
          rotation: randomRotation(),
          opacity: 1,
          locked: false,
          visible: true,
          fillColor: 'transparent',
          strokeColor: 'transparent',
          strokeWidth: 0,
          text: '',
          color: randomStickyColor(),
          width: 200,
          height: 200,
        }
        addElement(el)
        pushHistory()
      }
      return
    }

    // Text tool: only place on background click, blur handles existing commit
    if (activeTool === 'text') {
      if (activeText) return // in-flight textarea will blur → commit
      if (e.target === stageRef.current) {
        const pos = getCanvasPos()
        if (pos) setActiveText({ id: generateId(), x: pos.x, y: pos.y, text: '' })
      }
      return
    }

    // Select tool: background click → deselect
    if (activeTool === 'select') {
      if (e.target === stageRef.current) setSelectedId(null)
      return
    }

    if (!DRAWING_TOOLS.has(activeTool)) return
    const pos = getCanvasPos()
    if (!pos) return

    isDrawing.current = true
    startPos.current = pos

    const base = {
      id: generateId(),
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
      setInProgress({ ...inProgress, points: [...inProgress.points, pos.x, pos.y] })
    } else if (inProgress.type === 'rect') {
      setInProgress({
        ...inProgress,
        ...normalizeRect(
          startPos.current.x,
          startPos.current.y,
          pos.x - startPos.current.x,
          pos.y - startPos.current.y,
        ),
      })
    } else if (inProgress.type === 'ellipse') {
      setInProgress({
        ...inProgress,
        x: (startPos.current.x + pos.x) / 2,
        y: (startPos.current.y + pos.y) / 2,
        radiusX: Math.abs(pos.x - startPos.current.x) / 2,
        radiusY: Math.abs(pos.y - startPos.current.y) / 2,
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

  const handleDragEnd = (el: CanvasElement, node: Konva.Node) => {
    applyDrag(el, node, updateElement)
    pushHistory()
  }

  // ── Derived ────────────────────────────────────────────────────────────────
  const isSelectTool = activeTool === 'select'
  const isTextTool = activeTool === 'text'

  const inProgressOpts: RenderOpts = {
    selectable: false,
    selected: false,
    onSelect: () => {},
    onDragEnd: () => {},
  }

  const dotOffsetX = ((viewport.x % GRID_SIZE) + GRID_SIZE) % GRID_SIZE
  const dotOffsetY = ((viewport.y % GRID_SIZE) + GRID_SIZE) % GRID_SIZE

  const cursor = isTextTool
    ? 'text'
    : isSelectTool
    ? 'grab'
    : DRAWING_TOOLS.has(activeTool)
    ? 'crosshair'
    : 'default'

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#1a1a1c', cursor }}
    >
      {/* Dot grid */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: -GRID_SIZE,
          backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.18) ${DOT_SIZE}px, transparent ${DOT_SIZE}px)`,
          backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
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
            inset: -GRID_SIZE,
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
            backgroundPosition: `${dotOffsetX}px ${dotOffsetY}px`,
            pointerEvents: 'none',
          }}
        />
      )}

      {/* Empty state */}
      {elements.length === 0 && !inProgress && !activeText && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" opacity={0.18}>
            <path
              d="M22 5L8 19l-3 4 4-3L23 6a1.414 1.414 0 0 0-2-2Z"
              stroke="white"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
          </svg>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--font-size-sm)',
              color: 'rgba(255,255,255,0.15)',
              letterSpacing: '0.04em',
            }}
          >
            start drawing
          </span>
        </div>
      )}

      {/* Sticky notes HTML overlay — rendered above Konva stage */}
      {elements
        .filter((el): el is StickyElement => el.type === 'sticky')
        .map((el) => (
          <StickyNoteItem
            key={el.id}
            el={el}
            viewport={viewport}
            interactive={isSelectTool || activeTool === 'sticky'}
            onUpdate={(x, y) => {
              updateElement(el.id, { x, y })
              pushHistory()
            }}
            onTextCommit={(text) => updateElement(el.id, { text })}
          />
        ))}

      {/* Konva Stage */}
      {stageSize.width > 0 && (
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          style={{ position: 'absolute', top: 0, left: 0 }}
          onMouseDown={handleStageMouseDown}
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
            {elements.map((el) =>
              renderElement(el, {
                selectable: isSelectTool,
                selected: el.id === selectedId,
                onSelect: () => setSelectedId(el.id),
                onDragEnd: (node) => handleDragEnd(el, node),
              }),
            )}
            {inProgress && renderElement(inProgress, inProgressOpts, '__inprogress__')}
            <Transformer
              ref={transformerRef}
              resizeEnabled={false}
              rotateEnabled={false}
              borderStroke="#5b6af0"
              borderStrokeWidth={2}
              borderDash={[5, 3]}
              anchorSize={0}
            />
          </Layer>
        </Stage>
      )}

      {/* Text editor overlay */}
      {activeText && (
        <textarea
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          value={activeText.text}
          rows={Math.max(1, activeText.text.split('\n').length)}
          onChange={(e) => setActiveText({ ...activeText, text: e.target.value })}
          onBlur={commitText}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setActiveText(null)
            } else if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              commitText()
            }
          }}
          style={{
            position: 'absolute',
            left: canvasToScreen(activeText.x, activeText.y, viewport).x,
            top: canvasToScreen(activeText.x, activeText.y, viewport).y,
            fontSize: `${DEFAULT_FONT_SIZE * viewport.scale}px`,
            fontFamily: 'Inter, system-ui, sans-serif',
            lineHeight: 1.4,
            color: drawingDefaults.strokeColor,
            caretColor: drawingDefaults.strokeColor,
            background: 'transparent',
            border: 'none',
            outline: '1.5px dashed rgba(91, 106, 240, 0.55)',
            outlineOffset: 4,
            borderRadius: 2,
            resize: 'none',
            padding: 0,
            margin: 0,
            minWidth: 4,
            width: 200,
            overflow: 'hidden',
            zIndex: 10,
          }}
        />
      )}
    </div>
  )
}
