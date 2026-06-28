import React from "react";
import { Info, MoreVertical, Move, Camera, Image } from "lucide-react";
import type { EntityId, CameraResolution, ResolutionPreset, Entity, SpriteAsset } from "../../../shared/types/engine";
import { RESOLUTION_PRESETS } from "../../../shared/types/engine";
import { TabBtn, Section, Row, NumInput, Vector3Input, DropdownInput } from "../ui";

interface InspectorPanelProps {
  selectedId: EntityId | null;
  setAnimOpen: (val: boolean) => void;
  cameraResolution: CameraResolution;
  setCameraResolution: (r: CameraResolution) => void;
  entities: Entity[];
  spriteAssets: SpriteAsset[];
  onUpdateTransform: (id: EntityId, patch: Partial<Entity["transform"]>) => void;
}

const PRESET_OPTIONS = [
  "Laptop (1920×1080)",
  "Phone Landscape (1280×720)",
  "Phone Portrait (720×1280)",
  "Tablet (1024×768)",
  "Custom",
];

const PRESET_KEYS: ResolutionPreset[] = [
  "laptop", "phoneLandscape", "phonePortrait", "tablet", "custom",
];

function presetLabel(preset: ResolutionPreset): string {
  if (preset === "custom") return "Custom";
  return RESOLUTION_PRESETS[preset].label;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function InspectorPanel({
  selectedId,
  cameraResolution,
  setCameraResolution,
  entities,
  spriteAssets,
  onUpdateTransform,
}: InspectorPanelProps): React.ReactElement {
  const entity = selectedId !== null
    ? entities.find((e) => e.id === selectedId)
    : undefined;

  const onPresetChange = (label: string) => {
    const idx = PRESET_OPTIONS.indexOf(label);
    if (idx < 0) return;
    const key = PRESET_KEYS[idx];
    if (!key) return;
    if (key === "custom") {
      setCameraResolution({ preset: "custom", width: cameraResolution.width, height: cameraResolution.height });
    } else {
      const p = RESOLUTION_PRESETS[key];
      setCameraResolution({ preset: key, width: p.width, height: p.height });
    }
  };

  const onWidthChange = (v: number) => {
    setCameraResolution({ preset: "custom", width: Math.max(1, Math.round(v)), height: cameraResolution.height });
  };
  const onHeightChange = (v: number) => {
    setCameraResolution({ preset: "custom", width: cameraResolution.width, height: Math.max(1, Math.round(v)) });
  };

  if (entity === undefined) {
    return (
      <div className="w-full bg-[#383838] flex flex-col h-full">
        <div className="flex items-center bg-[#282828] border-b border-[#1a1a1a]">
          <TabBtn active label="Inspector" icon={<Info size={12} />} />
        </div>
        <div className="flex-1 flex items-center justify-center text-[#888] text-[11px] p-4 text-center">
          No object selected
        </div>
      </div>
    );
  }

  const spriteAsset = entity.spriteAssetId
    ? spriteAssets.find((a) => a.id === entity.spriteAssetId)
    : undefined;

  const ar = cameraResolution.width / cameraResolution.height;
  const arLabel =
    Math.abs(ar - 16 / 9) < 0.01  ? "16:9" :
    Math.abs(ar - 9 / 16) < 0.01  ? "9:16" :
    Math.abs(ar - 4 / 3) < 0.01   ? "4:3"  :
    `${cameraResolution.width / gcd(cameraResolution.width, cameraResolution.height)}:${cameraResolution.height / gcd(cameraResolution.width, cameraResolution.height)}`;

  const pos = entity.transform.position;
  const rot = entity.transform.rotation;
  const scl = entity.transform.scale;

  return (
    <div className="w-full bg-[#383838] flex flex-col overflow-hidden h-full">
      <div className="flex items-center bg-[#282828] border-b border-[#1a1a1a] justify-between pr-1 shrink-0">
        <TabBtn active label="Inspector" icon={<Info size={12} />} />
        <button className="p-1 text-[#aaa] hover:text-[#eee]">
          <MoreVertical size={12} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Header */}
        <div className="p-2 border-b border-[#202020] bg-[#383838] space-y-2">
          <div className="flex items-center gap-1.5">
            <input type="checkbox" defaultChecked className="accent-[#2C5D87] m-0" />
            <input
              type="text"
              defaultValue={entity.name}
              className="flex-1 bg-[#2a2a2a] border border-[#202020] px-1 py-[2px] text-[12px] font-bold text-[#eee] outline-none hover:border-[#444] focus:border-[#2C5D87]"
            />
            <div className="flex items-center gap-1 px-1 bg-[#333] border border-[#202020] rounded-[2px]">
              <input type="checkbox" className="accent-[#2C5D87] m-0" />
              <span className="text-[10px] text-[#ccc] pr-1">Static</span>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full pt-1">
            <div className="flex items-center gap-1 flex-1">
              <span className="text-[#ccc] text-[11px] w-[30px]">Tag</span>
              <DropdownInput options={["Untagged", "MainCamera", "Player", "Add Tag..."]} />
            </div>
            <div className="flex items-center gap-1 flex-1">
              <span className="text-[#ccc] text-[11px] w-[35px]">Layer</span>
              <DropdownInput options={["Default", "UI", "Add Layer..."]} />
            </div>
          </div>
        </div>

        {/* Transform */}
        <Section title="Transform" icon={<Move size={12} />}>
          <Row label="Position">
            <Vector3Input
              x={pos.x} y={pos.y} z={pos.z}
              onChangeX={(v) => onUpdateTransform(entity.id, { position: { ...pos, x: v } })}
              onChangeY={(v) => onUpdateTransform(entity.id, { position: { ...pos, y: v } })}
              onChangeZ={(v) => onUpdateTransform(entity.id, { position: { ...pos, z: v } })}
            />
          </Row>
          <Row label="Rotation">
            <Vector3Input
              x={rot.x} y={rot.y} z={rot.z}
              onChangeX={(v) => onUpdateTransform(entity.id, { rotation: { ...rot, x: v } })}
              onChangeY={(v) => onUpdateTransform(entity.id, { rotation: { ...rot, y: v } })}
              onChangeZ={(v) => onUpdateTransform(entity.id, { rotation: { ...rot, z: v } })}
            />
          </Row>
          <Row label="Scale">
            <Vector3Input
              x={scl.x} y={scl.y} z={scl.z}
              onChangeX={(v) => onUpdateTransform(entity.id, { scale: { ...scl, x: v } })}
              onChangeY={(v) => onUpdateTransform(entity.id, { scale: { ...scl, y: v } })}
              onChangeZ={(v) => onUpdateTransform(entity.id, { scale: { ...scl, z: v } })}
            />
          </Row>
        </Section>

        {/* Sprite Renderer section (if sprite entity) */}
        {!entity.hasCamera && (
          <Section title="Sprite Renderer" icon={<Image size={12} />}>
            {spriteAsset ? (
              <>
                <Row label="Sprite">
                  <div className="flex items-center gap-1 flex-1">
                    <div className="w-[28px] h-[28px] bg-[#222] border border-[#333] rounded overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src={spriteAsset.url}
                        alt={spriteAsset.name}
                        className="max-w-full max-h-full object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                    </div>
                    <span className="text-[11px] text-[#ccc] truncate">{spriteAsset.name}</span>
                  </div>
                </Row>
                <Row label="Size">
                  <span className="text-[11px] text-[#777]">
                    {spriteAsset.width} × {spriteAsset.height} px
                  </span>
                </Row>
                <Row label="Color">
                  <div className="flex w-full h-[16px] bg-white border border-[#202020] rounded-[2px] cursor-pointer" />
                </Row>
                <Row label="Flip X">
                  <input type="checkbox" className="accent-[#2C5D87]" />
                </Row>
                <Row label="Flip Y">
                  <input type="checkbox" className="accent-[#2C5D87]" />
                </Row>
                <Row label="Order">
                  <NumInput value={0} onChange={() => {}} />
                </Row>
              </>
            ) : (
              <div className="px-2 py-2 text-[11px] text-[#666] italic">
                No sprite assigned
              </div>
            )}
          </Section>
        )}

        {/* Camera section (if camera entity) */}
        {entity.hasCamera && (
          <Section title="Camera" icon={<Camera size={12} />}>
            <Row label="Projection">
              <DropdownInput options={["Orthographic", "Perspective"]} />
            </Row>
            <Row label="Background">
              <div className="flex w-full h-[16px] bg-[#1a1a2e] border border-[#202020] rounded-[2px] cursor-pointer" />
            </Row>
            <div className="px-2 pt-2 pb-1">
              <span className="text-[10px] text-[#888] uppercase tracking-wider font-bold">Resolution</span>
            </div>
            <Row label="Preset">
              <DropdownInput
                options={PRESET_OPTIONS}
                value={presetLabel(cameraResolution.preset)}
                onChange={onPresetChange}
              />
            </Row>
            <Row label="Width">
              <NumInput value={cameraResolution.width} onChange={onWidthChange} />
            </Row>
            <Row label="Height">
              <NumInput value={cameraResolution.height} onChange={onHeightChange} />
            </Row>
            <div className="px-2 pb-2 flex items-center justify-between">
              <span className="text-[10px] text-[#777]">Aspect ratio</span>
              <span className="text-[10px] text-[#4a9eff] font-medium">{arLabel}</span>
            </div>
            <div className="px-2 pb-3">
              <div className="w-full h-[48px] bg-[#2a2a2a] border border-[#333] rounded flex items-center justify-center">
                <div
                  className="bg-[#1a2a3a] border border-[#4a9eff] border-opacity-60"
                  style={{
                    aspectRatio: `${cameraResolution.width} / ${cameraResolution.height}`,
                    maxWidth: "100%",
                    maxHeight: "100%",
                    width: ar >= 1 ? "80%" : undefined,
                    height: ar < 1 ? "80%" : undefined,
                  }}
                />
              </div>
            </div>
          </Section>
        )}

        <div className="p-4 flex justify-center border-t border-[#202020]">
          <button className="bg-[#444] hover:bg-[#555] border border-[#202020] text-[#eee] text-[11px] py-[3px] px-8 rounded-[3px] shadow-sm">
            Add Component
          </button>
        </div>
      </div>
    </div>
  );
}
