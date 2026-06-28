// ─── ECS: Component ─────────────────────────────────────────────────────────
// Pure TypeScript — no React, no DOM manipulation.

export abstract class Component {
  public enabled: boolean = true;

  /** Called once when the component is first attached to an entity. */
  public onAwake(): void {}

  /** Called every frame while the component is active. */
  public onUpdate(_deltaTime: number): void {}

  /** Called when the component is destroyed. */
  public onDestroy(): void {}
}
