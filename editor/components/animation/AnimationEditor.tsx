import React from "react";
import { Film, X, StepForward, Play, ChevronDown } from "lucide-react";
import { DropdownInput } from "../ui/DropdownInput";

interface AnimationEditorProps {
  onClose: () => void;
}

const CLIP_OPTIONS = [
  "Player_Idle",
  "Player_Run",
  "Player_Jump",
  "Create New Clip...",
] as const;

const KEYFRAME_ROWS: Array<{ bg: string; keys: number[]; lineRange?: [number, number]; keyColor: string }> = [
  { bg: "#ffffff05", keys: [10, 30, 50], keyColor: "#ccc" },
  { bg: "#ffffff0a", keys: [10, 80],     keyColor: "#8FC153", lineRange: [10, 80] },
  { bg: "#ffffff10", keys: [],           keyColor: "#ccc" },
];

export function AnimationEditor({ onClose }: AnimationEditorProps): React.ReactElement {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto drop-shadow-2xl">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="w-[800px] h-[500px] bg-[#383838] border border-[#111] rounded-[3px] flex flex-col relative overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
        {/* Title bar */}
        <div className="h-[22px] bg-[#282828] border-b border-[#111] flex items-center justify-between px-2 select-none">
          <div className="flex items-center gap-1.5 text-[11px] text-[#ccc]">
            <Film size={12} /> Animation
          </div>
          <button
            onClick={onClose}
            className="p-0.5 text-[#aaa] hover:text-[#eee] hover:bg-[#ff453a] rounded-[2px]"
          >
            <X size={12} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="h-[24px] bg-[#383838] border-b border-[#202020] flex items-center px-2 gap-2 text-[11px] shrink-0">
          <div className="flex items-center gap-1 border border-[#202020] bg-[#2a2a2a] rounded-[2px] px-1 hover:border-[#444]">
            <span className="text-[#eee] w-[14px] h-[14px] flex items-center justify-center bg-[#444] rounded-[2px] mr-1">
              R
            </span>
            Preview
          </div>
          <div className="w-px h-3 bg-[#555]" />
          <button className="w-[18px] h-[18px] flex items-center justify-center hover:bg-[#444] text-[#ccc] rounded-[2px]">
            <StepForward size={12} className="rotate-180" />
          </button>
          <button className="w-[18px] h-[18px] flex items-center justify-center hover:bg-[#444] text-[#ccc] rounded-[2px]">
            <Play size={12} />
          </button>
          <button className="w-[18px] h-[18px] flex items-center justify-center hover:bg-[#444] text-[#ccc] rounded-[2px]">
            <StepForward size={12} />
          </button>
          <div className="w-px h-3 bg-[#555]" />
          <span className="text-[#ccc]">Samples</span>
          <input
            type="number"
            defaultValue={12}
            className="w-[40px] bg-[#2a2a2a] border border-[#202020] rounded-[2px] px-1 text-center outline-none text-[#eee]"
          />
          <div className="flex-1" />
          <DropdownInput options={[...CLIP_OPTIONS]} />
        </div>

        <div className="flex-1 flex overflow-hidden">
          {/* Properties list */}
          <div className="w-[250px] border-r border-[#1a1a1a] bg-[#383838] flex flex-col">
            <div className="h-[20px] bg-[#3e3e3e] border-b border-[#202020] flex items-center px-2">
              <span className="text-[10px] text-[#ccc] font-bold">Property</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              {(
                [
                  { label: "SpriteRenderer.Sprite", selected: false },
                  { label: "Transform.Position",    selected: true  },
                  { label: "Position.x",            selected: false, indent: true },
                ] as const
              ).map(({ label, selected, indent }) => (
                <div
                  key={label}
                  className={[
                    "flex items-center py-[2px] border-b border-[#202020]",
                    indent === true ? "px-4" : "px-1",
                    selected ? "bg-[#2C5D87] text-[#eee]" : "text-[#eee] hover:bg-[#444]",
                  ].join(" ")}
                >
                  {indent !== true && (
                    <ChevronDown size={10} className="mr-1 text-[#aaa]" />
                  )}
                  <span className={`text-[11px] flex-1 ${indent === true ? "text-[#ccc]" : ""}`}>
                    {label}
                  </span>
                </div>
              ))}
            </div>
            <div className="p-1 border-t border-[#202020]">
              <button className="w-full py-[2px] text-[11px] bg-[#444] text-[#eee] rounded-[2px] hover:bg-[#555]">
                Add Property
              </button>
            </div>
          </div>

          {/* Dope-sheet timeline */}
          <div className="flex-1 bg-[#282828] flex flex-col relative overflow-hidden">
            {/* Ruler */}
            <div className="h-[20px] bg-[#383838] border-b border-[#202020] relative flex overflow-hidden">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute h-full border-l border-[#555] flex flex-col justify-end px-1 select-none"
                  style={{ left: `${i * 10}%` }}
                >
                  <span className="text-[8px] text-[#aaa]">{i}:00</span>
                </div>
              ))}
            </div>

            {/* Keyframe rows */}
            <div className="flex-1 relative">
              {KEYFRAME_ROWS.map((row, ri) => (
                <div
                  key={ri}
                  className="h-[18px] border-b border-[#202020] relative"
                  style={{ background: row.bg }}
                >
                  {row.lineRange !== undefined && (
                    <div
                      className="absolute top-1/2 h-[1px] opacity-50"
                      style={{
                        left:  `${row.lineRange[0]}%`,
                        width: `${row.lineRange[1] - row.lineRange[0]}%`,
                        background: row.keyColor,
                      }}
                    />
                  )}
                  {row.keys.map((pct) => (
                    <div
                      key={pct}
                      className="absolute top-1/2 -translate-y-1/2 w-[4px] h-[8px] rotate-45"
                      style={{ left: `${pct}%`, background: row.keyColor }}
                    />
                  ))}
                </div>
              ))}

              {/* Playhead */}
              <div className="absolute top-0 bottom-0 w-px bg-[#ff453a] left-[30%] pointer-events-none z-10" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
