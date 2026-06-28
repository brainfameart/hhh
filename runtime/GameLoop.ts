// ─── Runtime: GameLoop ───────────────────────────────────────────────────────
// Pure TypeScript — drives the runtime tick via requestAnimationFrame.

export type TickCallback = (deltaTime: number) => void;

export class GameLoop {
  private _rafId: number | null = null;
  private _lastTime: number | null = null;
  private readonly _onTick: TickCallback;

  public constructor(onTick: TickCallback) {
    this._onTick = onTick;
  }

  public start(): void {
    if (this._rafId !== null) return;
    this._lastTime = null;
    this._rafId = requestAnimationFrame(this._tick);
  }

  public stop(): void {
    if (this._rafId !== null) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  public get isRunning(): boolean {
    return this._rafId !== null;
  }

  private readonly _tick = (now: number): void => {
    const dt = this._lastTime !== null ? (now - this._lastTime) / 1000 : 0;
    this._lastTime = now;
    this._onTick(Math.min(dt, 0.05)); // clamp to 50ms max step
    this._rafId = requestAnimationFrame(this._tick);
  };
}
