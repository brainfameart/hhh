import React, { useRef, useState } from "react";
import {
  Hand, Move, RefreshCw, Maximize2,
  Play, Pause, StepForward, Layers, ChevronDown, Image,
} from "lucide-react";
import type { ToolMode, SpriteAsset } from "../../../shared/types/engine";
import { MENU_LABELS } from "../../../shared/constants/data";

interface ToolbarProps {
  activeTool: ToolMode;
  setActiveTool: (tool: ToolMode) => void;
  isPlaying: boolean;
  isPaused: boolean;
  onPlayToggle: () => void;
  onPauseToggle: () => void;
  onImportSprite: (asset: SpriteAsset) => void;
}

const TOOL_BUTTONS: Array<{ id: ToolMode; icon: React.ReactElement }> = [
  { id: "pan",       icon: <Hand size={13} /> },
  { id: "translate", icon: <Move size={13} /> },
  { id: "rotate",    icon: <RefreshCw size={13} /> },
  { id: "scale",     icon: <Maximize2 size={13} /> },
];

export function Toolbar({
  activeTool,
  setActiveTool,
  isPlaying,
  isPaused,
  onPlayToggle,
  onPauseToggle,
  onImportSprite,
}: ToolbarProps): React.ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const handleMenuClick = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  const handleImportSprite = () => {
    setOpenMenu(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const img = new window.Image();
      img.onload = () => {
        const asset: SpriteAsset = {
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^/.]+$/, ""),
          url,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };
        onImportSprite(asset);
      };
      img.src = url;
    });
    // Reset so same file can be re-imported
    e.target.value = "";
  };

  return (
    <div className="flex flex-col shrink-0 bg-[#1e1e1e] border-b border-[#1a1a1a]">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Menu Bar */}
      <div className="h-[20px] flex items-center px-2 bg-[#1e1e1e] relative z-50">
        {MENU_LABELS.map((label) => (
          <div key={label} className="relative">
            <button
              onClick={() => handleMenuClick(label)}
              className={[
                "px-2 h-full text-[11px] select-none",
                openMenu === label
                  ? "bg-[#2C5D87] text-white"
                  : "text-[#ccc] hover:bg-[#383838] hover:text-[#eee]",
              ].join(" ")}
            >
              {label}
            </button>

            {/* Assets dropdown */}
            {label === "Assets" && openMenu === "Assets" && (
              <div className="absolute top-full left-0 bg-[#252525] border border-[#1a1a1a] shadow-xl min-w-[200px] py-1 z-50">
                <div className="px-3 py-[2px] text-[10px] text-[#666] uppercase tracking-wider font-bold border-b border-[#333] mb-1">
                  Import
                </div>
                <button
                  onClick={handleImportSprite}
                  className="w-full flex items-center gap-2 px-3 py-[4px] text-[12px] text-[#ccc] hover:bg-[#2C5D87] hover:text-white text-left"
                >
                  <Image size={12} />
                  Import 2D Sprite…
                </button>
                <div className="border-t border-[#333] mt-1 pt-1">
                  <button className="w-full flex items-center gap-2 px-3 py-[4px] text-[12px] text-[#666] cursor-not-allowed text-left">
                    <Layers size={12} />
                    Import Audio (soon)
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Click outside to close menus */}
        {openMenu !== null && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpenMenu(null)}
          />
        )}
      </div>

      {/* Main Toolbar */}
      <div className="h-[30px] bg-[#383838] border-t border-[#444] border-b border-[#1a1a1a] flex items-center px-2 relative shadow-sm">
        {/* Left tool group */}
        <div className="flex bg-[#2a2a2a] rounded-[3px] border border-[#202020] overflow-hidden">
          {TOOL_BUTTONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTool(t.id)}
              title={t.id.charAt(0).toUpperCase() + t.id.slice(1)}
              className={[
                "w-[26px] h-[22px] flex items-center justify-center",
                "border-r border-[#202020] last:border-0 transition-colors",
                activeTool === t.id
                  ? "bg-[#555] text-[#eee] shadow-inner"
                  : "text-[#aaa] hover:bg-[#333] hover:text-[#eee]",
              ].join(" ")}
            >
              {t.icon}
            </button>
          ))}
        </div>

        {/* Centered play controls */}
        <div className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center gap-0.5">
          <div className="flex bg-[#2a2a2a] rounded-[3px] border border-[#202020] p-[1px]">
            <button
              onClick={onPlayToggle}
              className={[
                "w-[26px] h-[20px] flex items-center justify-center rounded-[2px] transition-colors",
                isPlaying
                  ? "bg-[#3A72B0] text-[#eee] shadow-inner"
                  : "text-[#aaa] hover:bg-[#333] hover:text-[#eee]",
              ].join(" ")}
            >
              <Play size={13} fill={isPlaying ? "currentColor" : "none"} />
            </button>
            <button
              onClick={onPauseToggle}
              className={[
                "w-[26px] h-[20px] flex items-center justify-center rounded-[2px] transition-colors",
                isPaused
                  ? "bg-[#555] text-[#eee] shadow-inner"
                  : "text-[#aaa] hover:bg-[#333] hover:text-[#eee]",
              ].join(" ")}
            >
              <Pause size={13} fill={isPaused ? "currentColor" : "none"} />
            </button>
            <button className="w-[26px] h-[20px] flex items-center justify-center rounded-[2px] text-[#aaa] hover:bg-[#333] hover:text-[#eee] transition-colors">
              <StepForward size={13} />
            </button>
          </div>
        </div>

        {/* Right controls */}
        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-1 bg-[#2a2a2a] border border-[#202020] rounded-[3px] px-2 py-[2px] text-[11px] text-[#ccc] hover:bg-[#333]">
            <Layers size={12} /> Layers <ChevronDown size={10} />
          </button>
          <button className="flex items-center gap-1 bg-[#2a2a2a] border border-[#202020] rounded-[3px] px-2 py-[2px] text-[11px] text-[#ccc] hover:bg-[#333]">
            Layout <ChevronDown size={10} />
          </button>
        </div>
      </div>
    </div>
  );
}
