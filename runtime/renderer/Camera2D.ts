// ─── Renderer: Camera2D ──────────────────────────────────────────────────────
// Pure TypeScript — wraps canvas transform math.

import type { Vector2 } from "../../shared/types/engine";

export class Camera2D {
  public position: Vector2 = { x: 0, y: 0 };
  public zoom: number = 1;

  /**
   * Convert a world-space point to screen-space pixels given the canvas size.
   */
  public worldToScreen(
    worldPos: Vector2,
    canvasWidth: number,
    canvasHeight: number
  ): Vector2 {
    return {
      x: (worldPos.x - this.position.x) * this.zoom + canvasWidth / 2,
      y: -(worldPos.y - this.position.y) * this.zoom + canvasHeight / 2,
    };
  }

  /**
   * Convert a screen-space pixel coordinate back to world space.
   */
  public screenToWorld(
    screenPos: Vector2,
    canvasWidth: number,
    canvasHeight: number
  ): Vector2 {
    return {
      x: (screenPos.x - canvasWidth / 2) / this.zoom + this.position.x,
      y: -((screenPos.y - canvasHeight / 2) / this.zoom) + this.position.y,
    };
  }
}
