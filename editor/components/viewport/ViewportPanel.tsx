import React, { useRef, useEffect, useCallback } from "react";
import { Grid, Monitor } from "lucide-react";
import { TabBtn } from "../ui/TabBtn";
import type { ToolMode, CameraResolution, Entity, EntityId, SpriteAsset } from "../../../shared/types/engine";

interface ViewportPanelProps {
  activeTool: ToolMode;
  cameraResolution: CameraResolution;
  entities: Entity[];
  spriteAssets: SpriteAsset[];
  selectedId: EntityId | null;
  onSelectEntity: (id: EntityId | null) => void;
  onDropSprite: (asset: SpriteAsset, worldX: number, worldY: number) => void;
  onUpdateTransform: (id: EntityId, patch: Partial<Entity["transform"]>) => void;
}

function gridStep(zoom: number, minPx = 28): { fine: number; coarse: number } {
  const steps = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 2500, 5000];
  let fine = steps[steps.length - 1]!;
  for (const s of steps) { if (s * zoom >= minPx) { fine = s; break; } }
  return { fine, coarse: fine * 5 };
}

function hex(colour: string, alpha = 1): string {
  return alpha < 1 ? `${colour}${Math.round(alpha * 255).toString(16).padStart(2, "0")}` : colour;
}

// ── Sprite cache for canvas drawing ──────────────────────────────────────────
const imgCache = new Map<string, HTMLImageElement>();

function getCachedImage(url: string): HTMLImageElement | null {
  if (imgCache.has(url)) return imgCache.get(url)!;
  const img = new window.Image();
  img.crossOrigin = "anonymous";
  img.onload = () => imgCache.set(url, img);
  img.onerror = () => imgCache.delete(url);
  img.src = url;
  return null; // not ready yet
}

type GizmoHit = "translate-x" | "translate-y" | "translate-xy" | "scale-x" | "scale-y" | "scale-xy" | null;

export function ViewportPanel({
  activeTool,
  cameraResolution,
  entities,
  spriteAssets,
  selectedId,
  onSelectEntity,
  onDropSprite,
  onUpdateTransform,
}: ViewportPanelProps): React.ReactElement {
  const wrapperRef    = useRef<HTMLDivElement>(null);
  const canvasRef     = useRef<HTMLCanvasElement>(null);
  const toolRef       = useRef(activeTool);
  const resRef        = useRef(cameraResolution);
  const entitiesRef   = useRef(entities);
  const selectedIdRef = useRef(selectedId);
  const assetsRef     = useRef(spriteAssets);
  const onSelectRef   = useRef(onSelectEntity);
  const onDropRef     = useRef(onDropSprite);
  const onTransformRef = useRef(onUpdateTransform);

  useEffect(() => { toolRef.current = activeTool; }, [activeTool]);
  useEffect(() => { resRef.current = cameraResolution; }, [cameraResolution]);
  useEffect(() => { entitiesRef.current = entities; }, [entities]);
  useEffect(() => { selectedIdRef.current = selectedId; }, [selectedId]);
  useEffect(() => { assetsRef.current = spriteAssets; }, [spriteAssets]);
  useEffect(() => { onSelectRef.current = onSelectEntity; }, [onSelectEntity]);
  useEffect(() => { onDropRef.current = onDropSprite; }, [onDropSprite]);
  useEffect(() => { onTransformRef.current = onUpdateTransform; }, [onUpdateTransform]);

  useEffect(() => {
    if (canvasRef.current)
      canvasRef.current.style.cursor = activeTool === "pan" ? "grab" : "default";
  }, [activeTool]);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas  = canvasRef.current;
    if (!wrapper || !canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let rafId    = 0;
    let destroyed = false;

    // ── Viewport state ──────────────────────────────────────────────────
    const s = {
      zoom: 0.5, panX: 0, panY: 0,
      down: false, middle: false, lastX: 0, lastY: 0,
      // Gizmo drag state
      dragging: false,
      dragHit: null as GizmoHit,
      dragEntityId: null as string | null,
      dragStartWx: 0, dragStartWy: 0,
      dragStartPosX: 0, dragStartPosY: 0,
      dragStartScX: 1, dragStartScY: 1,
    };

    const resize = () => {
      const w = wrapper.clientWidth;
      const h = wrapper.clientHeight;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width  = w;
        canvas.height = h;
      }
    };

    const fitZoom = () => {
      const res = resRef.current;
      if (!res || res.width === 0 || res.height === 0) return;
      s.zoom = Math.min((canvas.width * 0.72) / res.width, (canvas.height * 0.72) / res.height);
      s.panX = 0; s.panY = 0;
    };

    resize();
    fitZoom();

    const observer = new ResizeObserver(() => { if (!destroyed) resize(); });
    observer.observe(wrapper);

    // world ↔ screen helpers
    const toSx = (wx: number) => wx * s.zoom + canvas.width  / 2 + s.panX;
    const toSy = (wy: number) => wy * s.zoom + canvas.height / 2 + s.panY;
    const toWx = (sx: number) => (sx - canvas.width  / 2 - s.panX) / s.zoom;
    const toWy = (sy: number) => (sy - canvas.height / 2 - s.panY) / s.zoom;

    // ── Hit-test gizmo for a given entity ─────────────────────────────
    const ARROW = 44;  // arrow arm length in screen px
    const BOX   = 7;   // half-size of the square handle

    function hitTestGizmo(mx: number, my: number, entity: Entity, tool: ToolMode): GizmoHit {
      const cx = toSx(entity.transform.position.x);
      const cy = toSy(entity.transform.position.y);

      if (tool === "translate") {
        // XY box (corner)
        if (Math.abs(mx - (cx + ARROW * 0.35)) < BOX * 1.5 && Math.abs(my - (cy - ARROW * 0.35)) < BOX * 1.5) return "translate-xy";
        // X arrow tip
        if (Math.abs(mx - (cx + ARROW)) < BOX + 3 && Math.abs(my - cy) < BOX + 3) return "translate-x";
        // Y arrow tip
        if (Math.abs(mx - cx) < BOX + 3 && Math.abs(my - (cy - ARROW)) < BOX + 3) return "translate-y";
      }
      if (tool === "scale") {
        const sw = getEntityScreenW(entity) / 2;
        const sh = getEntityScreenH(entity) / 2;
        // Corner box
        if (Math.abs(mx - (cx + sw + BOX * 2)) < BOX + 2 && Math.abs(my - (cy - sh - BOX * 2)) < BOX + 2) return "scale-xy";
        // X edge box
        if (Math.abs(mx - (cx + sw + BOX * 2)) < BOX + 2 && Math.abs(my - cy) < BOX + 2) return "scale-x";
        // Y edge box
        if (Math.abs(mx - cx) < BOX + 2 && Math.abs(my - (cy - sh - BOX * 2)) < BOX + 2) return "scale-y";
      }
      return null;
    }

    function getEntityScreenW(entity: Entity): number {
      const asset = assetsRef.current.find(a => a.id === entity.spriteAssetId);
      const baseW = asset ? Math.min(asset.width, 100) : 60;
      return baseW * entity.transform.scale.x * s.zoom;
    }
    function getEntityScreenH(entity: Entity): number {
      const asset = assetsRef.current.find(a => a.id === entity.spriteAssetId);
      const baseH = asset ? Math.min(asset.height, 100) : 60;
      return baseH * entity.transform.scale.y * s.zoom;
    }

    // Hit test entity body
    function hitTestEntity(mx: number, my: number, entity: Entity): boolean {
      const cx = toSx(entity.transform.position.x);
      const cy = toSy(entity.transform.position.y);
      const hw = getEntityScreenW(entity) / 2;
      const hh = getEntityScreenH(entity) / 2;
      return mx >= cx - hw && mx <= cx + hw && my >= cy - hh && my <= cy + hh;
    }

    // ── Draw gizmo overlays ────────────────────────────────────────────
    function drawTranslateGizmo(cx: number, cy: number) {
      // X axis (red)
      ctx.strokeStyle = "#e05252"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + ARROW, cy); ctx.stroke();
      // X arrowhead
      ctx.fillStyle = "#e05252";
      ctx.beginPath();
      ctx.moveTo(cx + ARROW + 8, cy);
      ctx.lineTo(cx + ARROW, cy - 4);
      ctx.lineTo(cx + ARROW, cy + 4);
      ctx.closePath(); ctx.fill();
      // Y axis (green - up)
      ctx.strokeStyle = "#52e087"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx, cy - ARROW); ctx.stroke();
      // Y arrowhead
      ctx.fillStyle = "#52e087";
      ctx.beginPath();
      ctx.moveTo(cx, cy - ARROW - 8);
      ctx.lineTo(cx - 4, cy - ARROW);
      ctx.lineTo(cx + 4, cy - ARROW);
      ctx.closePath(); ctx.fill();
      // XY corner box
      ctx.fillStyle = "rgba(255,220,50,0.7)";
      ctx.fillRect(cx + ARROW * 0.35 - BOX, cy - ARROW * 0.35 - BOX, BOX * 2, BOX * 2);
      ctx.strokeStyle = "#ffdc32"; ctx.lineWidth = 1;
      ctx.strokeRect(cx + ARROW * 0.35 - BOX, cy - ARROW * 0.35 - BOX, BOX * 2, BOX * 2);
    }

    function drawScaleGizmo(cx: number, cy: number, hw: number, hh: number) {
      const px = cx + hw + BOX * 2;
      const py = cy - hh - BOX * 2;
      // X arm
      ctx.strokeStyle = "#e05252"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx + hw, cy); ctx.lineTo(px, cy); ctx.stroke();
      ctx.fillStyle = "#e05252";
      ctx.fillRect(px - BOX, cy - BOX, BOX * 2, BOX * 2);
      // Y arm
      ctx.strokeStyle = "#52e087"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(cx, cy - hh); ctx.lineTo(cx, py); ctx.stroke();
      ctx.fillStyle = "#52e087";
      ctx.fillRect(cx - BOX, py - BOX, BOX * 2, BOX * 2);
      // XY corner
      ctx.fillStyle = "rgba(255,220,50,0.8)";
      ctx.fillRect(px - BOX, py - BOX, BOX * 2, BOX * 2);
      ctx.strokeStyle = "#ffdc32"; ctx.lineWidth = 1;
      ctx.strokeRect(px - BOX, py - BOX, BOX * 2, BOX * 2);
    }

    // ── Main render loop ───────────────────────────────────────────────
    const render = () => {
      if (destroyed) return;
      rafId = requestAnimationFrame(render);

      const W   = canvas.width;
      const H   = canvas.height;
      const { zoom } = s;
      const res = resRef.current;
      const ents = entitiesRef.current;
      const selId = selectedIdRef.current;

      const wl = toWx(0); const wr = toWx(W);
      const wt = toWy(0); const wb = toWy(H);

      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = "#282828";
      ctx.fillRect(0, 0, W, H);

      // Grid
      const { fine, coarse } = gridStep(zoom);
      const drawLines = (step: number, colour: string, alpha: number) => {
        ctx.strokeStyle = hex(colour, alpha); ctx.lineWidth = 1; ctx.beginPath();
        for (let wx = Math.floor(wl / step) * step; wx <= wr + step; wx += step) {
          const sx = toSx(wx); ctx.moveTo(sx, 0); ctx.lineTo(sx, H);
        }
        for (let wy = Math.floor(wt / step) * step; wy <= wb + step; wy += step) {
          const sy = toSy(wy); ctx.moveTo(0, sy); ctx.lineTo(W, sy);
        }
        ctx.stroke();
      };
      drawLines(fine, "#383838", 1);
      drawLines(coarse, "#424242", 1);

      // Axes
      const oxS = toSx(0); const oyS = toSy(0);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = "#8FC15399"; ctx.beginPath(); ctx.moveTo(0, oyS); ctx.lineTo(W, oyS); ctx.stroke();
      ctx.strokeStyle = "#569CE499"; ctx.beginPath(); ctx.moveTo(oxS, 0); ctx.lineTo(oxS, H); ctx.stroke();

      // Camera gizmo
      if (res) {
        const gW = res.width * zoom; const gH = res.height * zoom;
        const gx = W / 2 + s.panX - gW / 2; const gy = H / 2 + s.panY - gH / 2;
        ctx.fillStyle = "rgba(0,0,0,0.2)"; ctx.fillRect(gx, gy, gW, gH);
        ctx.strokeStyle = "#4a9effcc"; ctx.lineWidth = 1.5; ctx.strokeRect(gx, gy, gW, gH);
        const cz = Math.min(22, gW * 0.1, gH * 0.1);
        ctx.strokeStyle = "#4a9eff"; ctx.lineWidth = 2.5; ctx.beginPath();
        ctx.moveTo(gx, gy + cz); ctx.lineTo(gx, gy); ctx.lineTo(gx + cz, gy);
        ctx.moveTo(gx + gW - cz, gy); ctx.lineTo(gx + gW, gy); ctx.lineTo(gx + gW, gy + cz);
        ctx.moveTo(gx, gy + gH - cz); ctx.lineTo(gx, gy + gH); ctx.lineTo(gx + cz, gy + gH);
        ctx.moveTo(gx + gW - cz, gy + gH); ctx.lineTo(gx + gW, gy + gH); ctx.lineTo(gx + gW, gy + gH - cz);
        ctx.stroke();
        const label = `${res.width} × ${res.height}`;
        ctx.font = "11px monospace"; ctx.fillStyle = "#4a9effaa";
        ctx.textAlign = "center"; ctx.fillText(label, gx + gW / 2, Math.max(gy - 6, 14));
        ctx.textAlign = "start";
      }

      // ── Draw sprite entities ────────────────────────────────────────
      for (const entity of ents) {
        if (entity.hasCamera) continue; // skip camera entity
        if (!entity.active) continue;

        const cx = toSx(entity.transform.position.x);
        const cy = toSy(entity.transform.position.y);
        const asset = assetsRef.current.find(a => a.id === entity.spriteAssetId);
        const baseW = asset ? Math.min(asset.width, 100) : 60;
        const baseH = asset ? Math.min(asset.height, 100) : 60;
        const hw = (baseW * entity.transform.scale.x * zoom) / 2;
        const hh = (baseH * entity.transform.scale.y * zoom) / 2;

        const isSelected = entity.id === selId;

        if (asset) {
          const img = getCachedImage(asset.url);
          if (img) {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((entity.transform.rotation.z * Math.PI) / 180);
            ctx.drawImage(img, -hw, -hh, hw * 2, hh * 2);
            ctx.restore();
          } else {
            // Placeholder while loading
            ctx.fillStyle = "#444";
            ctx.fillRect(cx - hw, cy - hh, hw * 2, hh * 2);
          }
        } else {
          // No asset: draw placeholder square
          ctx.fillStyle = "#3a3a5a";
          ctx.fillRect(cx - hw, cy - hh, hw * 2, hh * 2);
        }

        // Selection outline
        if (isSelected) {
          ctx.strokeStyle = "#4a9eff";
          ctx.lineWidth = 2;
          ctx.strokeRect(cx - hw, cy - hh, hw * 2, hh * 2);

          // Draw gizmo
          if (toolRef.current === "translate") {
            drawTranslateGizmo(cx, cy);
          } else if (toolRef.current === "scale") {
            drawScaleGizmo(cx, cy, hw, hh);
          }
        }

        // Entity name label
        ctx.font = "10px monospace";
        ctx.fillStyle = isSelected ? "#4a9eff" : "#aaa";
        ctx.textAlign = "center";
        ctx.fillText(entity.name, cx, cy + hh + 13);
        ctx.textAlign = "start";
      }
    };

    render();

    // ── Events ─────────────────────────────────────────────────────────
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY < 0 ? 1.12 : 1 / 1.12;
      const rect   = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left; const my = e.clientY - rect.top;
      const wx = (mx - canvas.width  / 2 - s.panX) / s.zoom;
      const wy = (my - canvas.height / 2 - s.panY) / s.zoom;
      s.zoom = Math.max(0.005, Math.min(80, s.zoom * factor));
      s.panX = mx - canvas.width  / 2 - wx * s.zoom;
      s.panY = my - canvas.height / 2 - wy * s.zoom;
    };

    const onPointerDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mx   = e.clientX - rect.left;
      const my   = e.clientY - rect.top;

      s.down  = true;
      s.lastX = e.clientX;
      s.lastY = e.clientY;

      if (e.button === 1) { s.middle = true; e.preventDefault(); }

      const tool   = toolRef.current;
      const selId2 = selectedIdRef.current;
      const ents2  = entitiesRef.current;

      // Check gizmo hit on selected entity
      if (selId2 && (tool === "translate" || tool === "scale")) {
        const selEntity = ents2.find(e2 => e2.id === selId2);
        if (selEntity) {
          const hit = hitTestGizmo(mx, my, selEntity, tool);
          if (hit) {
            s.dragging = true;
            s.dragHit = hit;
            s.dragEntityId = selEntity.id;
            s.dragStartWx = toWx(mx);
            s.dragStartWy = toWy(my);
            s.dragStartPosX = selEntity.transform.position.x;
            s.dragStartPosY = selEntity.transform.position.y;
            s.dragStartScX = selEntity.transform.scale.x;
            s.dragStartScY = selEntity.transform.scale.y;
            canvas.setPointerCapture(e.pointerId);
            canvas.style.cursor = "crosshair";
            return;
          }
        }
      }

      // Hit test entities for selection (reverse order = front first)
      if (tool !== "pan" && e.button === 0) {
        for (let i = ents2.length - 1; i >= 0; i--) {
          const ent = ents2[i]!;
          if (ent.hasCamera) continue;
          if (hitTestEntity(mx, my, ent)) {
            onSelectRef.current(ent.id);
            canvas.setPointerCapture(e.pointerId);
            return;
          }
        }
        // Click on empty space → deselect
        onSelectRef.current(null);
      }

      if (tool === "pan" || e.button === 1) canvas.style.cursor = "grabbing";
      canvas.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!s.down) return;
      const rect = canvas.getBoundingClientRect();
      const mx   = e.clientX - rect.left;
      const my   = e.clientY - rect.top;

      if (s.dragging && s.dragEntityId && s.dragHit) {
        const wx = toWx(mx); const wy = toWy(my);
        const dwx = wx - s.dragStartWx; const dwy = wy - s.dragStartWy;
        const ent = entitiesRef.current.find(en => en.id === s.dragEntityId);
        if (!ent) return;

        if (s.dragHit === "translate-x") {
          onTransformRef.current(s.dragEntityId, {
            position: { x: s.dragStartPosX + dwx, y: ent.transform.position.y, z: ent.transform.position.z },
          });
        } else if (s.dragHit === "translate-y") {
          onTransformRef.current(s.dragEntityId, {
            position: { x: ent.transform.position.x, y: s.dragStartPosY - dwy, z: ent.transform.position.z },
          });
        } else if (s.dragHit === "translate-xy") {
          onTransformRef.current(s.dragEntityId, {
            position: { x: s.dragStartPosX + dwx, y: s.dragStartPosY - dwy, z: ent.transform.position.z },
          });
        } else if (s.dragHit === "scale-x") {
          const ns = Math.max(0.05, s.dragStartScX + dwx / 50);
          onTransformRef.current(s.dragEntityId, {
            scale: { x: ns, y: ent.transform.scale.y, z: ent.transform.scale.z },
          });
        } else if (s.dragHit === "scale-y") {
          const ns = Math.max(0.05, s.dragStartScY - dwy / 50);
          onTransformRef.current(s.dragEntityId, {
            scale: { x: ent.transform.scale.x, y: ns, z: ent.transform.scale.z },
          });
        } else if (s.dragHit === "scale-xy") {
          const nsx = Math.max(0.05, s.dragStartScX + dwx / 50);
          const nsy = Math.max(0.05, s.dragStartScY - dwy / 50);
          onTransformRef.current(s.dragEntityId, {
            scale: { x: nsx, y: nsy, z: ent.transform.scale.z },
          });
        }
        return;
      }

      if (toolRef.current === "pan" || s.middle) {
        s.panX += e.clientX - s.lastX;
        s.panY += e.clientY - s.lastY;
      }
      s.lastX = e.clientX; s.lastY = e.clientY;
    };

    const onPointerUp = (e: PointerEvent) => {
      s.down = false; s.dragging = false; s.dragHit = null; s.dragEntityId = null;
      if (e.button === 1) s.middle = false;
      canvas.style.cursor = toolRef.current === "pan" ? "grab" : "default";
    };

    // ── Drag-drop from Project panel ───────────────────────────────────
    const onDragOver = (e: DragEvent) => {
      if (e.dataTransfer?.types.includes("application/zen-sprite")) {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
      }
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      const raw = e.dataTransfer?.getData("application/zen-sprite");
      if (!raw) return;
      try {
        const asset = JSON.parse(raw) as SpriteAsset;
        const rect  = canvas.getBoundingClientRect();
        const sx    = e.clientX - rect.left;
        const sy    = e.clientY - rect.top;
        const wx    = toWx(sx);
        const wy    = toWy(sy);
        onDropRef.current(asset, wx, wy);
      } catch { /* ignore */ }
    };

    canvas.addEventListener("wheel",        onWheel,       { passive: false });
    canvas.addEventListener("pointerdown",  onPointerDown);
    canvas.addEventListener("pointermove",  onPointerMove);
    canvas.addEventListener("pointerup",    onPointerUp);
    canvas.addEventListener("dragover",     onDragOver);
    canvas.addEventListener("drop",         onDrop);

    return () => {
      destroyed = true;
      cancelAnimationFrame(rafId);
      observer.disconnect();
      canvas.removeEventListener("wheel",       onWheel);
      canvas.removeEventListener("pointerdown", onPointerDown);
      canvas.removeEventListener("pointermove", onPointerMove);
      canvas.removeEventListener("pointerup",   onPointerUp);
      canvas.removeEventListener("dragover",    onDragOver);
      canvas.removeEventListener("drop",        onDrop);
    };
  }, []); // run once; refs carry live values

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-[#282828]">
      <div className="flex items-center bg-[#282828] border-b border-[#1a1a1a] shrink-0">
        <TabBtn active label="Scene" icon={<Grid size={12} />} />
        <TabBtn active={false} label="Game" icon={<Monitor size={12} />} />
      </div>
      <div ref={wrapperRef} className="flex-1 relative overflow-hidden">
        <canvas ref={canvasRef} className="block" style={{ width: "100%", height: "100%" }} />
      </div>
    </div>
  );
}
