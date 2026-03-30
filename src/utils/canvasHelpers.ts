import type { Viewport } from '../types'

// ─── ID generation ────────────────────────────────────────────────────────────

export function generateId(): string {
  return crypto.randomUUID()
}

// ─── Zoom ─────────────────────────────────────────────────────────────────────

export const MIN_ZOOM = 0.1
export const MAX_ZOOM = 4

/** Clamp a scale value within the allowed zoom range. */
export function clampZoom(scale: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale))
}

/** Round zoom scale to avoid floating-point drift (e.g. 0.30000000004). */
export function roundZoom(scale: number): number {
  return Math.round(scale * 100) / 100
}

/** Convert a scale value to a display percentage string (e.g. 1.5 → "150"). */
export function zoomPercent(scale: number): number {
  return Math.round(scale * 100)
}

// ─── Grid snapping ────────────────────────────────────────────────────────────

export const GRID_SIZE = 24

/**
 * Snap a coordinate to the nearest grid line.
 * Returns the value unchanged when `enabled` is false.
 */
export function snapCoord(v: number, enabled: boolean, gridSize = GRID_SIZE): number {
  return enabled ? Math.round(v / gridSize) * gridSize : v
}

// ─── Coordinate conversion ────────────────────────────────────────────────────

/** Convert a screen-space point to canvas-space using the current viewport. */
export function screenToCanvas(
  screenX: number,
  screenY: number,
  viewport: Viewport,
): { x: number; y: number } {
  return {
    x: (screenX - viewport.x) / viewport.scale,
    y: (screenY - viewport.y) / viewport.scale,
  }
}

/** Convert a canvas-space point to screen-space using the current viewport. */
export function canvasToScreen(
  canvasX: number,
  canvasY: number,
  viewport: Viewport,
): { x: number; y: number } {
  return {
    x: canvasX * viewport.scale + viewport.x,
    y: canvasY * viewport.scale + viewport.y,
  }
}

// ─── Color utils ──────────────────────────────────────────────────────────────

/** Parse a 6-digit hex color string into its RGB components. */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return null
  return {
    r: parseInt(result[1]!, 16),
    g: parseInt(result[2]!, 16),
    b: parseInt(result[3]!, 16),
  }
}

/**
 * Returns `true` for perceptually light colors.
 * Useful for deciding whether to render dark or light text on a given background.
 * Uses the ITU-R BT.709 luminance coefficients.
 */
export function isLightColor(hex: string): boolean {
  const rgb = hexToRgb(hex)
  if (!rgb) return false
  const luminance = 0.2126 * rgb.r + 0.7152 * rgb.g + 0.0722 * rgb.b
  return luminance > 140
}

/** Append an alpha channel to a hex color, returning an `rgba()` string. */
export function withAlpha(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return hex
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`
}
