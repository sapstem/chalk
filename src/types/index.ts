// ─── Tool Types ───────────────────────────────────────────────────────────────

export type ToolType =
  | 'select'
  | 'hand'
  | 'rect'
  | 'ellipse'
  | 'arrow'
  | 'text'
  | 'pen'
  | 'eraser'
  | 'sticky'

// ─── Sticky Note Color ────────────────────────────────────────────────────────

export type StickyColor = 'yellow' | 'blue' | 'pink' | 'green'

// ─── Canvas Element Types ─────────────────────────────────────────────────────

export type ElementType = 'rect' | 'ellipse' | 'arrow' | 'text' | 'pen' | 'sticky'

export interface BaseElement {
  id: string
  type: ElementType
  x: number
  y: number
  rotation: number
  opacity: number
  locked: boolean
  visible: boolean
  strokeColor: string
  strokeWidth: number
  fillColor: string
}

export interface RectElement extends BaseElement {
  type: 'rect'
  width: number
  height: number
  cornerRadius: number
}

export interface EllipseElement extends BaseElement {
  type: 'ellipse'
  radiusX: number
  radiusY: number
}

export interface ArrowElement extends BaseElement {
  type: 'arrow'
  points: number[]         // flat [x1, y1, x2, y2]
  startArrow: boolean
  endArrow: boolean
}

export interface TextElement extends BaseElement {
  type: 'text'
  text: string
  fontSize: number
  fontFamily: string
  fontStyle: 'normal' | 'italic'
  fontWeight: 'normal' | 'bold'
  align: 'left' | 'center' | 'right'
  width: number
}

export interface PenElement extends BaseElement {
  type: 'pen'
  points: number[]         // flat [x1, y1, x2, y2, ...]
  tension: number
}

export interface StickyElement extends BaseElement {
  type: 'sticky'
  text: string
  color: StickyColor
  width: number
  height: number
}

export type CanvasElement =
  | RectElement
  | EllipseElement
  | ArrowElement
  | TextElement
  | PenElement
  | StickyElement

// ─── Viewport ─────────────────────────────────────────────────────────────────

export interface Viewport {
  x: number
  y: number
  scale: number
}

// ─── History ──────────────────────────────────────────────────────────────────

export interface HistoryEntry {
  elements: CanvasElement[]
}

// ─── Recent Board ─────────────────────────────────────────────────────────────

export interface RecentBoard {
  id: string
  name: string
  updatedAt: number   // unix ms
  thumbnail?: string  // base64 data URL, optional
}

// ─── Canvas Store Shape ───────────────────────────────────────────────────────

export interface DrawingDefaults {
  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number
}

export interface CanvasState {
  elements: CanvasElement[]
  selectedId: string | null
  activeTool: ToolType
  viewport: Viewport
  history: HistoryEntry[]
  historyIndex: number
  snapToGrid: boolean
  drawingDefaults: DrawingDefaults
}
