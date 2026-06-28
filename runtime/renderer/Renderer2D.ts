// ─── Renderer: Renderer2D ────────────────────────────────────────────────────
// Pure TypeScript — uses the Canvas 2D API. No React.

import type { Camera2D } from "./Camera2D";

export interface RenderCommand {
  type: "rect" | "circle" | "line";
  x: number;
  y: number;
  width?: number;
  height?: number;
  radius?: number;
  color: string;
  strokeOnly?: boolean;
}

export class Renderer2D {
  private readonly _canvas: HTMLCanvasElement;
  private readonly _ctx: CanvasRenderingContext2D;

  public constructor(canvas: HTMLCanvasElement) {
    this._canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (ctx === null) {
      throw new Error("Failed to get 2D rendering context from canvas.");
    }
    this._ctx = ctx;
  }

  public get width(): number {
    return this._canvas.width;
  }

  public get height(): number {
    return this._canvas.height;
  }

  public clear(color = "#282828"): void {
    this._ctx.fillStyle = color;
    this._ctx.fillRect(0, 0, this.width, this.height);
  }

  public drawGrid(camera: Camera2D, gridSize = 20): void {
    const ctx = this._ctx;
    const w = this.width;
    const h = this.height;

    ctx.save();
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.lineWidth = 1;

    const scaledGrid = gridSize * camera.zoom;
    const offsetX = ((-camera.position.x * camera.zoom) % scaledGrid + scaledGrid) % scaledGrid;
    const offsetY = ((-camera.position.y * camera.zoom) % scaledGrid + scaledGrid) % scaledGrid;

    for (let x = offsetX; x < w; x += scaledGrid) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = offsetY; y < h; y += scaledGrid) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  public submit(cmd: RenderCommand): void {
    const ctx = this._ctx;
    ctx.save();

    if (cmd.type === "rect") {
      const w = cmd.width ?? 50;
      const h = cmd.height ?? 50;
      if (cmd.strokeOnly === true) {
        ctx.strokeStyle = cmd.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(cmd.x - w / 2, cmd.y - h / 2, w, h);
      } else {
        ctx.fillStyle = cmd.color;
        ctx.fillRect(cmd.x - w / 2, cmd.y - h / 2, w, h);
      }
    } else if (cmd.type === "circle") {
      const r = cmd.radius ?? 25;
      ctx.beginPath();
      ctx.arc(cmd.x, cmd.y, r, 0, Math.PI * 2);
      if (cmd.strokeOnly === true) {
        ctx.strokeStyle = cmd.color;
        ctx.lineWidth = 2;
        ctx.stroke();
      } else {
        ctx.fillStyle = cmd.color;
        ctx.fill();
      }
    }

    ctx.restore();
  }
}
