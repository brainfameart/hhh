import React, { useCallback } from "react";
import { useEditorState } from "./hooks/useEditorState";
import { Toolbar } from "./components/toolbar/Toolbar";
import { HierarchyPanel } from "./components/hierarchy/HierarchyPanel";
import { ViewportPanel } from "./components/viewport/ViewportPanel";
import { InspectorPanel } from "./components/inspector/InspectorPanel";
import { BottomPanel } from "./components/bottom/BottomPanel";
import { AnimationEditor } from "./components/animation/AnimationEditor";
import { PlayWindow } from "./components/play/PlayWindow";
import { StatusBar } from "./components/StatusBar";
import type { SpriteAsset, Entity } from "../shared/types/engine";

export function EditorApp(): React.ReactElement {
  const state = useEditorState();

  const handlePlayToggle = (): void => {
    state.setIsPlaying(!state.isPlaying);
    state.setIsPaused(false);
  };

  const handlePauseToggle = (): void => {
    if (state.isPlaying) {
      state.setIsPaused(!state.isPaused);
    }
  };

  const handleDropSprite = useCallback(
    (asset: SpriteAsset, worldX: number, worldY: number) => {
      const newEntity: Entity = {
        id: crypto.randomUUID(),
        name: asset.name,
        tag: "Untagged",
        active: true,
        hasCamera: false,
        sprite: null,
        spriteAssetId: asset.id,
        light: null,
        transform: {
          position: { x: worldX, y: worldY, z: 0 },
          rotation: { x: 0, y: 0, z: 0 },
          scale: { x: 1, y: 1, z: 1 },
        },
      };
      state.addSpriteEntity(newEntity);
    },
    [state]
  );

  return (
    <div className="flex flex-col h-screen w-screen bg-[#1c1c1c] text-[#eee] overflow-hidden select-none">
      <div className="flex-1 flex flex-col unity-window">
        <Toolbar
          activeTool={state.activeTool}
          setActiveTool={state.setActiveTool}
          isPlaying={state.isPlaying}
          isPaused={state.isPaused}
          onPlayToggle={handlePlayToggle}
          onPauseToggle={handlePauseToggle}
          onImportSprite={state.addSpriteAsset}
        />

        <div className="flex flex-1 overflow-hidden bg-[#1c1c1c]">
          <div className="w-[250px] flex flex-col border-r border-[#1a1a1a]">
            <HierarchyPanel
              selectedId={state.selectedId}
              setSelectedId={state.setSelectedId}
              entities={state.entities}
            />
          </div>

          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 flex flex-col min-h-0">
              <ViewportPanel
                activeTool={state.activeTool}
                cameraResolution={state.cameraResolution}
                entities={state.entities}
                spriteAssets={state.spriteAssets}
                selectedId={state.selectedId}
                onSelectEntity={state.setSelectedId}
                onDropSprite={handleDropSprite}
                onUpdateTransform={state.updateEntityTransform}
              />
            </div>
            <div className="h-[200px] shrink-0 border-t border-[#1a1a1a]">
              <BottomPanel spriteAssets={state.spriteAssets} />
            </div>
          </div>

          <div className="w-[300px] flex flex-col border-l border-[#1a1a1a]">
            <InspectorPanel
              selectedId={state.selectedId}
              setAnimOpen={state.setAnimOpen}
              cameraResolution={state.cameraResolution}
              setCameraResolution={state.setCameraResolution}
              entities={state.entities}
              spriteAssets={state.spriteAssets}
              onUpdateTransform={state.updateEntityTransform}
            />
          </div>
        </div>

        <StatusBar />
      </div>

      {state.animOpen && (
        <AnimationEditor onClose={() => state.setAnimOpen(false)} />
      )}

      {state.isPlaying && (
        <PlayWindow
          cameraResolution={state.cameraResolution}
          onClose={() => { state.setIsPlaying(false); state.setIsPaused(false); }}
        />
      )}
    </div>
  );
}
