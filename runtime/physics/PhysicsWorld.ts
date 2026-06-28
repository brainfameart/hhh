// ─── Physics: PhysicsWorld ───────────────────────────────────────────────────
// Pure TypeScript — no DOM, no React.

import { aabbMTV, type AABB } from "./AABB";

export type BodyType = "dynamic" | "kinematic" | "static";

export interface PhysicsBody {
  id: string;
  type: BodyType;
  aabb: AABB;
  vx: number;
  vy: number;
  gravityScale: number;
  mass: number;
}

const GRAVITY = 9.81;

export class PhysicsWorld {
  private readonly _bodies: Map<string, PhysicsBody> = new Map();

  public addBody(body: PhysicsBody): void {
    this._bodies.set(body.id, body);
  }

  public removeBody(id: string): void {
    this._bodies.delete(id);
  }

  public getBody(id: string): PhysicsBody | undefined {
    return this._bodies.get(id);
  }

  public step(dt: number): void {
    // Apply gravity + integrate velocity
    for (const body of this._bodies.values()) {
      if (body.type !== "dynamic") continue;
      body.vy += GRAVITY * body.gravityScale * dt;
      (body.aabb as { x: number; y: number }).x += body.vx * dt;
      (body.aabb as { x: number; y: number }).y += body.vy * dt;
    }

    // Broad-phase: check every pair (fine for small scenes)
    const bodies = [...this._bodies.values()];
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        if (a === undefined || b === undefined) continue;
        if (a.type === "static" && b.type === "static") continue;

        const mtv = aabbMTV(a.aabb, b.aabb);
        if (mtv === null) continue;

        // Resolve: push dynamic bodies apart
        if (a.type === "dynamic" && b.type !== "dynamic") {
          (a.aabb as { x: number; y: number }).x -= mtv.dx;
          (a.aabb as { x: number; y: number }).y -= mtv.dy;
          if (mtv.dy !== 0) a.vy = 0;
          if (mtv.dx !== 0) a.vx = 0;
        } else if (b.type === "dynamic" && a.type !== "dynamic") {
          (b.aabb as { x: number; y: number }).x += mtv.dx;
          (b.aabb as { x: number; y: number }).y += mtv.dy;
          if (mtv.dy !== 0) b.vy = 0;
          if (mtv.dx !== 0) b.vx = 0;
        } else {
          // Both dynamic — split half-and-half
          (a.aabb as { x: number; y: number }).x -= mtv.dx / 2;
          (a.aabb as { x: number; y: number }).y -= mtv.dy / 2;
          (b.aabb as { x: number; y: number }).x += mtv.dx / 2;
          (b.aabb as { x: number; y: number }).y += mtv.dy / 2;
        }
      }
    }
  }
}
