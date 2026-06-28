import type { Entity, SceneData, ConsoleLog, AnimationClip } from "../types/engine";

export const INITIAL_ENTITIES: readonly Entity[] = [
  {
    id: "e1",
    name: "Main Camera",
    tag: "MainCamera",
    active: true,
    hasCamera: true,
    sprite: null,
    spriteAssetId: null,
    light: null,
    transform: {
      position: { x: 0, y: 0, z: -10 },
      rotation: { x: 0, y: 0, z: 0 },
      scale: { x: 1, y: 1, z: 1 },
    },
  },
] satisfies Entity[];

export const INITIAL_SCENES: readonly SceneData[] = [
  {
    id: "s1",
    name: "Main Scene",
    entities: [...INITIAL_ENTITIES] as Entity[],
  },
] satisfies SceneData[];

export const INITIAL_LOGS: readonly ConsoleLog[] = [
  { id: "l1", type: "log",  msg: "Editor initialized successfully.",           ts: "10:00:01" },
  { id: "l2", type: "log",  msg: "Scene 'Main Scene' loaded. 1 GameObject.",  ts: "10:00:02" },
  { id: "l3", type: "warn", msg: "No scripts attached to Main Camera.",        ts: "10:00:05" },
] satisfies ConsoleLog[];;

export const INITIAL_CLIPS: readonly AnimationClip[] = [] satisfies AnimationClip[];

export const MENU_LABELS = [
  "File", "Edit", "Assets", "GameObject", "Component", "Window", "Help",
] as const;

export type MenuLabel = (typeof MENU_LABELS)[number];
