import { useState, useCallback } from "react";
import type { EntityId, ToolMode, CameraResolution, Entity, SpriteAsset } from "../../shared/types/engine";
import { INITIAL_ENTITIES } from "../../shared/constants/data";

export interface EditorState {
  activeTool: ToolMode;
  selectedId: EntityId | null;
  isPlaying: boolean;
  isPaused: boolean;
  animOpen: boolean;
  cameraResolution: CameraResolution;
  /** All entities in the current scene (mutable for drag-drop additions) */
  entities: Entity[];
  /** All imported sprite assets */
  spriteAssets: SpriteAsset[];
}

export interface EditorActions {
  setActiveTool: (tool: ToolMode) => void;
  setSelectedId: (id: EntityId | null) => void;
  setIsPlaying: (val: boolean) => void;
  setIsPaused: (val: boolean) => void;
  setAnimOpen: (val: boolean) => void;
  setCameraResolution: (r: CameraResolution) => void;
  addSpriteAsset: (asset: SpriteAsset) => void;
  addSpriteEntity: (entity: Entity) => void;
  updateEntityTransform: (id: EntityId, patch: Partial<Entity["transform"]>) => void;
}

export function useEditorState(): EditorState & EditorActions {
  const [activeTool, setActiveTool] = useState<ToolMode>("translate");
  const [selectedId, setSelectedId] = useState<EntityId | null>("e1");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [animOpen, setAnimOpen] = useState(false);
  const [cameraResolution, setCameraResolution] = useState<CameraResolution>({
    preset: "laptop",
    width: 1920,
    height: 1080,
  });
  const [entities, setEntities] = useState<Entity[]>([...INITIAL_ENTITIES]);
  const [spriteAssets, setSpriteAssets] = useState<SpriteAsset[]>([]);

  const addSpriteAsset = useCallback((asset: SpriteAsset) => {
    setSpriteAssets((prev) => [...prev, asset]);
  }, []);

  const addSpriteEntity = useCallback((entity: Entity) => {
    setEntities((prev) => [...prev, entity]);
    setSelectedId(entity.id);
  }, []);

  const updateEntityTransform = useCallback(
    (id: EntityId, patch: Partial<Entity["transform"]>) => {
      setEntities((prev) =>
        prev.map((e) =>
          e.id === id ? { ...e, transform: { ...e.transform, ...patch } } : e
        )
      );
    },
    []
  );

  return {
    activeTool,
    selectedId,
    isPlaying,
    isPaused,
    animOpen,
    cameraResolution,
    entities,
    spriteAssets,
    setActiveTool,
    setSelectedId,
    setIsPlaying,
    setIsPaused,
    setAnimOpen,
    setCameraResolution,
    addSpriteAsset,
    addSpriteEntity,
    updateEntityTransform,
  };
}
