// ─── ECS: GameObject ─────────────────────────────────────────────────────────
// Pure TypeScript — no React, no DOM manipulation.

import type { Component } from "./Component";
import type { Vector3 } from "../../shared/types/engine";

export class GameObject {
  public readonly id: string;
  public name: string;
  public active: boolean = true;

  public position: Vector3 = { x: 0, y: 0, z: 0 };
  public rotation: Vector3 = { x: 0, y: 0, z: 0 };
  public scale: Vector3 = { x: 1, y: 1, z: 1 };

  private readonly _components: Map<string, Component> = new Map();

  public constructor(id: string, name: string) {
    this.id = id;
    this.name = name;
  }

  /** Attach a component. Calls onAwake immediately. */
  public addComponent<T extends Component>(
    key: string,
    component: T
  ): T {
    if (this._components.has(key)) {
      throw new Error(
        `GameObject '${this.name}' already has a component with key '${key}'.`
      );
    }
    this._components.set(key, component);
    component.onAwake();
    return component;
  }

  /** Retrieve a component by key. Returns undefined if not found. */
  public getComponent<T extends Component>(key: string): T | undefined {
    return this._components.get(key) as T | undefined;
  }

  /** Remove and destroy a component by key. */
  public removeComponent(key: string): void {
    const c = this._components.get(key);
    if (c !== undefined) {
      c.onDestroy();
      this._components.delete(key);
    }
  }

  /** Update all active components. */
  public update(deltaTime: number): void {
    if (!this.active) return;
    for (const component of this._components.values()) {
      if (component.enabled) {
        component.onUpdate(deltaTime);
      }
    }
  }

  /** Destroy all components. */
  public destroy(): void {
    for (const component of this._components.values()) {
      component.onDestroy();
    }
    this._components.clear();
  }
}
