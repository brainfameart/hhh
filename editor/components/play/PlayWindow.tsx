import React, { useState, useRef, useEffect, useCallback } from "react";
import { X, Maximize2, Minimize2 } from "lucide-react";
import type { CameraResolution } from "../../../shared/types/engine";

interface PlayWindowProps {
  cameraResolution: CameraResolution;
  onClose: () => void;
}

export function PlayWindow({ cameraResolution, onClose }: PlayWindowProps): React.ReactElement {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const dragRef   = useRef({ dragging: false, ox: 0, oy: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const posRef    = useRef({ x: 0, y: 0 });
  const [, forceUpdate] = useState(0);

  const TITLE_H = 28;

  const windowSizePx = useCallback(() => {
    const maxW = window.innerWidth  * 0.72;
    const maxH = window.innerHeight * 0.72;
    const ar   = cameraResolution.width / cameraResolution.height;
    let w = maxW;
    let h = w / ar;
    if (h > maxH) { h = maxH; w = h * ar; }
    return { w: Math.round(w), h: Math.round(h) };
  }, [cameraResolution]);

  useEffect(() => {
    const { w, h } = windowSizePx();
    posRef.current = {
      x: (window.innerWidth  - w) / 2,
      y: (window.innerHeight - h - TITLE_H) / 2,
    };
    forceUpdate(n => n + 1);
  }, [windowSizePx]);

  const onTitlePointerDown = (e: React.PointerEvent) => {
    if (isFullscreen) return;
    dragRef.current = {
      dragging: true,
      ox: e.clientX - posRef.current.x,
      oy: e.clientY - posRef.current.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const onTitlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.dragging) return;
    posRef.current = {
      x: e.clientX - dragRef.current.ox,
      y: e.clientY - dragRef.current.oy,
    };
    forceUpdate(n => n + 1);
  };

  const onTitlePointerUp = () => {
    dragRef.current.dragging = false;
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) setIsFullscreen(false);
        else onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isFullscreen, onClose]);

  const { w: winW, h: winH } = windowSizePx();
  const { x: posX, y: posY } = posRef.current;

  const ar = cameraResolution.width / cameraResolution.height;

  if (isFullscreen) {
    const fsW = window.innerWidth;
    const fsH = window.innerHeight;
    let gameW = fsW;
    let gameH = fsW / ar;
    if (gameH > fsH) { gameH = fsH; gameW = fsH * ar; }

    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div
          className="shrink-0 h-[28px] flex items-center justify-between px-3 bg-[#1a1a1a] border-b border-[#333] select-none"
          style={{ cursor: "default" }}
        >
          <span className="text-[11px] text-[#aaa] font-medium">
            Game Preview — {cameraResolution.width}×{cameraResolution.height} (Fullscreen)
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullscreen(false)}
              className="w-[20px] h-[20px] flex items-center justify-center text-[#aaa] hover:text-white hover:bg-[#333] rounded"
            >
              <Minimize2 size={12} />
            </button>
            <button
              onClick={onClose}
              className="w-[20px] h-[20px] flex items-center justify-center text-[#aaa] hover:text-white hover:bg-[#c0392b] rounded"
            >
              <X size={12} />
            </button>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center bg-black">
          <div
            style={{ width: gameW, height: gameH }}
            className="bg-[#111] flex items-center justify-center relative overflow-hidden"
          >
            <div className="text-center select-none">
              <div className="text-[#4a9eff] text-[13px] font-medium mb-1">▶ Game Running</div>
              <div className="text-[#666] text-[11px]">
                {cameraResolution.width} × {cameraResolution.height}
              </div>
            </div>
            <div className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,0.012) 40px,rgba(255,255,255,0.012) 41px)",
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={windowRef}
      className="fixed z-50 bg-[#1a1a1a] border border-[#444] shadow-2xl overflow-hidden"
      style={{
        left: posX,
        top: posY,
        width: winW,
      }}
    >
      <div
        className="h-[28px] flex items-center justify-between px-2 bg-[#242424] border-b border-[#333] select-none"
        style={{ cursor: "grab" }}
        onPointerDown={onTitlePointerDown}
        onPointerMove={onTitlePointerMove}
        onPointerUp={onTitlePointerUp}
      >
        <span className="text-[11px] text-[#aaa] font-medium">
          ▶ Game Preview — {cameraResolution.width}×{cameraResolution.height}
        </span>
        <div className="flex items-center gap-1">
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={() => setIsFullscreen(true)}
            className="w-[18px] h-[18px] flex items-center justify-center text-[#888] hover:text-white hover:bg-[#333] rounded"
          >
            <Maximize2 size={11} />
          </button>
          <button
            onPointerDown={e => e.stopPropagation()}
            onClick={onClose}
            className="w-[18px] h-[18px] flex items-center justify-center text-[#888] hover:text-white hover:bg-[#c0392b] rounded"
          >
            <X size={11} />
          </button>
        </div>
      </div>

      <div
        style={{ width: winW, height: winH }}
        className="bg-[#111] flex items-center justify-center relative overflow-hidden"
      >
        <div className="text-center select-none">
          <div className="text-[#4a9eff] text-[13px] font-medium mb-1">▶ Game Running</div>
          <div className="text-[#555] text-[11px]">
            {cameraResolution.width} × {cameraResolution.height}
          </div>
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "repeating-linear-gradient(45deg,transparent,transparent 40px,rgba(255,255,255,0.015) 40px,rgba(255,255,255,0.015) 41px)",
          }}
        />
      </div>
    </div>
  );
}
