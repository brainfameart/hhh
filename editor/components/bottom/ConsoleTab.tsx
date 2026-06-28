import React from "react";
import { AlertTriangle, Info } from "lucide-react";
import { INITIAL_LOGS } from "../../../shared/constants/data";
import type { ConsoleLog } from "../../../shared/types/engine";

function logIcon(log: ConsoleLog): React.ReactElement {
  switch (log.type) {
    case "error":
      return <AlertTriangle size={12} />;
    case "warn":
      return <AlertTriangle size={12} />;
    case "log":
      return <Info size={12} />;
  }
}

function logClass(type: ConsoleLog["type"]): string {
  switch (type) {
    case "error": return "text-[#ff6b6b]";
    case "warn":  return "text-[#feca57]";
    case "log":   return "text-[#ccc]";
  }
}

export function ConsoleTab(): React.ReactElement {
  const errCount  = INITIAL_LOGS.filter((l) => l.type === "error").length;
  const warnCount = INITIAL_LOGS.filter((l) => l.type === "warn").length;

  return (
    <div className="flex flex-1 flex-col bg-[#282828] overflow-hidden">
      {/* Console toolbar */}
      <div className="h-[22px] flex items-center px-2 bg-[#383838] border-b border-[#202020] gap-2">
        <button className="text-[11px] text-[#ccc] hover:text-[#eee] bg-[#444] hover:bg-[#555] px-2 py-[1px] rounded-[2px] border border-[#202020]">
          Clear
        </button>
        <button className="text-[11px] text-[#ccc] hover:text-[#eee] hover:bg-[#444] px-1 py-[1px] rounded-[2px]">
          Collapse
        </button>
        <button className="text-[11px] text-[#ccc] hover:text-[#eee] hover:bg-[#444] px-1 py-[1px] rounded-[2px]">
          Clear on Play
        </button>
        <div className="flex-1" />
        <div className="flex border border-[#202020] rounded-[2px] overflow-hidden bg-[#2a2a2a] h-[18px]">
          <button className="flex items-center gap-1 px-2 text-[10px] text-[#ccc] border-r border-[#202020] bg-[#444] hover:bg-[#555]">
            <Info size={10} /> 2
          </button>
          <button className="flex items-center gap-1 px-2 text-[10px] text-[#ccc] border-r border-[#202020] bg-[#444] hover:bg-[#555]">
            <AlertTriangle size={10} className="text-[#feca57]" /> {warnCount}
          </button>
          <button className="flex items-center gap-1 px-2 text-[10px] text-[#ccc] bg-[#444] hover:bg-[#555]">
            <AlertTriangle size={10} className="text-[#ff6b6b]" /> {errCount}
          </button>
        </div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto py-1">
        {INITIAL_LOGS.map((log, i) => (
          <div
            key={log.id}
            className={[
              "flex items-start gap-2 px-4 py-1 border-b border-[#202020]",
              "text-[11px] hover:bg-[#333] cursor-pointer",
              logClass(log.type),
            ].join(" ")}
            style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)" }}
          >
            <span className="shrink-0 pt-[2px]">{logIcon(log)}</span>
            <span className="flex-1 font-mono break-all">{log.msg}</span>
            <span className="shrink-0 text-[#555] font-mono">{log.ts}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
