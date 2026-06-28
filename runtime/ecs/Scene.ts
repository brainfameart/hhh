// ─── ECS: Scene ──────────────────────────────────────────────────────────────
// Pure TypeScript — orchestrates GameObjects in the runtime.

import { GameObject } from "./GameObject";

export class Scene {
  public readonly name: string;
  private readonly _objects: Map<string, GameObject> = new Map();

  public constructor(name: string) {
    this.name = name;
  }

  public addObject(obj: GameObject): void {
    if (this._objects.has(obj.id)) {
      throw new Error(`Scene already contains object with id '${obj.id}'.`);
    }
    this._objects.set(obj.id, obj);
  }

  public getObject(id: string): GameObject | undefined {
    return this._objects.get(id);
  }

  public removeObject(id: string): void {
    const obj = this._objects.get(id);
    obj?.destroy();
    this._objects.delete(id);
  }

  /** Tick all objects. Call from the game loop. */
  public update(deltaTime: number): void {
    for (const obj of this._objects.values()) {
      obj.update(deltaTime);
    }
  }

  public get objectCount(): number {
    return this._objects.size;
  }
}
