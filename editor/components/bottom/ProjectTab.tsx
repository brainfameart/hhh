import React, { useState } from "react";
import { ChevronDown, Folder, Image } from "lucide-react";
import type { SpriteAsset } from "../../../shared/types/engine";

interface ProjectTabProps {
  spriteAssets: SpriteAsset[];
}

const FOLDERS = ["Scenes", "Sprites", "Scripts"] as const;
type FolderName = (typeof FOLDERS)[number];

export function ProjectTab({ spriteAssets }: ProjectTabProps): React.ReactElement {
  const [activeFolder, setActiveFolder] = useState<FolderName>("Sprites");

  const handleDragStart = (e: React.DragEvent, asset: SpriteAsset) => {
    e.dataTransfer.effectAllowed = "copy";
    e.dataTransfer.setData("application/zen-sprite", JSON.stringify({
      id: asset.id,
      name: asset.name,
      url: asset.url,
      width: asset.width,
      height: asset.height,
    }));
  };

  return (
    <div className="flex flex-1 min-h-0 bg-[#383838]">
      {/* Left file tree */}
      <div className="w-[200px] border-r border-[#1a1a1a] bg-[#383838] overflow-y-auto py-1">
        <div className="flex items-center px-1 py-[2px] text-[#eee] hover:bg-[#444] cursor-pointer">
          <ChevronDown size={12} className="text-[#aaa] mr-0.5" />
          <Folder size={12} className="text-[#ccc] mr-1" fill="currentColor" />
          <span className="text-[11px]">Assets</span>
        </div>
        {FOLDERS.map((label) => (
          <div
            key={label}
            onClick={() => setActiveFolder(label)}
            className={[
              "flex items-center pl-5 pr-2 py-[2px] cursor-pointer",
              activeFolder === label ? "bg-[#2C5D87] text-white" : "text-[#ccc] hover:bg-[#444]",
            ].join(" ")}
          >
            <Folder
              size={12}
              className={`mr-1 ${activeFolder === label ? "text-white" : "text-[#ccc]"}`}
            />
            <span className="text-[11px]">{label}</span>
            {label === "Sprites" && spriteAssets.length > 0 && (
              <span className="ml-auto text-[9px] bg-[#444] text-[#aaa] rounded px-1">
                {spriteAssets.length}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Right asset view */}
      <div className="flex-1 flex flex-col bg-[#282828]">
        <div className="h-[22px] border-b border-[#202020] bg-[#383838] flex items-center px-2">
          <span className="text-[11px] text-[#eee]">Assets &gt; {activeFolder}</span>
        </div>

        {activeFolder === "Sprites" ? (
          <div className="flex-1 p-2 overflow-y-auto">
            {spriteAssets.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-[#555] text-[11px] gap-1">
                <Image size={24} className="text-[#444]" />
                <span>No sprites imported yet.</span>
                <span className="text-[#444]">Use Assets → Import 2D Sprite…</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2 items-start content-start">
                {spriteAssets.map((asset) => (
                  <div
                    key={asset.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, asset)}
                    className="flex flex-col items-center w-[70px] gap-1 cursor-grab active:cursor-grabbing group"
                    title={`${asset.name}\n${asset.width}×${asset.height}px\nDrag to scene`}
                  >
                    <div className="w-[60px] h-[60px] bg-[#333] border border-[#202020] rounded-[2px] flex items-center justify-center group-hover:border-[#2C5D87] shadow-sm relative overflow-hidden">
                      <img
                        src={asset.url}
                        alt={asset.name}
                        className="max-w-full max-h-full object-contain"
                        style={{ imageRendering: "pixelated" }}
                      />
                      <div className="absolute bottom-0 right-0 bg-[#222] text-[#ccc] text-[8px] px-1 border-t border-l border-[#202020]">
                        PNG
                      </div>
                    </div>
                    <span className="text-[11px] text-[#ccc] w-full text-center truncate group-hover:text-[#eee] group-hover:bg-[#2C5D87] group-hover:px-1 rounded-[2px]">
                      {asset.name}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-[#555] text-[11px]">
            Empty folder
          </div>
        )}
      </div>
    </div>
  );
}
