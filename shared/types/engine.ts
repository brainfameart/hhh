export type EntityId = string;

export type SpriteShape = "square" | "capsule" | "circle" | "triangle";

export type LightType = "point" | "spot" | "global" | "freeform";

export type LogLevel = "log" | "warn" | "error";

export type ToolMode = "pan" | "translate" | "rotate" | "scale";

export type ResolutionPreset =
  | "laptop"
  | "phoneLandscape"
  | "phonePortrait"
  | "tablet"
  | "custom";

export interface CameraResolution {
  preset: ResolutionPreset;
  width: number;
  height: number;
}

export const RESOLUTION_PRESETS: Record<
  Exclude<ResolutionPreset, "custom">,
  { width: number; height: number; label: string }
> = {
  laptop:         { width: 1920, height: 1080, label: "Laptop (1920×1080)" },
  phoneLandscape: { width: 1280, height: 720,  label: "Phone Landscape (1280×720)" },
  phonePortrait:  { width: 720,  height: 1280, label: "Phone Portrait (720×1280)" },
  tablet:         { width: 1024, height: 768,  label: "Tablet (1024×768)" },
};

export interface Vector2 {
  readonly x: number;
  readonly y: number;
}

export interface Vector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

export interface Transform {
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
}

export interface Entity {
  readonly id: EntityId;
  name: string;
  tag: string;
  active: boolean;
  hasCamera: boolean;
  sprite: SpriteShape | null;
  /** URL (data: or object:) of an imported texture asset, if any */
  spriteAssetId: string | null;
  light: LightType | null;
  transform: Transform;
}

export interface SceneData {
  readonly id: string;
  name: string;
  entities: Entity[];
}

export interface ConsoleLog {
  readonly id: string;
  readonly type: LogLevel;
  readonly msg: string;
  readonly ts: string;
}

export interface AnimationClip {
  readonly id: string;
  name: string;
  fps: number;
  frames: number;
  isDefault: boolean;
}

/** A 2D sprite image asset imported by the user. */
export interface SpriteAsset {
  /** Unique id (e.g. generated with crypto.randomUUID()) */
  readonly id: string;
  /** Display name (original file name without extension) */
  name: string;
  /** Object URL created from the uploaded File */
  url: string;
  /** Width of the source image in pixels */
  width: number;
  /** Height of the source image in pixels */
  height: number;
}
